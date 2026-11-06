import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/server/auth";
import { recordAuditLog } from "@/server/audit";
import { getStore } from "@/server/db/client";
import { mapToPromotionAdminDTO } from "@/server/domain/mappers";
import { ApiError, handleRouteError, jsonSuccess } from "@/server/security/http";
import type { UpsertPromotionInput } from "@/services/promotions/promotions.types";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdmin();
    const { id } = await context.params;
    const body = (await request.json()) as Partial<UpsertPromotionInput>;

    const store = getStore();
    const promo = store.promotions.find((p) => p.id === id);
    if (!promo) {
      throw new ApiError(404, "PROMOTION_NOT_FOUND", "Promotion not found.");
    }

    const beforeSnapshot = { ...promo };

    if (body.name !== undefined) promo.name = body.name;
    if (body.kind !== undefined) promo.kind = body.kind;
    if (body.code !== undefined) {
      promo.code = body.code ? body.code.trim().toUpperCase() : null;
    }
    if (body.discountType !== undefined) promo.discountType = body.discountType;
    if (body.value !== undefined) promo.value = Number(body.value);
    if (body.scope !== undefined) promo.scope = body.scope;
    if (body.targetIds !== undefined) promo.targetIds = body.targetIds;
    if (body.eligibleProductTypes !== undefined)
      promo.eligibleProductTypes = body.eligibleProductTypes;
    if (body.minOrderMinor !== undefined) promo.minOrderMinor = body.minOrderMinor;
    if (body.maxDiscountMinor !== undefined)
      promo.maxDiscountMinor = body.maxDiscountMinor;
    if (body.usageLimitTotal !== undefined) promo.usageLimitTotal = body.usageLimitTotal;
    if (body.usageLimitPerCustomer !== undefined)
      promo.usageLimitPerCustomer = body.usageLimitPerCustomer;
    if (body.startsAt !== undefined) promo.startsAt = body.startsAt;
    if (body.endsAt !== undefined) promo.endsAt = body.endsAt;
    if (body.isActive !== undefined) promo.isActive = body.isActive;
    if (body.stackable !== undefined) promo.stackable = body.stackable;
    if (body.excludeDiscountedItems !== undefined)
      promo.excludeDiscountedItems = body.excludeDiscountedItems;

    promo.updatedAt = new Date().toISOString();

    recordAuditLog({
      actorId: admin.id,
      actorEmail: admin.email,
      actorRole: admin.role,
      action: "promotion.updated",
      entity: "promotion",
      entityId: promo.id,
      summary: `Updated promotion "${promo.name}" (active: ${promo.isActive})`,
      beforeJson: beforeSnapshot,
      afterJson: promo,
    });

    revalidateTag("products");
    revalidatePath("/shop");
    revalidatePath("/");

    return jsonSuccess(mapToPromotionAdminDTO(promo));
  } catch (err) {
    return handleRouteError(err);
  }
}
