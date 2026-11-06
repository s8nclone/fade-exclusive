import { getStore } from "@/server/db/client";
import {
  buildPricingLinesFromCartItems,
  expireOverdueOrders,
  getAvailableVariantStock,
  getPromotionUsageContext,
} from "@/server/domain/orders/orders.domain";
import { calculateOrderPricing } from "@/server/domain/pricing/pricing.domain";
import { enforceRateLimit, getClientIp } from "@/server/rate-limit";
import { handleRouteError, jsonSuccess } from "@/server/security/http";
import { cartPreviewRequestSchema } from "@/services/cart/cart.schema";
import { addDaysFormatted } from "@/lib/format/date";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = cartPreviewRequestSchema.parse(body);

    if (parsed.couponCode) {
      enforceRateLimit({
        keyPrefix: "coupon-preview",
        identifier: getClientIp(request),
        limit: 25,
        windowSeconds: 60,
      });
    }

    expireOverdueOrders();
    const store = getStore();
    const activeShippingOptions = store.settings.shippingOptions.filter(
      (s) => s.isActive,
    );
    const selectedShipping =
      activeShippingOptions.find((s) => s.id === parsed.shippingOptionId) ??
      activeShippingOptions[0] ?? {
        id: "default",
        name: "Standard Shipping",
        feeMinor: 0,
        eta: "2–4 days",
      };

    const lines = buildPricingLinesFromCartItems(parsed.items);
    const usage = getPromotionUsageContext(null);
    const pricing = calculateOrderPricing({
      lines,
      promotions: store.promotions,
      couponCode: parsed.couponCode,
      shippingFeeMinor: selectedShipping.feeMinor,
      usage,
    });

    const now = new Date();
    const leadTimes = new Set<number>();
    const evaluatedLines = pricing.lines.map((line) => {
      if (line.leadTimeDays) {
        leadTimes.add(line.leadTimeDays);
      } else {
        leadTimes.add(0);
      }

      let availableStock: number | null = null;
      const prod = store.products.find((p) => p.id === line.productId);
      if (line.productType === "ready_to_wear" && prod) {
        const variant = prod.variants.find((v) => v.id === line.variantId);
        if (variant) {
          availableStock = getAvailableVariantStock(variant.id, variant.stockOnHand, now);
        }
      }

      const variants = prod
        ? [...prod.variants]
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((v) => ({
              id: v.id,
              label: v.label,
              available:
                prod.type === "made_to_order"
                  ? true
                  : getAvailableVariantStock(v.id, v.stockOnHand, now) > 0,
            }))
        : [];

      return {
        ...line,
        availableStock,
        estimatedReadyDate: line.leadTimeDays
          ? addDaysFormatted(line.leadTimeDays, now)
          : "Immediate dispatch (1–2 business days)",
        categoryName: prod?.categoryName,
        description: prod?.description,
        fabricNotes: prod?.fabricNotes,
        fitNotes: prod?.fitNotes,
        careNotes: prod?.careNotes,
        variants,
      };
    });

    return jsonSuccess({
      lines: evaluatedLines,
      subtotalMinor: pricing.subtotalMinor,
      itemDiscountTotalMinor: pricing.itemDiscountTotalMinor,
      shippingOriginalMinor: pricing.shippingOriginalMinor,
      shippingDiscountMinor: pricing.shippingDiscountMinor,
      shippingEffectiveMinor: pricing.shippingEffectiveMinor,
      discountTotalMinor: pricing.discountTotalMinor,
      totalMinor: pricing.totalMinor,
      depositRequiredMinor: pricing.depositRequiredMinor,
      currency: store.settings.currency,
      appliedDiscounts: pricing.appliedDiscounts,
      couponStatus: pricing.couponStatus,
      stackingNote: pricing.stackingNote,
      hasMixedLeadTimes: leadTimes.size > 1,
      storePaused: store.settings.storePaused,
      storePausedMessage: store.settings.storePausedMessage,
      shippingOptions: activeShippingOptions.map((s) => ({
        id: s.id,
        name: s.name,
        feeMinor: s.feeMinor,
        eta: s.eta,
      })),
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
