import { z } from "zod";

export const cartPreviewRequestSchema = z.object({
  items: z
    .array(
      z.object({
        variantId: z.string().min(1),
        qty: z.coerce.number().int().min(1).max(20),
      }),
    )
    .default([]),
  couponCode: z.string().nullable().optional(),
  shippingOptionId: z.string().optional(),
});
