import { getEnv } from "@/lib/env";
import { requireAdmin } from "@/server/auth";
import { recordAuditLog } from "@/server/audit";
import { getStore } from "@/server/db/client";
import type { SeedOrder } from "@/server/db/seed-data";
import { mapToCustomRequestAdminDTO } from "@/server/domain/mappers";
import { buildOrderPlacedEmail, sendTransactionalEmail } from "@/server/email";
import {
  generateAccessToken,
  generateOrderNumber,
  generateReferenceCode,
  hashToken,
} from "@/server/security/crypto";
import { ApiError, handleRouteError, jsonSuccess } from "@/server/security/http";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdmin();
    const { id } = await context.params;
    const store = getStore();
    const req = store.customRequests.find((c) => c.id === id);
    if (!req) {
      throw new ApiError(404, "CUSTOM_REQUEST_NOT_FOUND", "Custom request not found.");
    }

    if (!req.quoteMinor || req.quoteMinor <= 0) {
      throw new ApiError(
        400,
        "QUOTE_REQUIRED",
        "Please set a quote amount before converting to an order.",
      );
    }

    if (req.convertedOrderId) {
      const existing = store.orders.find((o) => o.id === req.convertedOrderId);
      if (existing) {
        return jsonSuccess({
          customRequest: mapToCustomRequestAdminDTO(req),
          orderId: existing.id,
          orderNumber: existing.orderNumber,
          orderToken: existing.rawTokenForDemo ?? "",
        });
      }
    }

    const now = new Date();
    const nowIso = now.toISOString();
    const paymentWindowHours = store.settings.paymentWindowHours || 48;
    const paymentDueAt = new Date(
      now.getTime() + paymentWindowHours * 60 * 60 * 1000,
    ).toISOString();

    const orderId = `ord-cf-${Date.now()}`;
    const orderNumber = generateOrderNumber(store.settings.orderPrefix || "FD");
    const referenceCode = generateReferenceCode(store.settings.orderPrefix || "FD", 6);
    const rawToken = generateAccessToken();
    const depositMinor = req.depositMinor && req.depositMinor > 0 ? req.depositMinor : req.quoteMinor;

    const pickupOption =
      store.settings.shippingOptions.find((s) => s.id === "ship-pickup") ??
      store.settings.shippingOptions[0]!;

    const newOrder: SeedOrder = {
      id: orderId,
      orderNumber,
      referenceCode,
      rawTokenForDemo: rawToken,
      accessTokenHash: hashToken(rawToken),
      idempotencyKey: `convert-${req.id}`,
      status: "awaiting_payment",
      customerName: req.customerName,
      customerEmail: req.customerEmail,
      customerPhone: req.customerPhone,
      deliveryAddress: {
        line1: "Maitama Atelier Fitting / Client Delivery",
        city: "Abuja",
        state: "FCT",
        country: "Nigeria",
      },
      shippingOption: {
        id: pickupOption.id,
        name: pickupOption.name,
        feeMinor: 0,
        eta: req.estimatedCompletion || "Bespoke Schedule",
      },
      subtotalMinor: req.quoteMinor,
      discountTotalMinor: 0,
      shippingMinor: 0,
      totalMinor: req.quoteMinor,
      depositRequiredMinor: depositMinor,
      amountPaidMinor: 0,
      currency: req.currency,
      paymentDueAt,
      customerNotes: req.styleNotes,
      extraFields: {
        customRequestNumber: req.requestNumber,
        occasion: req.occasion,
        eventDate: req.eventDate,
      },
      internalNotes: `Converted from Custom Fit inquiry ${req.requestNumber} by ${admin.email}.`,
      receiptAssetUrl: null,
      source: "custom_fit",
      items: [
        {
          id: `oi-cf-${Date.now()}`,
          orderId,
          productId: null,
          variantId: null,
          productName: `Bespoke Commission: ${req.occasion}`,
          productSlug: "custom-fit",
          variantLabel: `Custom Fit (${req.requestNumber})`,
          productType: "custom_fit",
          unitPriceMinor: req.quoteMinor,
          qty: 1,
          lineSubtotalMinor: req.quoteMinor,
          lineDiscountMinor: 0,
          lineTotalMinor: req.quoteMinor,
          leadTimeDays: 18,
          depositPercent: Math.round((depositMinor / req.quoteMinor) * 100),
          imageUrl: null,
        },
      ],
      discounts: [],
      history: [
        {
          id: `osh-cf-${Date.now()}`,
          orderId,
          fromStatus: null,
          toStatus: "awaiting_payment",
          actor: admin.email,
          note: `Converted from Custom Fit quote ${req.requestNumber}.`,
          createdAt: nowIso,
        },
      ],
      payments: [],
      receipts: [],
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    store.orders.unshift(newOrder);
    req.status = "accepted";
    req.convertedOrderId = orderId;
    req.updatedAt = nowIso;

    recordAuditLog({
      actorId: admin.id,
      actorEmail: admin.email,
      actorRole: admin.role,
      action: "custom_request.converted_to_order",
      entity: "custom_request",
      entityId: req.id,
      summary: `Converted Custom Fit ${req.requestNumber} -> Order ${orderNumber}`,
      afterJson: { orderId, orderNumber, totalMinor: req.quoteMinor, depositMinor },
    });

    const env = getEnv();
    const orderUrl = `${env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")}/order/${rawToken}`;
    const emailPayload = buildOrderPlacedEmail({
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
      ...emailPayload,
    });

    return jsonSuccess(
      {
        customRequest: mapToCustomRequestAdminDTO(req),
        orderId,
        orderNumber,
        orderToken: rawToken,
      },
      { status: 201 },
    );
  } catch (err) {
    return handleRouteError(err);
  }
}
