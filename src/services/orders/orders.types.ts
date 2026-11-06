import type { z } from "zod";
import type {
  adminOrderListQuerySchema,
  confirmPaymentSchema,
  customerPaymentSubmittedSchema,
  orderLookupSchema,
  updateOrderStatusSchema,
} from "./orders.schema";
import type { AdminPaginated } from "@/services/products/products.types";

export type OrderLookupInput = z.infer<typeof orderLookupSchema>;
export type CustomerPaymentSubmittedInput = z.infer<typeof customerPaymentSubmittedSchema>;
export type AdminOrderListQuery = z.infer<typeof adminOrderListQuerySchema>;
export type ConfirmPaymentInput = z.infer<typeof confirmPaymentSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

export interface PublicOrderDTO {
  id: string;
  orderNumber: string;
  referenceCode: string;
  status: string;
  customerName: string;
  customerEmailMasked: string;
  deliveryCityState: string;
  shippingOption: {
    name: string;
    feeMinor: number;
    eta: string;
  };
  subtotalMinor: number;
  discountTotalMinor: number;
  shippingMinor: number;
  totalMinor: number;
  depositRequiredMinor: number;
  amountPaidMinor: number;
  amountDueMinor: number;
  currency: string;
  paymentDueAt: string;
  createdAt: string;
  items: Array<{
    id: string;
    productName: string;
    productSlug: string;
    variantLabel: string;
    productType: "ready_to_wear" | "made_to_order" | "custom_fit";
    unitPriceMinor: number;
    qty: number;
    lineSubtotalMinor: number;
    lineDiscountMinor: number;
    lineTotalMinor: number;
    leadTimeDays: number | null;
    imageUrl: string | null;
  }>;
  discounts: Array<{
    name: string;
    code: string | null;
    amountMinor: number;
  }>;
  history: Array<{
    fromStatus: string | null;
    toStatus: string;
    createdAt: string;
    note: string | null;
  }>;
  bankAccounts: Array<{
    id: string;
    label: string;
    bankName: string;
    accountName: string;
    accountNumber: string;
    instructions: string;
  }>;
  whatsappLink: string;
  latestReceiptToken: string | null;
}

export interface PublicReceiptDTO {
  receiptNumber: string;
  issuedAt: string;
  orderNumber: string;
  referenceCode: string;
  customerName: string;
  customerEmail: string;
  paymentKind: "full" | "deposit" | "balance";
  paymentMethod: string;
  amountConfirmedMinor: number;
  orderTotalMinor: number;
  totalPaidMinor: number;
  balanceRemainingMinor: number;
  currency: string;
  bankReference: string | null;
  businessName: string;
  businessAddress: string;
  businessEmail: string;
  items: PublicOrderDTO["items"];
  discounts: PublicOrderDTO["discounts"];
  shippingMinor: number;
}

export interface AdminOrderDTO {
  id: string;
  orderNumber: string;
  referenceCode: string;
  accessTokenForPreview: string;
  status: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode?: string;
    country: string;
  };
  shippingOption: {
    id: string;
    name: string;
    feeMinor: number;
    eta: string;
  };
  subtotalMinor: number;
  discountTotalMinor: number;
  shippingMinor: number;
  totalMinor: number;
  depositRequiredMinor: number;
  amountPaidMinor: number;
  amountDueMinor: number;
  currency: string;
  paymentDueAt: string;
  customerNotes: string | null;
  extraFields: Record<string, unknown>;
  internalNotes: string | null;
  receiptAssetUrl: string | null;
  source: "storefront" | "custom_fit";
  allowedNextStatuses: string[];
  items: PublicOrderDTO["items"];
  discounts: PublicOrderDTO["discounts"];
  history: Array<{
    id: string;
    fromStatus: string | null;
    toStatus: string;
    actor: string;
    note: string | null;
    createdAt: string;
  }>;
  payments: Array<{
    id: string;
    kind: "full" | "deposit" | "balance";
    amountMinor: number;
    status: string;
    confirmedBy: string | null;
    confirmedAt: string | null;
    bankReference: string | null;
    notes: string | null;
  }>;
  receipts: Array<{
    id: string;
    receiptNumber: string;
    token: string;
    issuedAt: string;
    whatsappShareUrl: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export type AdminOrderListResponse = AdminPaginated<AdminOrderDTO>;
