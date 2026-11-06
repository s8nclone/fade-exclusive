import type { z } from "zod";
import type { checkoutRequestSchema } from "./checkout.schema";

export type CheckoutRequestInput = z.infer<typeof checkoutRequestSchema>;

export interface CheckoutOrderPlacedDTO {
  orderId: string;
  orderNumber: string;
  referenceCode: string;
  accessToken: string;
  orderUrlPath: string;
  totalMinor: number;
  depositRequiredMinor: number;
  currency: string;
  paymentDueAt: string;
}
