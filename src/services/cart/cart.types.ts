import type { z } from "zod";
import type { cartPreviewRequestSchema } from "./cart.schema";

export type CartPreviewRequest = z.infer<typeof cartPreviewRequestSchema>;

export interface CartItemVariantChoiceDTO {
  id: string;
  label: string;
  available: boolean;
}

export interface CartEvaluatedItemDTO {
  variantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  variantLabel: string;
  productType: "ready_to_wear" | "made_to_order" | "custom_fit";
  unitPriceMinor: number;
  effectiveUnitPriceMinor: number;
  originalUnitPriceMinor: number;
  hasStrikeThrough: boolean;
  qty: number;
  availableStock: number | null;
  lineSubtotalMinor: number;
  lineDiscountMinor: number;
  lineTotalMinor: number;
  leadTimeDays: number | null;
  estimatedReadyDate: string | null;
  depositPercent: number | null;
  imageUrl: string | null;
  categoryName?: string;
  description?: string;
  fabricNotes?: string;
  fitNotes?: string;
  careNotes?: string;
  variants?: CartItemVariantChoiceDTO[];
}

export interface CartPreviewResponseDTO {
  lines: CartEvaluatedItemDTO[];
  subtotalMinor: number;
  itemDiscountTotalMinor: number;
  shippingOriginalMinor: number;
  shippingDiscountMinor: number;
  shippingEffectiveMinor: number;
  discountTotalMinor: number;
  totalMinor: number;
  depositRequiredMinor: number;
  currency: string;
  appliedDiscounts: Array<{
    promotionId: string;
    name: string;
    code: string | null;
    kind: "coupon" | "automatic";
    discountType: "percentage" | "fixed_amount" | "free_shipping";
    amountMinor: number;
  }>;
  couponStatus: {
    code: string | null;
    valid: boolean;
    message: string | null;
  };
  stackingNote: string | null;
  hasMixedLeadTimes: boolean;
  storePaused: boolean;
  storePausedMessage: string;
  shippingOptions: Array<{
    id: string;
    name: string;
    feeMinor: number;
    eta: string;
  }>;
}
