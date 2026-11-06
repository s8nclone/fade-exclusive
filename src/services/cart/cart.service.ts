import { http } from "@/lib/http/axios";
import type { ApiSuccess } from "@/lib/http/errors";
import type { CartPreviewRequest, CartPreviewResponseDTO } from "./cart.types";

export const cartService = {
  preview: async (input: CartPreviewRequest) =>
    (await http.post<ApiSuccess<CartPreviewResponseDTO>>("/public/cart/preview", input))
      .data.data,
};
