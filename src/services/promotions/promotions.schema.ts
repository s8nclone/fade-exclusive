import { z } from "zod";

export const upsertPromotionSchema = z
  .object({
    name: z.string().min(2, "Promotion name is required").max(140),
    kind: z.enum(["coupon", "automatic"]),
    code: z
      .string()
      .max(40)
      .nullable()
      .optional()
      .transform((v) => (v ? v.trim().toUpperCase() : null)),
    discountType: z.enum(["percentage", "fixed_amount", "free_shipping"]),
    value: z.coerce.number().int().min(1, "Discount value must be at least 1"),
    scope: z.enum(["order", "products", "categories", "collections"]).default("order"),
    targetIds: z.array(z.string()).default([]),
    eligibleProductTypes: z
      .array(z.enum(["ready_to_wear", "made_to_order"]))
      .min(1, "Select at least one eligible product type")
      .default(["ready_to_wear", "made_to_order"]),
    minOrderMinor: z.coerce.number().int().min(0).nullable().optional(),
    maxDiscountMinor: z.coerce.number().int().min(0).nullable().optional(),
    usageLimitTotal: z.coerce.number().int().min(1).nullable().optional(),
    usageLimitPerCustomer: z.coerce.number().int().min(1).nullable().optional(),
    startsAt: z.string().nullable().optional(),
    endsAt: z.string().nullable().optional(),
    isActive: z.boolean().default(true),
    stackable: z.boolean().default(false),
    excludeDiscountedItems: z.boolean().default(false),
  })
  .refine(
    (data) => {
      if (data.kind === "coupon") {
        return Boolean(data.code && data.code.length >= 3);
      }
      return true;
    },
    {
      message: "Coupon promotions require a coupon code (at least 3 characters)",
      path: ["code"],
    },
  );
