import { placeGuestOrder } from "@/server/domain/orders/orders.domain";
import {
  enforceRateLimit,
  getClientIp,
  verifyTurnstileToken,
} from "@/server/rate-limit";
import { ApiError, handleRouteError, jsonSuccess } from "@/server/security/http";
import { checkoutRequestSchema } from "@/services/checkout/checkout.schema";

export async function POST(request: Request) {
  try {
    enforceRateLimit({
      keyPrefix: "checkout-submit",
      identifier: getClientIp(request),
      limit: 12,
      windowSeconds: 60,
    });

    const body = await request.json();
    const headerIdempotencyKey = request.headers.get("Idempotency-Key");
    const parsed = checkoutRequestSchema.parse({
      ...body,
      idempotencyKey: headerIdempotencyKey || body.idempotencyKey,
    });

    const turnstileOk = await verifyTurnstileToken(parsed.turnstileToken);
    if (!turnstileOk) {
      throw new ApiError(
        400,
        "BOT_VERIFICATION_FAILED",
        "Security verification failed. Please refresh and try again.",
      );
    }

    const { order, accessToken } = placeGuestOrder({
      idempotencyKey: parsed.idempotencyKey,
      items: parsed.items,
      couponCode: parsed.couponCode,
      shippingOptionId: parsed.shippingOptionId,
      customerName: parsed.customerName,
      customerEmail: parsed.customerEmail,
      customerPhone: parsed.customerPhone,
      deliveryAddress: parsed.deliveryAddress,
      customerNotes: parsed.customerNotes,
      extraFields: parsed.extraFields,
    });

    return jsonSuccess(
      {
        orderId: order.id,
        orderNumber: order.orderNumber,
        referenceCode: order.referenceCode,
        accessToken,
        orderUrlPath: `/order/${accessToken}`,
        totalMinor: order.totalMinor,
        depositRequiredMinor: order.depositRequiredMinor,
        currency: order.currency,
        paymentDueAt: order.paymentDueAt,
      },
      { status: 201 },
    );
  } catch (err) {
    return handleRouteError(err);
  }
}
