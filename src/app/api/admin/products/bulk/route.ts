import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/server/auth";
import { recordAuditLog } from "@/server/audit";
import { getStore } from "@/server/db/client";
import { handleRouteError, jsonSuccess } from "@/server/security/http";
import { bulkProductActionSchema } from "@/services/products/products.schema";

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const parsed = bulkProductActionSchema.parse(body);

    const store = getStore();
    const nowIso = new Date().toISOString();
    let updatedCount = 0;

    for (const product of store.products) {
      if (!parsed.productIds.includes(product.id)) continue;

      if (parsed.action === "publish") {
        product.status = "published";
        updatedCount += 1;
      } else if (parsed.action === "unpublish") {
        product.status = "draft";
        updatedCount += 1;
      } else if (parsed.action === "archive") {
        product.status = "archived";
        updatedCount += 1;
      } else if (parsed.action === "change_category" && parsed.categoryId) {
        const cat = store.categories.find((c) => c.id === parsed.categoryId);
        if (cat) {
          product.categoryId = cat.id;
          product.categorySlug = cat.slug;
          product.categoryName = cat.name;
          updatedCount += 1;
        }
      }
      product.updatedAt = nowIso;
    }

    recordAuditLog({
      actorId: admin.id,
      actorEmail: admin.email,
      actorRole: admin.role,
      action: `product.bulk_${parsed.action}`,
      entity: "product",
      entityId: parsed.productIds.join(","),
      summary: `Bulk action "${parsed.action}" on ${updatedCount} product(s)`,
    });

    revalidateTag("products");
    revalidatePath("/shop");
    revalidatePath("/");

    return jsonSuccess({ updatedCount });
  } catch (err) {
    return handleRouteError(err);
  }
}
