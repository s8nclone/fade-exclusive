import { getEnv } from "@/lib/env";
import { buildAdminReceiptShareWhatsAppLink } from "@/lib/whatsapp";
import { requireAdmin } from "@/server/auth";
import { mapToAdminOrderDTO } from "@/server/domain/mappers";
import { confirmOrderPayment } from "@/server/domain/orders/orders.domain";
import { handleRouteError, jsonSuccess } from "@/server/security/http";
import { confirmPaymentSchema } from "@/services/orders/orders.schema";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdmin();
    const { id } = await context.params;
    const body = await request.json();
    const parsed = confirmPaymentSchema.parse(body);

    const { order, payment, receipt, receiptToken } = confirmOrderPayment({
      orderId: id,
      amountMinor: parsed.amountMinor,
      kind: parsed.kind,
      bankReference: parsed.bankReference,
      notes: parsed.notes,
      actor: admin,
    });

    const env = getEnv();
    const receiptUrl = `${env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")}/receipt/${receiptToken}`;
    const whatsappShareUrl = buildAdminReceiptShareWhatsAppLink({
      customerPhone: order.customerPhone,
      customerName: order.customerName,
      orderNumber: order.orderNumber,
      receiptNumber: receipt.receiptNumber,
      amountMinor: payment.amountMinor,
      currency: order.currency,
      receiptUrl,
    });

    return jsonSuccess({
      order: mapToAdminOrderDTO(order),
      receiptNumber: receipt.receiptNumber,
      receiptToken,
      whatsappShareUrl,
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
