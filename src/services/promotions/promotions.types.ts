import type { z } from "zod";
import type { upsertPromotionSchema } from "./promotions.schema";

export type UpsertPromotionInput = z.infer<typeof upsertPromotionSchema>;

export interface PromotionAdminDTO {
  id: string;
  name: string;
  kind: "coupon" | "automatic";
  code: string | null;
  discountType: "percentage" | "fixed_amount" | "free_shipping";
  value: number;
  scope: "order" | "products" | "categories" | "collections";
  targetIds: string[];
  eligibleProductTypes: Array<"ready_to_wear" | "made_to_order">;
  minOrderMinor: number | null;
  maxDiscountMinor: number | null;
  usageLimitTotal: number | null;
  usageLimitPerCustomer: number | null;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
  stackable: boolean;
  excludeDiscountedItems: boolean;
  redemptionsCount: number;
  totalDiscountGivenMinor: number;
  computedStatus: "active" | "scheduled" | "expired" | "disabled";
  updatedAt: string;
}
