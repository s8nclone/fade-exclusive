import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/server/auth";
import { recordAuditLog } from "@/server/audit";
import { getStore } from "@/server/db/client";
import type { SeedProduct } from "@/server/db/seed-data";
import { mapToAdminProductDTO } from "@/server/domain/mappers";
import { ApiError, handleRouteError, jsonSuccess } from "@/server/security/http";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdmin();
    const { id } = await context.params;
    const store = getStore();
    const source = store.products.find((p) => p.id === id);
    if (!source) {
      throw new ApiError(404, "PRODUCT_NOT_FOUND", "Source product not found.");
    }

    const nowIso = new Date().toISOString();
    const newId = `prod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const copySuffix = Math.random().toString(36).slice(2, 6);

    const duplicated: SeedProduct = {
      ...structuredClone(source),
      id: newId,
      name: `${source.name} (Copy)`,
      slug: `${source.slug}-copy-${copySuffix}`,
      status: "draft",
      isFeatured: false,
      images: source.images.map((img, idx) => ({
        ...img,
        id: `img-${Date.now()}-${idx}`,
        productId: newId,
      })),
      variants: source.variants.map((v, idx) => ({
        ...v,
        id: `var-${Date.now()}-${idx}`,
        productId: newId,
        sku: `${v.sku}-${copySuffix.toUpperCase()}`,
      })),
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    store.products.unshift(duplicated);

    recordAuditLog({
      actorId: admin.id,
      actorEmail: admin.email,
      actorRole: admin.role,
      action: "product.duplicated",
      entity: "product",
      entityId: duplicated.id,
      summary: `Duplicated product "${source.name}" -> "${duplicated.name}"`,
    });

    revalidateTag("products");
    revalidatePath("/shop");

    return jsonSuccess(mapToAdminProductDTO(duplicated), { status: 201 });
  } catch (err) {
    return handleRouteError(err);
  }
}
