import { getStore } from "@/server/db/client";
import { handleRouteError, jsonSuccess } from "@/server/security/http";

export async function GET() {
  try {
    const store = getStore();
    const now = new Date();
    const activeBanners = store.banners
      .filter((b) => {
        if (!b.isActive) return false;
        if (b.startsAt && new Date(b.startsAt).getTime() > now.getTime()) return false;
        if (b.endsAt && new Date(b.endsAt).getTime() < now.getTime()) return false;
        return true;
      })
      .sort((a, b) => b.priority - a.priority);

    return jsonSuccess(activeBanners);
  } catch (err) {
    return handleRouteError(err);
  }
}
