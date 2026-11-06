import { requireAdmin } from "@/server/auth";
import { recordAuditLog } from "@/server/audit";
import { getStore } from "@/server/db/client";
import { ApiError, handleRouteError, jsonSuccess } from "@/server/security/http";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdmin();
    const { id } = await context.params;
    const store = getStore();
    const idx = store.mediaAssets.findIndex((a) => a.id === id);
    const asset = store.mediaAssets[idx];
    if (!asset || idx < 0) {
      throw new ApiError(404, "ASSET_NOT_FOUND", "Media asset not found.");
    }

    const usedInProducts = store.products.some((p) =>
      p.images.some((img) => img.url === asset.url),
    );
    const usedInCollections = store.collections.some(
      (c) =>
        c.coverUrl === asset.url ||
        c.items.some((item) => item.imageUrl === asset.url),
    );

    if (usedInProducts || usedInCollections) {
      throw new ApiError(
        409,
        "ASSET_IN_USE",
        "This media asset is currently linked to a product or lookbook and cannot be deleted.",
      );
    }

    store.mediaAssets.splice(idx, 1);

    recordAuditLog({
      actorId: admin.id,
      actorEmail: admin.email,
      actorRole: admin.role,
      action: "media.deleted",
      entity: "media_asset",
      entityId: id,
      summary: `Deleted unused media asset "${asset.altText}"`,
    });

    return jsonSuccess({ id });
  } catch (err) {
    return handleRouteError(err);
  }
}
