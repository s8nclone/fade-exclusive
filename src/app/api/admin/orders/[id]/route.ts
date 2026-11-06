import { requireAdmin } from "@/server/auth";
import { getStore } from "@/server/db/client";
import { mapToAdminOrderDTO } from "@/server/domain/mappers";
import { transitionOrderStatusByAdmin } from "@/server/domain/orders/orders.domain";
import { ApiError, handleRouteError, jsonSuccess } from "@/server/security/http";
import { updateOrderStatusSchema } from "@/services/orders/orders.schema";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdmin();
    const { id } = await context.params;
    const body = await request.json();
    const parsed = updateOrderStatusSchema.parse(body);

    const store = getStore();
    const order = store.orders.find((o) => o.id === id);
    if (!order) {
      throw new ApiError(404, "ORDER_NOT_FOUND", "Order not found.");
    }

    if (parsed.internalNotes !== undefined) {
      order.internalNotes = parsed.internalNotes.trim() || null;
    }

    const updated = transitionOrderStatusByAdmin({
      orderId: id,
      toStatus: parsed.toStatus,
      note: parsed.note,
      actor: admin,
    });

    return jsonSuccess(mapToAdminOrderDTO(updated));
  } catch (err) {
    return handleRouteError(err);
  }
}
