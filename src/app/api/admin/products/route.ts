import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/server/auth";
import { recordAuditLog } from "@/server/audit";
import { getStore } from "@/server/db/client";
import type { SeedProduct } from "@/server/db/seed-data";
import { mapToAdminProductDTO } from "@/server/domain/mappers";
import { ApiError, handleRouteError, jsonSuccess } from "@/server/security/http";
import {
  adminProductListQuerySchema,
  upsertProductSchema,
} from "@/services/products/products.schema";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const url = new URL(request.url);
    const parsed = adminProductListQuerySchema.parse({
      page: url.searchParams.get("page") ?? 1,
      limit: url.searchParams.get("limit") ?? 12,
      status: url.searchParams.get("status") ?? "all",
      q: url.searchParams.get("q") ?? undefined,
      category: url.searchParams.get("category") ?? undefined,
    });

    const store = getStore();
    let filtered = [...store.products].sort((a, b) => a.sortOrder - b.sortOrder);

    if (parsed.status !== "all") {
      filtered = filtered.filter((p) => p.status === parsed.status);
    }
    if (parsed.category) {
      filtered = filtered.filter((p) => p.categoryId === parsed.category);
    }
    if (parsed.q) {
      const qLower = parsed.q.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(qLower) ||
          p.slug.toLowerCase().includes(qLower) ||
          p.variants.some((v) => v.sku.toLowerCase().includes(qLower)),
      );
    }

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / parsed.limit));
    const start = (parsed.page - 1) * parsed.limit;
    const items = filtered
      .slice(start, start + parsed.limit)
      .map(mapToAdminProductDTO);

    return jsonSuccess({
      items,
      total,
      page: parsed.page,
      limit: parsed.limit,
      totalPages,
      categories: store.categories,
    });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const parsed = upsertProductSchema.parse(body);

    const store = getStore();
    if (store.products.some((p) => p.slug === parsed.slug)) {
      throw new ApiError(409, "DUPLICATE_SLUG", "A product with this slug already exists.");
    }

    const category =
      store.categories.find((c) => c.id === parsed.categoryId) ?? store.categories[0];
    if (!category) {
      throw new ApiError(400, "INVALID_CATEGORY", "Invalid category.");
    }

    const nowIso = new Date().toISOString();
    const productId = `prod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    const newProduct: SeedProduct = {
      id: productId,
      name: parsed.name,
      slug: parsed.slug,
      type: parsed.type,
      categoryId: category.id,
      categorySlug: category.slug,
      categoryName: category.name,
      collectionIds: [],
      description: parsed.description,
      priceMinor: parsed.priceMinor,
      compareAtPriceMinor: parsed.compareAtPriceMinor ?? null,
      currency: store.settings.currency,
      leadTimeDays: parsed.type === "made_to_order" ? (parsed.leadTimeDays ?? 14) : null,
      depositPercent:
        parsed.type === "made_to_order" ? (parsed.depositPercent ?? null) : null,
      fabricNotes: parsed.fabricNotes ?? "",
      careNotes: parsed.careNotes ?? "",
      fitNotes: parsed.fitNotes ?? "",
      sizeGuideId: "sg-default",
      status: parsed.status,
      isFeatured: parsed.isFeatured,
      sortOrder: store.products.length + 1,
      seoTitle: parsed.seoTitle || `${parsed.name} | Fadé Exclusive`,
      seoDescription: parsed.seoDescription || parsed.description.slice(0, 155),
      images: parsed.images.map((img, idx) => ({
        id: img.id || `img-${Date.now()}-${idx}`,
        productId,
        url: img.url,
        altText: img.altText,
        sortOrder: img.sortOrder ?? idx + 1,
      })),
      variants: parsed.variants.map((v, idx) => ({
        id: v.id || `var-${Date.now()}-${idx}`,
        productId,
        label: v.label,
        sku: v.sku,
        priceOverrideMinor: v.priceOverrideMinor ?? null,
        stockOnHand: v.stockOnHand,
        lowStockThreshold: v.lowStockThreshold ?? 2,
        sortOrder: v.sortOrder ?? idx + 1,
      })),
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    store.products.unshift(newProduct);

    recordAuditLog({
      actorId: admin.id,
      actorEmail: admin.email,
      actorRole: admin.role,
      action: "product.created",
      entity: "product",
      entityId: newProduct.id,
      summary: `Created product "${newProduct.name}" (${newProduct.slug})`,
      afterJson: { name: newProduct.name, priceMinor: newProduct.priceMinor, status: newProduct.status },
    });

    revalidateTag("products");
    revalidatePath("/shop");
    revalidatePath("/");

    return jsonSuccess(mapToAdminProductDTO(newProduct), { status: 201 });
  } catch (err) {
    return handleRouteError(err);
  }
}
