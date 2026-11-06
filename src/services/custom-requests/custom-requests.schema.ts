import { z } from "zod";

export const quoteCustomRequestSchema = z.object({
  status: z.enum([
    "new",
    "in_review",
    "quoted",
    "accepted",
    "in_production",
    "ready",
    "delivered",
    "declined",
    "cancelled",
  ]),
  quoteMinor: z.coerce.number().int().min(0).nullable().optional(),
  depositMinor: z.coerce.number().int().min(0).nullable().optional(),
  estimatedCompletion: z.string().nullable().optional(),
  adminNotes: z.string().max(2000).nullable().optional(),
});

export const convertCustomRequestToOrderSchema = z.object({
  shippingOptionId: z.string().min(1),
  deliveryAddress: z.object({
    line1: z.string().min(2),
    city: z.string().min(2),
    state: z.string().min(2),
    country: z.string().min(2),
  }),
});
