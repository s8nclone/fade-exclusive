import { requireAdmin } from "@/server/auth";
import { getStore } from "@/server/db/client";
import { handleRouteError, jsonSuccess } from "@/server/security/http";

export async function GET() {
  try {
    await requireAdmin();
    const store = getStore();
    return jsonSuccess(
      store.forms.map((f) => ({
        ...f,
        fields: [...f.fields].sort((a, b) => a.sortOrder - b.sortOrder),
      })),
    );
  } catch (err) {
    return handleRouteError(err);
  }
}
