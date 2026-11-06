import { mapToPublicOrderDTO } from "@/server/domain/mappers";
import { markPaymentSubmittedByCustomer } from "@/server/domain/orders/orders.domain";
import { enforceRateLimit, getClientIp } from "@/server/rate-limit";
import { handleRouteError, jsonSuccess } from "@/server/security/http";
import { customerPaymentSubmittedSchema } from "@/services/orders/orders.schema";

export async function POST(
  request: Request,
  context: { params: Promise<{ token: string }> },
) {
  try {
    enforceRateLimit({
      keyPrefix: "order-payment-submitted",
      identifier: getClientIp(request),
      limit: 8,
      windowSeconds: 60,
    });

    const { token } = await context.params;
    const body = await request.json();
    const parsed = customerPaymentSubmittedSchema.parse(body);

    const updated = markPaymentSubmittedByCustomer({
      rawToken: token,
      bankReference: parsed.bankReference,
      receiptAssetUrl: parsed.receiptAssetUrl,
      note: parsed.note,
    });

    return jsonSuccess(mapToPublicOrderDTO(updated));
  } catch (err) {
    return handleRouteError(err);
  }
}
