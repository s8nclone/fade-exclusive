import { http } from "@/lib/http/axios";
import type { ApiSuccess } from "@/lib/http/errors";
import type { CheckoutOrderPlacedDTO, CheckoutRequestInput } from "./checkout.types";

export const checkoutService = {
  placeOrder: async (input: CheckoutRequestInput) =>
    (
      await http.post<ApiSuccess<CheckoutOrderPlacedDTO>>("/public/checkout", input, {
        headers: {
          "Idempotency-Key": input.idempotencyKey,
        },
      })
    ).data.data,
};
