import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/server/auth";
import { recordAuditLog } from "@/server/audit";
import { getStore } from "@/server/db/client";
import type { SeedBanner } from "@/server/db/seed-data";
import { handleRouteError, jsonSuccess } from "@/server/security/http";
import { upsertBannerSchema } from "@/services/banners/banners.schema";

export async function GET() {
  try {
    await requireAdmin();
    const store = getStore();
    const sorted = [...store.banners].sort((a, b) => b.priority - a.priority);
    return jsonSuccess(sorted);
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const parsed = upsertBannerSchema.parse(body);

    const store = getStore();
    const linkedPromo = parsed.linkedPromotionId
      ? store.promotions.find((p) => p.id === parsed.linkedPromotionId)
      : null;

    const newBanner: SeedBanner = {
      id: `ban-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: parsed.type,
      title: parsed.title,
      subtitle: parsed.subtitle ?? null,
      ctaLabel: parsed.ctaLabel ?? null,
      ctaUrl: parsed.ctaUrl ?? null,
      backgroundColor: parsed.backgroundColor,
      textColor: parsed.textColor,
      buttonBgColor: parsed.buttonBgColor,
      buttonTextColor: parsed.buttonTextColor,
      imageUrl: parsed.imageUrl ?? null,
      imageAlt: parsed.imageAlt ?? null,
      placement: parsed.placement,
      priority: parsed.priority,
      startsAt: parsed.startsAt ?? null,
      endsAt: parsed.endsAt ?? null,
      isActive: parsed.isActive,
      dismissible: parsed.dismissible,
      version: 1,
      linkedPromotionId: linkedPromo?.id ?? null,
      linkedCouponCode: linkedPromo?.code ?? null,
      updatedAt: new Date().toISOString(),
    };

    store.banners.unshift(newBanner);

    recordAuditLog({
      actorId: admin.id,
      actorEmail: admin.email,
      actorRole: admin.role,
      action: "banner.created",
      entity: "banner",
      entityId: newBanner.id,
      summary: `Created ${newBanner.type} banner "${newBanner.title.slice(0, 40)}"`,
      afterJson: newBanner,
    });

    revalidatePath("/");
    revalidatePath("/shop");

    return jsonSuccess(newBanner, { status: 201 });
  } catch (err) {
    return handleRouteError(err);
  }
}
