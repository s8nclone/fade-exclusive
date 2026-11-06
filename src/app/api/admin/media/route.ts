import { requireAdmin } from "@/server/auth";
import { getStore } from "@/server/db/client";
import { handleRouteError, jsonSuccess } from "@/server/security/http";

export async function GET() {
  try {
    await requireAdmin();
    const store = getStore();

    const items = store.mediaAssets.map((asset) => {
      const usedInProducts = store.products.filter((p) =>
        p.images.some((img) => img.url === asset.url),
      ).length;
      const usedInCollections = store.collections.filter(
        (c) =>
          c.coverUrl === asset.url ||
          c.items.some((item) => item.imageUrl === asset.url),
      ).length;

      return {
        ...asset,
        inUseCount: usedInProducts + usedInCollections,
      };
    });

    return jsonSuccess(items);
  } catch (err) {
    return handleRouteError(err);
  }
}
