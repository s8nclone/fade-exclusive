import { getStore } from "@/server/db/client";
import { handleRouteError, jsonSuccess } from "@/server/security/http";

export async function GET() {
  try {
    const store = getStore();
    const items = [...store.pressItems].sort((a, b) => a.sortOrder - b.sortOrder);
    return jsonSuccess(items);
  } catch (err) {
    return handleRouteError(err);
  }
}
