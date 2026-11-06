import { requireAdmin } from "@/server/auth";
import { getStore } from "@/server/db/client";
import { handleRouteError, jsonSuccess } from "@/server/security/http";

export async function GET() {
  try {
    await requireAdmin();
    const store = getStore();
    return jsonSuccess({
      pages: store.contentPages,
      pressItems: [...store.pressItems].sort((a, b) => a.sortOrder - b.sortOrder),
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
