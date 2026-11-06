import { mapToPublicOrderDTO } from "@/server/domain/mappers";
import {
  findOrderByAccessToken,
  markPaymentSubmittedByCustomer,
} from "@/server/domain/orders/orders.domain";
import { enforceRateLimit, getClientIp } from "@/server/rate-limit";
import { ApiError, handleRouteError, jsonSuccess } from "@/server/security/http";
import { customerPaymentSubmittedSchema } from "@/services/orders/orders.schema";

export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await context.params;
    const order = findOrderByAccessToken(token);
    if (!order) {
      throw new ApiError(404, "ORDER_NOT_FOUND", "Order link is invalid or has expired.");
    }
    return jsonSuccess(mapToPublicOrderDTO(order), {
      headers: {
        "X-Robots-Tag": "noindex, nofollow",
        "Referrer-Policy": "no-referrer",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err) {
    return handleRouteError(err);
  }
}

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
