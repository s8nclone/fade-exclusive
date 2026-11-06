import { lookupOrderByNumberAndEmail } from "@/server/domain/orders/orders.domain";
import {
  enforceRateLimit,
  getClientIp,
  verifyTurnstileToken,
} from "@/server/rate-limit";
import { ApiError, handleRouteError, jsonSuccess } from "@/server/security/http";
import { orderLookupSchema } from "@/services/orders/orders.schema";

export async function POST(request: Request) {
  try {
    enforceRateLimit({
      keyPrefix: "order-lookup",
      identifier: getClientIp(request),
      limit: 10,
      windowSeconds: 60,
    });

    const body = await request.json();
    const parsed = orderLookupSchema.parse(body);

    const turnstileOk = await verifyTurnstileToken(parsed.turnstileToken);
    if (!turnstileOk) {
      throw new ApiError(
        400,
        "BOT_VERIFICATION_FAILED",
        "Security check failed. Please try again.",
      );
    }

    const result = lookupOrderByNumberAndEmail({
      orderNumber: parsed.orderNumber,
      email: parsed.email,
    });

    // Generic error message to prevent order/email enumeration (Section 11.6 & 17)
    if (!result) {
      throw new ApiError(
        404,
        "ORDER_LOOKUP_FAILED",
        "No matching order found. Please check your order number and email address.",
      );
    }

    return jsonSuccess({
      accessToken: result.accessToken,
      orderNumber: result.order.orderNumber,
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
