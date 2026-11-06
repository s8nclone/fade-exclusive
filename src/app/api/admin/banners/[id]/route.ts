import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/server/auth";
import { recordAuditLog } from "@/server/audit";
import { getStore } from "@/server/db/client";
import { ApiError, handleRouteError, jsonSuccess } from "@/server/security/http";
import { upsertBannerSchema } from "@/services/banners/banners.schema";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdmin();
    const { id } = await context.params;
    const body = await request.json();
    const parsed = upsertBannerSchema.partial().parse(body);

    const store = getStore();
    const banner = store.banners.find((b) => b.id === id);
    if (!banner) {
      throw new ApiError(404, "BANNER_NOT_FOUND", "Banner not found.");
    }

    const before = { ...banner };

    if (parsed.type !== undefined) banner.type = parsed.type;
    if (parsed.title !== undefined) banner.title = parsed.title;
    if (parsed.subtitle !== undefined) banner.subtitle = parsed.subtitle;
    if (parsed.ctaLabel !== undefined) banner.ctaLabel = parsed.ctaLabel;
    if (parsed.ctaUrl !== undefined) banner.ctaUrl = parsed.ctaUrl;
    if (parsed.backgroundColor !== undefined)
      banner.backgroundColor = parsed.backgroundColor;
    if (parsed.textColor !== undefined) banner.textColor = parsed.textColor;
    if (parsed.buttonBgColor !== undefined) banner.buttonBgColor = parsed.buttonBgColor;
    if (parsed.buttonTextColor !== undefined)
      banner.buttonTextColor = parsed.buttonTextColor;
    if (parsed.imageUrl !== undefined) banner.imageUrl = parsed.imageUrl;
    if (parsed.imageAlt !== undefined) banner.imageAlt = parsed.imageAlt;
    if (parsed.placement !== undefined) banner.placement = parsed.placement;
    if (parsed.priority !== undefined) banner.priority = parsed.priority;
    if (parsed.startsAt !== undefined) banner.startsAt = parsed.startsAt;
    if (parsed.endsAt !== undefined) banner.endsAt = parsed.endsAt;
    if (parsed.isActive !== undefined) banner.isActive = parsed.isActive;
    if (parsed.dismissible !== undefined) banner.dismissible = parsed.dismissible;
    if (parsed.linkedPromotionId !== undefined) {
      const promo = store.promotions.find((p) => p.id === parsed.linkedPromotionId);
      banner.linkedPromotionId = promo?.id ?? null;
      banner.linkedCouponCode = promo?.code ?? null;
    }

    banner.version += 1;
    banner.updatedAt = new Date().toISOString();

    recordAuditLog({
      actorId: admin.id,
      actorEmail: admin.email,
      actorRole: admin.role,
      action: "banner.updated",
      entity: "banner",
      entityId: banner.id,
      summary: `Updated banner "${banner.title.slice(0, 40)}" (v${banner.version})`,
      beforeJson: before,
      afterJson: banner,
    });

    revalidatePath("/");
    revalidatePath("/shop");

    return jsonSuccess(banner);
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdmin();
    const { id } = await context.params;
    const store = getStore();
    const idx = store.banners.findIndex((b) => b.id === id);
    if (idx < 0) {
      throw new ApiError(404, "BANNER_NOT_FOUND", "Banner not found.");
    }
    const [removed] = store.banners.splice(idx, 1);

    recordAuditLog({
      actorId: admin.id,
      actorEmail: admin.email,
      actorRole: admin.role,
      action: "banner.deleted",
      entity: "banner",
      entityId: id,
      summary: `Deleted banner "${removed?.title ?? id}"`,
    });

    revalidatePath("/");
    revalidatePath("/shop");

    return jsonSuccess({ id });
  } catch (err) {
    return handleRouteError(err);
  }
}
