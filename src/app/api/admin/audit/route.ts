import { requireAdmin } from "@/server/auth";
import { getStore } from "@/server/db/client";
import { handleRouteError, jsonSuccess } from "@/server/security/http";
import { auditLogListQuerySchema } from "@/services/audit/audit.schema";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const url = new URL(request.url);
    const parsed = auditLogListQuerySchema.parse({
      page: url.searchParams.get("page") ?? 1,
      limit: url.searchParams.get("limit") ?? 25,
      entity: url.searchParams.get("entity") ?? undefined,
      q: url.searchParams.get("q") ?? undefined,
    });

    const store = getStore();
    let logs = [...store.auditLogs];

    if (parsed.entity && parsed.entity !== "all") {
      logs = logs.filter((l) => l.entity === parsed.entity);
    }
    if (parsed.q) {
      const qLower = parsed.q.toLowerCase();
      logs = logs.filter(
        (l) =>
          l.summary.toLowerCase().includes(qLower) ||
          l.actorEmail.toLowerCase().includes(qLower) ||
          l.action.toLowerCase().includes(qLower),
      );
    }

    const total = logs.length;
    const totalPages = Math.max(1, Math.ceil(total / parsed.limit));
    const start = (parsed.page - 1) * parsed.limit;
    const items = logs.slice(start, start + parsed.limit);

    return jsonSuccess({
      items,
      total,
      page: parsed.page,
      limit: parsed.limit,
      totalPages,
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
