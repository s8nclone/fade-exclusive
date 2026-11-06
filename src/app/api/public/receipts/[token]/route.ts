import { mapToPublicReceiptDTO } from "@/server/domain/mappers";
import { findReceiptByToken } from "@/server/domain/orders/orders.domain";
import { ApiError, handleRouteError, jsonSuccess } from "@/server/security/http";

export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await context.params;
    const found = findReceiptByToken(token);
    if (!found) {
      throw new ApiError(404, "RECEIPT_NOT_FOUND", "Official receipt link is invalid.");
    }
    return jsonSuccess(mapToPublicReceiptDTO(found), {
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
