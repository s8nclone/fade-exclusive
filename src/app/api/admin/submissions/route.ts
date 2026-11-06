import { requireAdmin } from "@/server/auth";
import { getStore } from "@/server/db/client";
import { handleRouteError, jsonSuccess } from "@/server/security/http";

export async function GET() {
  try {
    await requireAdmin();
    const store = getStore();
    return jsonSuccess(store.formSubmissions);
  } catch (err) {
    return handleRouteError(err);
  }
}
