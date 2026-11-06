import "server-only";
import { getStore } from "@/server/db/client";
import type { SeedOrder, SeedPayment, SeedReceipt } from "@/server/db/seed-data";
import {
  generateAccessToken,
  generateOrderNumber,
  generateReferenceCode,
  hashCustomerIdentifier,
  hashToken,
} from "@/server/security/crypto";
import { ApiError } from "@/server/security/http";
import { calculateOrderPricing, type PricingLineInput } from "@/server/domain/pricing/pricing.domain";
import { recordAuditLog } from "@/server/audit";
import {
  buildOrderPlacedEmail,
  buildPaymentConfirmedEmail,
  sendTransactionalEmail,
} from "@/server/email";
import { getEnv } from "@/lib/env";
import { normalizePhoneE164 } from "@/lib/phone";
import type { CountryCode } from "libphonenumber-js";

export type OrderStatus = SeedOrder["status"];

/**
 * Explicit server-enforced Order State Machine (Section 11.3):
 * awaiting_payment -> payment_submitted (optional) -> paid (or deposit_paid)
 * -> in_production (made-to-order/custom) -> ready -> shipped or ready_for_pickup -> delivered.
 * Side/terminal states: cancelled, expired, refunded.
 */
export const ALLOWED_ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  awaiting_payment: [
    "payment_submitted",
    "paid",
    "deposit_paid",
    "cancelled",
    "expired",
  ],
  payment_submitted: [
    "paid",
    "deposit_paid",
    "awaiting_payment",
    "cancelled",
    "expired",
  ],
  deposit_paid: ["paid", "in_production", "ready", "cancelled", "refunded"],
  paid: [
    "in_production",
    "ready",
    "shipped",
    "ready_for_pickup",
    "delivered",
    "cancelled",
    "refunded",
  ],
  in_production: ["ready", "shipped", "ready_for_pickup", "cancelled", "refunded"],
  ready: ["shipped", "ready_for_pickup", "delivered", "cancelled", "refunded"],
  shipped: ["delivered", "refunded"],
  ready_for_pickup: ["delivered", "refunded"],
  delivered: ["refunded"],
  cancelled: [],
  expired: [],
  refunded: [],
};

