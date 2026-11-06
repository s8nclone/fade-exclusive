import { requireAdmin } from "@/server/auth";
import { recordAuditLog } from "@/server/audit";
import { getStore } from "@/server/db/client";
import type { SeedPromotion } from "@/server/db/seed-data";
import { mapToPromotionAdminDTO } from "@/server/domain/mappers";
import { ApiError, handleRouteError, jsonSuccess } from "@/server/security/http";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdmin();
    const { id } = await context.params;
    const store = getStore();
    const source = store.promotions.find((p) => p.id === id);
    if (!source) {
      throw new ApiError(404, "PROMOTION_NOT_FOUND", "Promotion not found.");
    }

    const nowIso = new Date().toISOString();
    const suffix = Math.random().toString(36).slice(2, 5).toUpperCase();
    const copy: SeedPromotion = {
      ...structuredClone(source),
      id: `promo-${Date.now()}-${suffix.toLowerCase()}`,
      name: `${source.name} (Copy)`,
      code: source.code ? `${source.code}${suffix}` : null,
      isActive: false,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    store.promotions.unshift(copy);

    recordAuditLog({
      actorId: admin.id,
      actorEmail: admin.email,
      actorRole: admin.role,
      action: "promotion.duplicated",
      entity: "promotion",
      entityId: copy.id,
      summary: `Duplicated promotion "${source.name}" -> "${copy.name}"`,
    });

    return jsonSuccess(mapToPromotionAdminDTO(copy), { status: 201 });
  } catch (err) {
    return handleRouteError(err);
  }
}
