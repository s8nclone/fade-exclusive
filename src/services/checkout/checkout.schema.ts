import { z } from "zod";

export const checkoutRequestSchema = z.object({
  idempotencyKey: z.string().min(6, "Idempotency key is required"),
  items: z
    .array(
      z.object({
        variantId: z.string().min(1),
        qty: z.coerce.number().int().min(1).max(20),
      }),
    )
    .min(1, "Your shopping bag is empty"),
  couponCode: z.string().nullable().optional(),
  shippingOptionId: z.string().min(1, "Please select a shipping method"),
  customerName: z.string().min(2, "Full name is required").max(120),
  customerEmail: z.string().email("Please enter a valid email address"),
  customerPhone: z.string().min(6, "Phone number is required").max(30),
  deliveryAddress: z.object({
    line1: z.string().min(3, "Street address is required"),
    line2: z.string().optional(),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State / Province is required"),
    postalCode: z.string().optional(),
    country: z.string().min(2, "Country is required"),
  }),
  customerNotes: z.string().max(1000).optional(),
  extraFields: z.record(z.unknown()).optional(),
  acceptedTerms: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms and policies to place an order" }),
  }),
  turnstileToken: z.string().optional(),
});
