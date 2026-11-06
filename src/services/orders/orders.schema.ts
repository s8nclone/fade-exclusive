import { z } from "zod";

export const orderLookupSchema = z.object({
  orderNumber: z.string().min(3, "Order number is required").max(40),
  email: z.string().email("Valid email address is required"),
  turnstileToken: z.string().optional(),
});

export const customerPaymentSubmittedSchema = z.object({
  bankReference: z.string().max(100).optional(),
  receiptAssetUrl: z.string().optional(),
  note: z.string().max(500).optional(),
});

export const adminOrderListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(15),
  status: z.string().default("all"),
  q: z.string().optional(),
});

export const confirmPaymentSchema = z.object({
  amountMinor: z.coerce.number().int().min(100, "Amount must be greater than zero"),
  kind: z.enum(["full", "deposit", "balance"]).default("full"),
  bankReference: z.string().max(120).optional(),
  notes: z.string().max(1000).optional(),
});

export const updateOrderStatusSchema = z.object({
  toStatus: z.enum([
    "awaiting_payment",
    "payment_submitted",
    "paid",
    "deposit_paid",
    "in_production",
    "ready",
    "shipped",
    "ready_for_pickup",
    "delivered",
    "cancelled",
    "expired",
    "refunded",
  ]),
  note: z.string().max(1000).optional(),
  internalNotes: z.string().max(2000).optional(),
});
