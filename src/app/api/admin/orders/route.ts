import { requireAdmin } from "@/server/auth";
import { getStore } from "@/server/db/client";
import { mapToAdminOrderDTO } from "@/server/domain/mappers";
import { expireOverdueOrders } from "@/server/domain/orders/orders.domain";
import { handleRouteError, jsonSuccess } from "@/server/security/http";
import { adminOrderListQuerySchema } from "@/services/orders/orders.schema";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    expireOverdueOrders();

    const url = new URL(request.url);
    const parsed = adminOrderListQuerySchema.parse({
      page: url.searchParams.get("page") ?? 1,
      limit: url.searchParams.get("limit") ?? 15,
      status: url.searchParams.get("status") ?? "all",
      q: url.searchParams.get("q") ?? undefined,
    });

    const store = getStore();
    let filtered = [...store.orders];

    if (parsed.status && parsed.status !== "all") {
      filtered = filtered.filter((o) => o.status === parsed.status);
    }

    if (parsed.q) {
      const qLower = parsed.q.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(qLower) ||
          o.referenceCode.toLowerCase().includes(qLower) ||
          o.customerName.toLowerCase().includes(qLower) ||
          o.customerEmail.toLowerCase().includes(qLower) ||
          o.customerPhone.toLowerCase().includes(qLower),
      );
    }

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / parsed.limit));
    const start = (parsed.page - 1) * parsed.limit;
    const items = filtered
      .slice(start, start + parsed.limit)
      .map(mapToAdminOrderDTO);

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
