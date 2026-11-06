import { requireAdmin } from "@/server/auth";
import { getStore } from "@/server/db/client";
import { mapToCustomRequestAdminDTO } from "@/server/domain/mappers";
import { handleRouteError, jsonSuccess } from "@/server/security/http";

export async function GET() {
  try {
    await requireAdmin();
    const store = getStore();
    return jsonSuccess(store.customRequests.map(mapToCustomRequestAdminDTO));
  } catch (err) {
    return handleRouteError(err);
  }
}