export function canTransitionOrderStatus(from: OrderStatus, to: OrderStatus): boolean {
  return ALLOWED_ORDER_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertValidOrderTransition(from: OrderStatus, to: OrderStatus): void {
  if (!canTransitionOrderStatus(from, to)) {
    throw new ApiError(
      409,
      "INVALID_STATUS_TRANSITION",
      `Illegal order status transition from "${from}" to "${to}".`,
    );
  }
}

/**
 * PaymentMethod abstraction (Section 11.7):
 * manual_transfer is the v1 implementation; future gateway adapters implement this contract.
 */
export interface PaymentMethodAdapter {
  readonly method: "manual_transfer";
  prepareOrderInstructions(order: SeedOrder): {
    referenceCode: string;
    paymentDueAt: string;
    amountDueMinor: number;
  };
}

export const manualTransferPaymentAdapter: PaymentMethodAdapter = {
  method: "manual_transfer",
  prepareOrderInstructions(order) {
    return {
      referenceCode: order.referenceCode,
      paymentDueAt: order.paymentDueAt,
      amountDueMinor: Math.max(0, order.depositRequiredMinor - order.amountPaidMinor),
    };
  },
};

export function getActiveReservedQtyForVariant(
  variantId: string,
  now: Date = new Date(),
): number {
  const store = getStore();
  let sum = 0;
  for (const res of store.stockReservations) {
    if (
      res.variantId === variantId &&
      !res.releasedAt &&
      !res.consumedAt &&
      new Date(res.expiresAt).getTime() > now.getTime()
    ) {
      sum += res.qty;
    }
  }
  return sum;
}

export function getAvailableVariantStock(
  variantId: string,
  stockOnHand: number,
  now: Date = new Date(),
): number {
  const reserved = getActiveReservedQtyForVariant(variantId, now);
  return Math.max(0, stockOnHand - reserved);
}

/**
 * Lazily and via cron expires overdue unpaid orders, releasing stock reservations
 * and promotion redemptions (Section 11.5 & 11.8).
 */
export function expireOverdueOrders(now: Date = new Date()): {
  expiredCount: number;
  expiredOrderNumbers: string[];
} {
  const store = getStore();
  const nowIso = now.toISOString();
  const expiredOrderNumbers: string[] = [];

  for (const order of store.orders) {
    if (
      (order.status === "awaiting_payment" || order.status === "payment_submitted") &&
      new Date(order.paymentDueAt).getTime() <= now.getTime()
    ) {
      const prevStatus = order.status;
      order.status = "expired";
      order.updatedAt = nowIso;
      order.history.push({
        id: `osh-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        orderId: order.id,
        fromStatus: prevStatus,
        toStatus: "expired",
        actor: "system:expiry-engine",
        note: "Payment window elapsed; stock reservations and coupon redemptions released.",
        createdAt: nowIso,
      });

      // Release stock reservations
      for (const res of store.stockReservations) {
        if (res.orderId === order.id && !res.releasedAt && !res.consumedAt) {
          res.releasedAt = nowIso;
        }
      }

      // Release promotion redemptions
      for (const red of store.promotionRedemptions) {
        if (red.orderId === order.id && !red.releasedAt) {
          red.releasedAt = nowIso;
        }
      }

      expiredOrderNumbers.push(order.orderNumber);
    }
  }

  return {
    expiredCount: expiredOrderNumbers.length,
    expiredOrderNumbers,
  };
}

export function getPromotionUsageContext(customerEmail?: string | null) {
  const store = getStore();
  const totalRedemptionsByPromoId: Record<string, number> = {};
  const customerRedemptionsByPromoId: Record<string, number> = {};
  const customerHash = customerEmail ? hashCustomerIdentifier(customerEmail) : null;

  for (const red of store.promotionRedemptions) {
    if (red.releasedAt) continue;
    totalRedemptionsByPromoId[red.promotionId] =
      (totalRedemptionsByPromoId[red.promotionId] ?? 0) + 1;
    if (customerHash && red.customerIdentifierHash === customerHash) {
      customerRedemptionsByPromoId[red.promotionId] =
        (customerRedemptionsByPromoId[red.promotionId] ?? 0) + 1;
    }
  }

  return {
    now: new Date(),
    totalRedemptionsByPromoId,
    customerRedemptionsByPromoId,
  };
}

export function buildPricingLinesFromCartItems(
  items: Array<{ variantId: string; qty: number }>,
): PricingLineInput[] {
  const store = getStore();
  const lines: PricingLineInput[] = [];

  for (const reqItem of items) {
    if (reqItem.qty <= 0) continue;
    let foundProduct = null;
    let foundVariant = null;
    for (const prod of store.products) {
      if (prod.status !== "published") continue;
      const v = prod.variants.find((variant) => variant.id === reqItem.variantId);
      if (v) {
        foundProduct = prod;
        foundVariant = v;
        break;
      }
    }
    if (!foundProduct || !foundVariant) {
      throw new ApiError(
        400,
        "ITEM_UNAVAILABLE",
        "One or more items in your bag are no longer available.",
      );
    }

    const unitPriceMinor = foundVariant.priceOverrideMinor ?? foundProduct.priceMinor;
    lines.push({
      variantId: foundVariant.id,
      productId: foundProduct.id,
      productName: foundProduct.name,
      productSlug: foundProduct.slug,
      variantLabel: foundVariant.label,
      productType: foundProduct.type,
      categoryId: foundProduct.categoryId,
      collectionIds: foundProduct.collectionIds,
      unitPriceMinor,
      compareAtPriceMinor: foundProduct.compareAtPriceMinor,
      qty: reqItem.qty,
      leadTimeDays: foundProduct.leadTimeDays,
      depositPercent: foundProduct.depositPercent,
      imageUrl: foundProduct.images[0]?.url ?? null,
    });
  }

  return lines;
}

export interface PlaceGuestOrderInput {
  idempotencyKey: string;
  items: Array<{ variantId: string; qty: number }>;
  couponCode?: string | null;
  shippingOptionId: string;
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
  customerNotes?: string | null;
  extraFields?: Record<string, unknown>;
}

export function placeGuestOrder(input: PlaceGuestOrderInput): {
  order: SeedOrder;
  accessToken: string;
  isDuplicateIdempotent: boolean;
} {
  expireOverdueOrders();
  const store = getStore();

  // 1. Check idempotency key first so retries never create duplicate orders
  const existingOrder = store.orders.find(
    (o) => o.idempotencyKey === input.idempotencyKey,
  );
  if (existingOrder) {
    return {
      order: existingOrder,
      accessToken: existingOrder.rawTokenForDemo ?? "",
      isDuplicateIdempotent: true,
    };
  }

  // 2. Check if store is paused
  if (store.settings.storePaused) {
    throw new ApiError(
      403,
      "STORE_PAUSED",
      store.settings.storePausedMessage ||
        "Orders are temporarily paused while our atelier fulfills current commissions.",
    );
  }

  if (input.items.length === 0) {
    throw new ApiError(400, "EMPTY_CART", "Your shopping bag is empty.");
  }

  // 3. Validate shipping option
  const shippingOption = store.settings.shippingOptions.find(
    (s) => s.id === input.shippingOptionId && s.isActive,
  );
  if (!shippingOption) {
    throw new ApiError(400, "INVALID_SHIPPING_OPTION", "Please select a valid shipping method.");
  }

  // 4. Normalize phone number
  const normalizedPhone = normalizePhoneE164(
    input.customerPhone,
    (store.settings.defaultPhoneCountry as CountryCode) || "NG",
  );
  if (!normalizedPhone) {
    throw new ApiError(
      400,
      "INVALID_PHONE",
      "Please enter a valid phone number including country/area code.",
      { customerPhone: ["Invalid phone number format."] },
    );
  }

  // 5. Build pricing lines and check stock availability for ready-to-wear items
  const now = new Date();
  const lines = buildPricingLinesFromCartItems(input.items);

  for (const line of lines) {
    if (line.productType === "ready_to_wear") {
      const prod = store.products.find((p) => p.id === line.productId);
      const variant = prod?.variants.find((v) => v.id === line.variantId);
      const stockOnHand = variant?.stockOnHand ?? 0;
      const available = getAvailableVariantStock(line.variantId, stockOnHand, now);
      if (available < line.qty) {
        throw new ApiError(
          409,
          "OUT_OF_STOCK",
          `Insufficient stock for "${line.productName} (${line.variantLabel})". Only ${available} remaining.`,
        );
      }
    }
  }

  // 6. Run pricing engine
  const usage = getPromotionUsageContext(input.customerEmail);
  const pricing = calculateOrderPricing({
    lines,
    promotions: store.promotions,
    couponCode: input.couponCode,
    shippingFeeMinor: shippingOption.feeMinor,
    usage,
  });

  if (input.couponCode && !pricing.couponStatus.valid) {
    throw new ApiError(
      400,
      "INVALID_COUPON",
      pricing.couponStatus.message || "Invalid or expired coupon code.",
    );
  }

  // 7. Create Order, Reserve Stock, and Record Promotion Redemptions
  const nowIso = now.toISOString();
  const paymentWindowHours = store.settings.paymentWindowHours || 48;
  const paymentDueAt = new Date(
    now.getTime() + paymentWindowHours * 60 * 60 * 1000,
  ).toISOString();

  const orderId = `ord-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const orderNumber = generateOrderNumber(store.settings.orderPrefix || "FD");
  const referenceCode = generateReferenceCode(store.settings.orderPrefix || "FD", 6);
  const rawAccessToken = generateAccessToken();
  const accessTokenHash = hashToken(rawAccessToken);

  const newOrder: SeedOrder = {
    id: orderId,
    orderNumber,
    referenceCode,
    rawTokenForDemo: rawAccessToken,
    accessTokenHash,
    idempotencyKey: input.idempotencyKey,
    status: "awaiting_payment",
    customerName: input.customerName.trim(),
    customerEmail: input.customerEmail.trim().toLowerCase(),
    customerPhone: normalizedPhone,
    deliveryAddress: input.deliveryAddress,
    shippingOption: {
      id: shippingOption.id,
      name: shippingOption.name,
      feeMinor: shippingOption.feeMinor,
      eta: shippingOption.eta,
    },
    subtotalMinor: pricing.subtotalMinor,
    discountTotalMinor: pricing.discountTotalMinor,
    shippingMinor: pricing.shippingEffectiveMinor,
    totalMinor: pricing.totalMinor,
    depositRequiredMinor: pricing.depositRequiredMinor,
    amountPaidMinor: 0,
    currency: store.settings.currency,
    paymentDueAt,
    customerNotes: input.customerNotes?.trim() || null,
    extraFields: input.extraFields ?? {},
    internalNotes: null,
    receiptAssetUrl: null,
    source: "storefront",
    items: pricing.lines.map((line, idx) => ({
      id: `oi-${Date.now()}-${idx}`,
      orderId,
      productId: line.productId,
      variantId: line.variantId,
      productName: line.productName,
      productSlug: line.productSlug,
      variantLabel: line.variantLabel,
      productType: line.productType,
      unitPriceMinor: line.unitPriceMinor,
      qty: line.qty,
      lineSubtotalMinor: line.lineSubtotalMinor,
      lineDiscountMinor: line.lineDiscountMinor,
      lineTotalMinor: line.lineTotalMinor,
      leadTimeDays: line.leadTimeDays,
      depositPercent: line.depositPercent,
      imageUrl: line.imageUrl,
    })),
    discounts: pricing.appliedDiscounts.map((d, idx) => ({
      id: `od-${Date.now()}-${idx}`,
      orderId,
      promotionId: d.promotionId,
      name: d.name,
      code: d.code,
      kind: d.kind,
      discountType: d.discountType,
      amountMinor: d.amountMinor,
    })),
    history: [
      {
        id: `osh-${Date.now()}-init`,
        orderId,
        fromStatus: null,
        toStatus: "awaiting_payment",
        actor: "customer",
        note: "Order placed via guest checkout.",
        createdAt: nowIso,
      },
    ],
    payments: [],
    receipts: [],
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  // Reserve stock for ready-to-wear lines
  for (const line of pricing.lines) {
    if (line.productType === "ready_to_wear") {
      store.stockReservations.push({
        id: `res-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        orderId,
        variantId: line.variantId,
        qty: line.qty,
        expiresAt: paymentDueAt,
        releasedAt: null,
        consumedAt: null,
        createdAt: nowIso,
      });
    }
  }

  // Record promotion redemptions
  const customerIdHash = hashCustomerIdentifier(newOrder.customerEmail);
  for (const applied of pricing.appliedDiscounts) {
    store.promotionRedemptions.push({
      id: `red-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      promotionId: applied.promotionId,
      orderId,
      customerIdentifierHash: customerIdHash,
      amountMinor: applied.amountMinor,
      releasedAt: null,
      createdAt: nowIso,
    });
  }

  store.orders.unshift(newOrder);

  // Send transactional email asynchronously (never blocks order creation)
  const env = getEnv();
  const orderUrl = `${env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")}/order/${rawAccessToken}`;
  const emailContent = buildOrderPlacedEmail({
    customerName: newOrder.customerName,
    orderNumber: newOrder.orderNumber,
    referenceCode: newOrder.referenceCode,
    totalMinor: newOrder.totalMinor,
    depositRequiredMinor: newOrder.depositRequiredMinor,
    currency: newOrder.currency,
    orderUrl,
    paymentWindowHours,
  });
  void sendTransactionalEmail({
    to: newOrder.customerEmail,
    ...emailContent,
  });

  return {
    order: newOrder,
    accessToken: rawAccessToken,
    isDuplicateIdempotent: false,
  };
}

export function findOrderByAccessToken(rawToken: string): SeedOrder | null {
  expireOverdueOrders();
  const store = getStore();
  const targetHash = hashToken(rawToken);
  return store.orders.find((o) => o.accessTokenHash === targetHash) ?? null;
}

export function lookupOrderByNumberAndEmail(params: {
  orderNumber: string;
  email: string;
}): { order: SeedOrder; accessToken: string } | null {
  expireOverdueOrders();
  const store = getStore();
  const normalizedNum = params.orderNumber.trim().toUpperCase();
  const normalizedEmail = params.email.trim().toLowerCase();

  const order = store.orders.find(
    (o) =>
      o.orderNumber.toUpperCase() === normalizedNum &&
      o.customerEmail.toLowerCase() === normalizedEmail,
  );
  if (!order) return null;

  // Ensure a usable token is available for redirect
  if (!order.rawTokenForDemo) {
    const freshToken = generateAccessToken();
    order.rawTokenForDemo = freshToken;
    order.accessTokenHash = hashToken(freshToken);
  }

  return {
    order,
    accessToken: order.rawTokenForDemo,
  };
}

export function markPaymentSubmittedByCustomer(params: {
  rawToken: string;
  bankReference?: string | null;
  receiptAssetUrl?: string | null;
  note?: string | null;
}): SeedOrder {
  const order = findOrderByAccessToken(params.rawToken);
  if (!order) {
    throw new ApiError(404, "ORDER_NOT_FOUND", "Order not found.");
  }

  if (order.status !== "awaiting_payment" && order.status !== "payment_submitted") {
    throw new ApiError(
      409,
      "INVALID_STATUS_TRANSITION",
      `Payment notification cannot be submitted when order is in "${order.status}" status.`,
    );
  }

  const nowIso = new Date().toISOString();
  const prevStatus = order.status;
  order.status = "payment_submitted";
  if (params.receiptAssetUrl) {
    order.receiptAssetUrl = params.receiptAssetUrl;
  }
  order.updatedAt = nowIso;
  order.history.push({
    id: `osh-${Date.now()}`,
    orderId: order.id,
    fromStatus: prevStatus,
    toStatus: "payment_submitted",
    actor: "customer",
    note:
      params.note?.trim() ||
      (params.bankReference
        ? `Customer submitted payment notification (Ref: ${params.bankReference}).`
        : "Customer marked bank transfer as sent."),
    createdAt: nowIso,
  });

  return order;
}

export function confirmOrderPayment(params: {
  orderId: string;
  amountMinor: number;
  kind?: "full" | "deposit" | "balance";
  bankReference?: string | null;
  notes?: string | null;
  actor: { id: string; email: string; role: string };
}): { order: SeedOrder; payment: SeedPayment; receipt: SeedReceipt; receiptToken: string } {
  const store = getStore();
  const order = store.orders.find((o) => o.id === params.orderId);
  if (!order) {
    throw new ApiError(404, "ORDER_NOT_FOUND", "Order not found.");
  }

  if (params.amountMinor <= 0) {
    throw new ApiError(400, "INVALID_AMOUNT", "Confirmed payment amount must be positive.");
  }

  const newAmountPaid = order.amountPaidMinor + params.amountMinor;
  const targetStatus: OrderStatus =
    newAmountPaid >= order.totalMinor ? "paid" : "deposit_paid";

  if (order.status !== targetStatus) {
    assertValidOrderTransition(order.status, targetStatus);
  }

  const nowIso = new Date().toISOString();
  const paymentKind: "full" | "deposit" | "balance" =
    params.kind ??
    (newAmountPaid >= order.totalMinor
      ? order.amountPaidMinor > 0
        ? "balance"
        : "full"
      : "deposit");

  const payment: SeedPayment = {
    id: `pay-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    orderId: order.id,
    kind: paymentKind,
    method: "manual_transfer",
    amountMinor: params.amountMinor,
    currency: order.currency,
    status: "confirmed",
    confirmedBy: params.actor.email,
    confirmedAt: nowIso,
    bankReference: params.bankReference?.trim() || null,
    receiptAssetUrl: order.receiptAssetUrl,
    notes: params.notes?.trim() || null,
    createdAt: nowIso,
  };

  const rawReceiptToken = generateAccessToken();
  const receiptNumber = `RCP-${order.orderNumber}-${order.receipts.length + 1}`;
  const receipt: SeedReceipt = {
    id: `rec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    orderId: order.id,
    paymentId: payment.id,
    receiptNumber,
    rawTokenForDemo: rawReceiptToken,
    tokenHash: hashToken(rawReceiptToken),
    issuedAt: nowIso,
  };

  // Convert active stock reservations into permanent stock decrements on first confirmed payment
  for (const res of store.stockReservations) {
    if (res.orderId === order.id && !res.releasedAt && !res.consumedAt) {
      res.consumedAt = nowIso;
      for (const prod of store.products) {
        const variant = prod.variants.find((v) => v.id === res.variantId);
        if (variant) {
          variant.stockOnHand = Math.max(0, variant.stockOnHand - res.qty);
        }
      }
    }
  }

  const prevStatus = order.status;
  order.amountPaidMinor = newAmountPaid;
  order.status = targetStatus;
  order.updatedAt = nowIso;
  order.payments.push(payment);
  order.receipts.push(receipt);

  order.history.push({
    id: `osh-${Date.now()}-pay`,
    orderId: order.id,
    fromStatus: prevStatus,
    toStatus: targetStatus,
    actor: params.actor.email,
    note:
      params.notes?.trim() ||
      `Payment confirmed (${receiptNumber})${params.bankReference ? ` — Bank Ref: ${params.bankReference}` : ""}.`,
    createdAt: nowIso,
  });

  recordAuditLog({
    actorId: params.actor.id,
    actorEmail: params.actor.email,
    actorRole: params.actor.role,
    action: "order.payment_confirmed",
    entity: "order",
    entityId: order.id,
    summary: `Confirmed payment for Order ${order.orderNumber} (${receiptNumber})`,
    beforeJson: { status: prevStatus, amountPaidMinor: newAmountPaid - params.amountMinor },
    afterJson: { status: targetStatus, amountPaidMinor: newAmountPaid, receiptNumber },
  });

  const env = getEnv();
  const baseUrl = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const receiptUrl = `${baseUrl}/receipt/${rawReceiptToken}`;
  const orderUrl = `${baseUrl}/order/${order.rawTokenForDemo ?? ""}`;

  const emailContent = buildPaymentConfirmedEmail({
    customerName: order.customerName,
    orderNumber: order.orderNumber,
    receiptNumber,
    amountMinor: params.amountMinor,
    currency: order.currency,
    receiptUrl,
    orderUrl,
  });
  void sendTransactionalEmail({
    to: order.customerEmail,
    ...emailContent,
  });

  return { order, payment, receipt, receiptToken: rawReceiptToken };
}

export function transitionOrderStatusByAdmin(params: {
  orderId: string;
  toStatus: OrderStatus;
  note?: string | null;
  actor: { id: string; email: string; role: string };
}): SeedOrder {
  const store = getStore();
  const order = store.orders.find((o) => o.id === params.orderId);
  if (!order) {
    throw new ApiError(404, "ORDER_NOT_FOUND", "Order not found.");
  }

  const prevStatus = order.status;
  if (prevStatus === params.toStatus) {
    return order;
  }

  assertValidOrderTransition(prevStatus, params.toStatus);

  const nowIso = new Date().toISOString();
  order.status = params.toStatus;
  order.updatedAt = nowIso;

  // If cancelled or expired, release any unconsumed stock reservations and promotion redemptions
  if (params.toStatus === "cancelled" || params.toStatus === "expired") {
    for (const res of store.stockReservations) {
      if (res.orderId === order.id && !res.releasedAt && !res.consumedAt) {
        res.releasedAt = nowIso;
      }
    }
    for (const red of store.promotionRedemptions) {
      if (red.orderId === order.id && !red.releasedAt) {
        red.releasedAt = nowIso;
      }
    }
  }

  order.history.push({
    id: `osh-${Date.now()}`,
    orderId: order.id,
    fromStatus: prevStatus,
    toStatus: params.toStatus,
    actor: params.actor.email,
    note: params.note?.trim() || `Status updated to ${params.toStatus}.`,
    createdAt: nowIso,
  });

  recordAuditLog({
    actorId: params.actor.id,
    actorEmail: params.actor.email,
    actorRole: params.actor.role,
    action: "order.status_changed",
    entity: "order",
    entityId: order.id,
    summary: `Order ${order.orderNumber}: ${prevStatus} -> ${params.toStatus}`,
    beforeJson: { status: prevStatus },
    afterJson: { status: params.toStatus, note: params.note },
  });

  return order;
}

export function findReceiptByToken(
  rawReceiptToken: string,
): { receipt: SeedReceipt; order: SeedOrder; payment: SeedPayment } | null {
  const store = getStore();
  const targetHash = hashToken(rawReceiptToken);
  for (const order of store.orders) {
    const receipt = order.receipts.find((r) => r.tokenHash === targetHash);
    if (receipt) {
      const payment = order.payments.find((p) => p.id === receipt.paymentId);
      if (payment) {
        return { receipt, order, payment };
      }
    }
  }
  return null;
}
