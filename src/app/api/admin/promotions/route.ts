import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/server/auth";
import { recordAuditLog } from "@/server/audit";
import { getStore } from "@/server/db/client";
import type { SeedPromotion } from "@/server/db/seed-data";
import { mapToPromotionAdminDTO } from "@/server/domain/mappers";
import { sendTransactionalEmail } from "@/server/email";
import { ApiError, handleRouteError, jsonSuccess } from "@/server/security/http";
import { upsertPromotionSchema } from "@/services/promotions/promotions.schema";

export async function GET() {
  try {
    await requireAdmin();
    const store = getStore();
    const items = store.promotions.map((p) => mapToPromotionAdminDTO(p));
    return jsonSuccess(items);
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const parsed = upsertPromotionSchema.parse(body);

    const store = getStore();
    if (
      parsed.kind === "coupon" &&
      parsed.code &&
      store.promotions.some(
        (p) => p.code?.toUpperCase() === parsed.code?.toUpperCase(),
      )
    ) {
      throw new ApiError(
        409,
        "DUPLICATE_COUPON_CODE",
        `Coupon code "${parsed.code}" already exists.`,
      );
    }

    const nowIso = new Date().toISOString();
    const promo: SeedPromotion = {
      id: `promo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: parsed.name,
      kind: parsed.kind,
      code: parsed.kind === "coupon" ? (parsed.code ?? null) : null,
      discountType: parsed.discountType,
      value: parsed.value,
      scope: parsed.scope,
      targetIds: parsed.targetIds,
      eligibleProductTypes: parsed.eligibleProductTypes,
      minOrderMinor: parsed.minOrderMinor ?? null,
      maxDiscountMinor: parsed.maxDiscountMinor ?? null,
      usageLimitTotal: parsed.usageLimitTotal ?? null,
      usageLimitPerCustomer: parsed.usageLimitPerCustomer ?? null,
      startsAt: parsed.startsAt ?? null,
      endsAt: parsed.endsAt ?? null,
      isActive: parsed.isActive,
      stackable: parsed.stackable,
      excludeDiscountedItems: parsed.excludeDiscountedItems,
      linkedBannerId: null,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    store.promotions.unshift(promo);

    recordAuditLog({
      actorId: admin.id,
      actorEmail: admin.email,
      actorRole: admin.role,
      action: "promotion.created",
      entity: "promotion",
      entityId: promo.id,
      summary: `Created ${promo.kind} promotion "${promo.name}"${promo.code ? ` (${promo.code})` : ""}`,
      afterJson: promo,
    });

    // Alert owner if active promotion exceeds large discount threshold (Section 11.8)
    const threshold = store.settings.largeDiscountAlertThresholdPercent || 25;
    if (
      promo.isActive &&
      promo.discountType === "percentage" &&
      promo.value >= threshold
    ) {
      void sendTransactionalEmail({
        to: store.settings.contactEmail,
        subject: `[Security Alert] High-Value Promotion Created (${promo.value}% OFF)`,
        text: `Staff member ${admin.email} created an active promotion "${promo.name}" offering ${promo.value}% off (above ${threshold}% alert threshold).`,
        html: `<p>Staff member <strong>${admin.email}</strong> created an active promotion <strong>${promo.name}</strong> offering <strong>${promo.value}% off</strong>.</p>`,
      });
    }

    revalidateTag("products");
    revalidatePath("/shop");
    revalidatePath("/");

    return jsonSuccess(mapToPromotionAdminDTO(promo), { status: 201 });
  } catch (err) {
    return handleRouteError(err);
  }
}
