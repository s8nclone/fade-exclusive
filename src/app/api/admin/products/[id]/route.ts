import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/server/auth";
import { recordAuditLog } from "@/server/audit";
import { getStore } from "@/server/db/client";
import { mapToAdminProductDTO } from "@/server/domain/mappers";
import { ApiError, handleRouteError, jsonSuccess } from "@/server/security/http";
import { upsertProductSchema } from "@/services/products/products.schema";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdmin();
    const { id } = await context.params;
    const body = await request.json();
    const parsed = upsertProductSchema.partial().parse(body);

    const store = getStore();
    const product = store.products.find((p) => p.id === id);
    if (!product) {
      throw new ApiError(404, "PRODUCT_NOT_FOUND", "Product not found.");
    }

    if (
      parsed.slug &&
      parsed.slug !== product.slug &&
      store.products.some((p) => p.id !== id && p.slug === parsed.slug)
    ) {
      throw new ApiError(409, "DUPLICATE_SLUG", "Another product already uses this slug.");
    }

    const beforeSnapshot = {
      name: product.name,
      status: product.status,
      priceMinor: product.priceMinor,
      isFeatured: product.isFeatured,
    };

    if (parsed.name !== undefined) product.name = parsed.name;
    if (parsed.slug !== undefined) product.slug = parsed.slug;
    if (parsed.type !== undefined) product.type = parsed.type;
    if (parsed.categoryId !== undefined) {
      const cat = store.categories.find((c) => c.id === parsed.categoryId);
      if (cat) {
        product.categoryId = cat.id;
        product.categorySlug = cat.slug;
        product.categoryName = cat.name;
      }
    }
    if (parsed.description !== undefined) product.description = parsed.description;
    if (parsed.priceMinor !== undefined) product.priceMinor = parsed.priceMinor;
    if (parsed.compareAtPriceMinor !== undefined)
      product.compareAtPriceMinor = parsed.compareAtPriceMinor;
    if (parsed.leadTimeDays !== undefined) product.leadTimeDays = parsed.leadTimeDays;
    if (parsed.depositPercent !== undefined) product.depositPercent = parsed.depositPercent;
    if (parsed.fabricNotes !== undefined) product.fabricNotes = parsed.fabricNotes;
    if (parsed.careNotes !== undefined) product.careNotes = parsed.careNotes;
    if (parsed.fitNotes !== undefined) product.fitNotes = parsed.fitNotes;
    if (parsed.status !== undefined) product.status = parsed.status;
    if (parsed.isFeatured !== undefined) product.isFeatured = parsed.isFeatured;
    if (parsed.seoTitle !== undefined) product.seoTitle = parsed.seoTitle;
    if (parsed.seoDescription !== undefined) product.seoDescription = parsed.seoDescription;

    if (parsed.images) {
      product.images = parsed.images.map((img, idx) => ({
        id: img.id || `img-${Date.now()}-${idx}`,
        productId: product.id,
        url: img.url,
        altText: img.altText,
        sortOrder: img.sortOrder ?? idx + 1,
      }));
    }

    if (parsed.variants) {
      product.variants = parsed.variants.map((v, idx) => ({
        id: v.id || `var-${Date.now()}-${idx}`,
        productId: product.id,
        label: v.label,
        sku: v.sku,
        priceOverrideMinor: v.priceOverrideMinor ?? null,
        stockOnHand: v.stockOnHand,
        lowStockThreshold: v.lowStockThreshold ?? 2,
        sortOrder: v.sortOrder ?? idx + 1,
      }));
    }

    product.updatedAt = new Date().toISOString();

    recordAuditLog({
      actorId: admin.id,
      actorEmail: admin.email,
      actorRole: admin.role,
      action: "product.updated",
      entity: "product",
      entityId: product.id,
      summary: `Updated product "${product.name}"`,
      beforeJson: beforeSnapshot,
      afterJson: {
        name: product.name,
        status: product.status,
        priceMinor: product.priceMinor,
        isFeatured: product.isFeatured,
      },
    });

    revalidateTag("products");
    revalidatePath(`/shop/${product.slug}`);
    revalidatePath("/shop");
    revalidatePath("/");

    return jsonSuccess(mapToAdminProductDTO(product));
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdmin();
    const { id } = await context.params;
    const url = new URL(request.url);
    const permanent = url.searchParams.get("permanent") === "true";

    const store = getStore();
    const idx = store.products.findIndex((p) => p.id === id);
    const product = store.products[idx];
    if (!product || idx < 0) {
      throw new ApiError(404, "PRODUCT_NOT_FOUND", "Product not found.");
    }

    const hasOrders = store.orders.some((o) =>
      o.items.some((i) => i.productId === product.id),
    );

    if (permanent) {
      // Section 13: Permanent deletion is owner-only and only allowed for never-ordered products
      if (admin.role !== "owner") {
        throw new ApiError(
          403,
          "OWNER_REQUIRED",
          "Only the owner can permanently delete products.",
        );
      }
      if (hasOrders) {
        throw new ApiError(
          409,
          "PRODUCT_HAS_ORDERS",
          "This product has historical orders and cannot be permanently deleted. It has been archived instead.",
        );
      }

      store.products.splice(idx, 1);
      recordAuditLog({
        actorId: admin.id,
        actorEmail: admin.email,
        actorRole: admin.role,
        action: "product.permanently_deleted",
        entity: "product",
        entityId: product.id,
        summary: `Permanently deleted never-ordered product "${product.name}"`,
      });

      revalidateTag("products");
      revalidatePath("/shop");
      revalidatePath("/");

      return jsonSuccess({ id: product.id, mode: "deleted" as const });
    }

    // Default safe delete: archive product
    product.status = "archived";
    product.updatedAt = new Date().toISOString();

    recordAuditLog({
      actorId: admin.id,
      actorEmail: admin.email,
      actorRole: admin.role,
      action: "product.archived",
      entity: "product",
      entityId: product.id,
      summary: `Archived product "${product.name}"`,
    });

    revalidateTag("products");
    revalidatePath(`/shop/${product.slug}`);
    revalidatePath("/shop");
    revalidatePath("/");

    return jsonSuccess({ id: product.id, mode: "archived" as const });
  } catch (err) {
    return handleRouteError(err);
  }
}
