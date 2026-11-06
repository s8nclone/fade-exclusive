import "server-only";
import { roundHalfUp } from "@/lib/format/money";
import type { SeedPromotion } from "@/server/db/seed-data";

export interface PricingLineInput {
  variantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  variantLabel: string;
  productType: "ready_to_wear" | "made_to_order" | "custom_fit";
  categoryId: string;
  collectionIds: string[];
  unitPriceMinor: number;
  compareAtPriceMinor: number | null;
  qty: number;
  leadTimeDays: number | null;
  depositPercent: number | null;
  imageUrl: string | null;
}

export interface EvaluatedLineItem extends PricingLineInput {
  lineSubtotalMinor: number;
  lineDiscountMinor: number;
  lineTotalMinor: number;
  effectiveUnitPriceMinor: number;
  hasStrikeThrough: boolean;
  originalUnitPriceMinor: number;
}

export interface AppliedDiscountBreakdown {
  promotionId: string;
  name: string;
  code: string | null;
  kind: "coupon" | "automatic";
  discountType: "percentage" | "fixed_amount" | "free_shipping";
  amountMinor: number;
}

export interface PricingEngineResult {
  lines: EvaluatedLineItem[];
  subtotalMinor: number;
  itemDiscountTotalMinor: number;
  shippingOriginalMinor: number;
  shippingDiscountMinor: number;
  shippingEffectiveMinor: number;
  discountTotalMinor: number;
  totalMinor: number;
  depositRequiredMinor: number;
  appliedDiscounts: AppliedDiscountBreakdown[];
  couponStatus: {
    code: string | null;
    valid: boolean;
    message: string | null;
  };
  stackingNote: string | null;
}

export interface PromotionUsageContext {
  now?: Date;
  totalRedemptionsByPromoId: Record<string, number>;
  customerRedemptionsByPromoId: Record<string, number>;
}

export function isPromotionWithinSchedule(promo: SeedPromotion, now: Date = new Date()): boolean {
  if (!promo.isActive) return false;
  if (promo.startsAt && new Date(promo.startsAt).getTime() > now.getTime()) {
    return false;
  }
  if (promo.endsAt && new Date(promo.endsAt).getTime() < now.getTime()) {
    return false;
  }
  return true;
}

export function isPromotionWithinUsageLimits(
  promo: SeedPromotion,
  usage: PromotionUsageContext,
): boolean {
  const totalUsed = usage.totalRedemptionsByPromoId[promo.id] ?? 0;
  if (
    promo.usageLimitTotal !== null &&
    promo.usageLimitTotal !== undefined &&
    totalUsed >= promo.usageLimitTotal
  ) {
    return false;
  }

  const customerUsed = usage.customerRedemptionsByPromoId[promo.id] ?? 0;
  if (
    promo.usageLimitPerCustomer !== null &&
    promo.usageLimitPerCustomer !== undefined &&
    customerUsed >= promo.usageLimitPerCustomer
  ) {
    return false;
  }

  return true;
}

export function isLineEligibleForPromotion(
  line: PricingLineInput,
  promo: SeedPromotion,
  alreadyDiscountedMinor = 0,
): boolean {
  if (line.productType === "custom_fit") return false;
  if (!promo.eligibleProductTypes.includes(line.productType)) {
    return false;
  }
  if (promo.excludeDiscountedItems) {
    const hasCompareAtDiscount =
      line.compareAtPriceMinor !== null && line.compareAtPriceMinor > line.unitPriceMinor;
    if (hasCompareAtDiscount || alreadyDiscountedMinor > 0) {
      return false;
    }
  }

  switch (promo.scope) {
    case "order":
      return true;
    case "products":
      return promo.targetIds.includes(line.productId);
    case "categories":
      return promo.targetIds.includes(line.categoryId);
    case "collections":
      return line.collectionIds.some((cid) => promo.targetIds.includes(cid));
    default:
      return false;
  }
}

interface CandidateDiscountResult {
  promotion: SeedPromotion;
  lineDiscounts: Record<string, number>; // variantId -> discountMinor
  itemDiscountMinor: number;
  shippingDiscountMinor: number;
  totalBenefitMinor: number;
}

/**
 * Evaluates a single promotion against current line balances and shipping fee.
 * Distributes fixed discounts proportionally across eligible lines using roundHalfUp.
 */
function evaluateSinglePromotion(
  promo: SeedPromotion,
  lines: PricingLineInput[],
  existingLineDiscounts: Record<string, number>,
  orderSubtotalMinor: number,
  shippingFeeMinor: number,
): CandidateDiscountResult | null {
  if (promo.minOrderMinor && orderSubtotalMinor < promo.minOrderMinor) {
    return null;
  }

  const eligibleLines = lines.filter((line) =>
    isLineEligibleForPromotion(line, promo, existingLineDiscounts[line.variantId] ?? 0),
  );

  if (eligibleLines.length === 0) {
    return null;
  }

  const lineDiscounts: Record<string, number> = {};

  if (promo.discountType === "free_shipping") {
    return {
      promotion: promo,
      lineDiscounts,
      itemDiscountMinor: 0,
      shippingDiscountMinor: shippingFeeMinor,
      totalBenefitMinor: shippingFeeMinor,
    };
  }

  const eligibleBalances = eligibleLines.map((line) => {
    const gross = line.unitPriceMinor * line.qty;
    const prior = existingLineDiscounts[line.variantId] ?? 0;
    return {
      variantId: line.variantId,
      remainingMinor: Math.max(0, gross - prior),
    };
  });

  const totalEligibleBalance = eligibleBalances.reduce((acc, b) => acc + b.remainingMinor, 0);
  if (totalEligibleBalance <= 0) {
    return null;
  }

  let targetTotalDiscount = 0;
  if (promo.discountType === "percentage") {
    const pct = Math.min(100, Math.max(0, promo.value));
    targetTotalDiscount = roundHalfUp((totalEligibleBalance * pct) / 100);
  } else if (promo.discountType === "fixed_amount") {
    targetTotalDiscount = Math.min(totalEligibleBalance, Math.max(0, promo.value));
  }

  if (promo.maxDiscountMinor !== null && promo.maxDiscountMinor !== undefined) {
    targetTotalDiscount = Math.min(targetTotalDiscount, promo.maxDiscountMinor);
  }
  targetTotalDiscount = Math.min(targetTotalDiscount, totalEligibleBalance);

  if (targetTotalDiscount <= 0) {
    return null;
  }

  // Distribute proportionally across eligible lines
  let allocatedSum = 0;
  let largestVariantId = eligibleBalances[0]?.variantId ?? "";
  let largestBalance = -1;

  for (const item of eligibleBalances) {
    if (item.remainingMinor > largestBalance) {
      largestBalance = item.remainingMinor;
      largestVariantId = item.variantId;
    }
    const share = roundHalfUp((targetTotalDiscount * item.remainingMinor) / totalEligibleBalance);
    const clamped = Math.min(item.remainingMinor, share);
    lineDiscounts[item.variantId] = clamped;
    allocatedSum += clamped;
  }

  // Reconcile rounding remainder on the largest eligible line
  const diff = targetTotalDiscount - allocatedSum;
  if (diff !== 0 && largestVariantId) {
    const current = lineDiscounts[largestVariantId] ?? 0;
    const maxAllowed =
      eligibleBalances.find((b) => b.variantId === largestVariantId)?.remainingMinor ?? current;
    lineDiscounts[largestVariantId] = Math.max(0, Math.min(maxAllowed, current + diff));
  }

  const finalItemDiscount = Object.values(lineDiscounts).reduce((a, b) => a + b, 0);

  return {
    promotion: promo,
    lineDiscounts,
    itemDiscountMinor: finalItemDiscount,
    shippingDiscountMinor: 0,
    totalBenefitMinor: finalItemDiscount,
  };
}

/**
 * Pure server-side pricing engine (Section 11.8):
 * Line items -> Automatic offers -> Coupon -> Shipping -> Total.
 */
export function calculateOrderPricing(params: {
  lines: PricingLineInput[];
  promotions: SeedPromotion[];
  couponCode?: string | null;
  shippingFeeMinor: number;
  usage: PromotionUsageContext;
}): PricingEngineResult {
  const now = params.usage.now ?? new Date();
  const subtotalMinor = params.lines.reduce(
    (sum, line) => sum + line.unitPriceMinor * line.qty,
    0,
  );

  // 1. Find best eligible automatic promotion
  const activeAutomatics = params.promotions.filter(
    (p) =>
      p.kind === "automatic" &&
      isPromotionWithinSchedule(p, now) &&
      isPromotionWithinUsageLimits(p, params.usage),
  );

  let bestAutoEval: CandidateDiscountResult | null = null;
  for (const autoPromo of activeAutomatics) {
    const evaluated = evaluateSinglePromotion(
      autoPromo,
      params.lines,
      {},
      subtotalMinor,
      params.shippingFeeMinor,
    );
    if (evaluated && (!bestAutoEval || evaluated.totalBenefitMinor > bestAutoEval.totalBenefitMinor)) {
      bestAutoEval = evaluated;
    }
  }

  // 2. Validate requested coupon code (if provided)
  const normalizedCode = params.couponCode ? params.couponCode.trim().toUpperCase() : null;
  let couponPromo: SeedPromotion | null = null;
  let couponStatus: PricingEngineResult["couponStatus"] = {
    code: normalizedCode,
    valid: false,
    message: null,
  };

  if (normalizedCode) {
    const matched = params.promotions.find(
      (p) => p.kind === "coupon" && p.code?.trim().toUpperCase() === normalizedCode,
    );
    if (
      !matched ||
      !isPromotionWithinSchedule(matched, now) ||
      !isPromotionWithinUsageLimits(matched, params.usage)
    ) {
      couponStatus = {
        code: normalizedCode,
        valid: false,
        message: "This coupon code is invalid or has expired.",
      };
    } else {
      const testSolo = evaluateSinglePromotion(
        matched,
        params.lines,
        {},
        subtotalMinor,
        params.shippingFeeMinor,
      );
      if (!testSolo) {
        couponStatus = {
          code: normalizedCode,
          valid: false,
          message: "This coupon is not valid for the current cart items or minimum order amount.",
        };
      } else {
        couponPromo = matched;
        couponStatus = {
          code: normalizedCode,
          valid: true,
          message: `Coupon ${normalizedCode} applied.`,
        };
      }
    }
  }

  // 3. Resolve stacking between best automatic offer and valid coupon
  const combinedLineDiscounts: Record<string, number> = {};
  const appliedDiscounts: AppliedDiscountBreakdown[] = [];
  let shippingDiscountMinor = 0;
  let stackingNote: string | null = null;

  if (bestAutoEval && couponPromo) {
    const canStack = bestAutoEval.promotion.stackable && couponPromo.stackable;
    if (canStack) {
      // Apply automatic offer first, then coupon on remaining balances
      for (const [vid, amt] of Object.entries(bestAutoEval.lineDiscounts)) {
        combinedLineDiscounts[vid] = (combinedLineDiscounts[vid] ?? 0) + amt;
      }
      shippingDiscountMinor = Math.min(
        params.shippingFeeMinor,
        shippingDiscountMinor + bestAutoEval.shippingDiscountMinor,
      );
      appliedDiscounts.push({
        promotionId: bestAutoEval.promotion.id,
        name: bestAutoEval.promotion.name,
        code: null,
        kind: "automatic",
        discountType: bestAutoEval.promotion.discountType,
        amountMinor: bestAutoEval.totalBenefitMinor,
      });

      const stackedCouponEval = evaluateSinglePromotion(
        couponPromo,
        params.lines,
        combinedLineDiscounts,
        subtotalMinor,
        Math.max(0, params.shippingFeeMinor - shippingDiscountMinor),
      );

      if (stackedCouponEval && stackedCouponEval.totalBenefitMinor > 0) {
        for (const [vid, amt] of Object.entries(stackedCouponEval.lineDiscounts)) {
          combinedLineDiscounts[vid] = (combinedLineDiscounts[vid] ?? 0) + amt;
        }
        shippingDiscountMinor = Math.min(
          params.shippingFeeMinor,
          shippingDiscountMinor + stackedCouponEval.shippingDiscountMinor,
        );
        appliedDiscounts.push({
          promotionId: stackedCouponEval.promotion.id,
          name: stackedCouponEval.promotion.name,
          code: stackedCouponEval.promotion.code,
          kind: "coupon",
          discountType: stackedCouponEval.promotion.discountType,
          amountMinor: stackedCouponEval.totalBenefitMinor,
        });
      }
    } else {
      // Non-stackable: pick whichever single promotion gives the customer a higher total benefit
      const soloCouponEval = evaluateSinglePromotion(
        couponPromo,
        params.lines,
        {},
        subtotalMinor,
        params.shippingFeeMinor,
      );

      if (soloCouponEval && soloCouponEval.totalBenefitMinor >= bestAutoEval.totalBenefitMinor) {
        for (const [vid, amt] of Object.entries(soloCouponEval.lineDiscounts)) {
          combinedLineDiscounts[vid] = amt;
        }
        shippingDiscountMinor = soloCouponEval.shippingDiscountMinor;
        appliedDiscounts.push({
          promotionId: soloCouponEval.promotion.id,
          name: soloCouponEval.promotion.name,
          code: soloCouponEval.promotion.code,
          kind: "coupon",
          discountType: soloCouponEval.promotion.discountType,
          amountMinor: soloCouponEval.totalBenefitMinor,
        });
        stackingNote = `Applied ${soloCouponEval.promotion.code} (${soloCouponEval.promotion.name}) as it provides a higher discount than the automatic offer.`;
      } else {
        for (const [vid, amt] of Object.entries(bestAutoEval.lineDiscounts)) {
          combinedLineDiscounts[vid] = amt;
        }
        shippingDiscountMinor = bestAutoEval.shippingDiscountMinor;
        appliedDiscounts.push({
          promotionId: bestAutoEval.promotion.id,
          name: bestAutoEval.promotion.name,
          code: null,
          kind: "automatic",
          discountType: bestAutoEval.promotion.discountType,
          amountMinor: bestAutoEval.totalBenefitMinor,
        });
        stackingNote = `Kept automatic offer "${bestAutoEval.promotion.name}" because it gives a better discount than coupon ${couponPromo.code} (offers cannot be combined).`;
      }
    }
  } else if (bestAutoEval) {
    for (const [vid, amt] of Object.entries(bestAutoEval.lineDiscounts)) {
      combinedLineDiscounts[vid] = amt;
    }
    shippingDiscountMinor = bestAutoEval.shippingDiscountMinor;
    appliedDiscounts.push({
      promotionId: bestAutoEval.promotion.id,
      name: bestAutoEval.promotion.name,
      code: null,
      kind: "automatic",
      discountType: bestAutoEval.promotion.discountType,
      amountMinor: bestAutoEval.totalBenefitMinor,
    });
  } else if (couponPromo) {
    const soloCouponEval = evaluateSinglePromotion(
      couponPromo,
      params.lines,
      {},
      subtotalMinor,
      params.shippingFeeMinor,
    );
    if (soloCouponEval) {
      for (const [vid, amt] of Object.entries(soloCouponEval.lineDiscounts)) {
        combinedLineDiscounts[vid] = amt;
      }
      shippingDiscountMinor = soloCouponEval.shippingDiscountMinor;
      appliedDiscounts.push({
        promotionId: soloCouponEval.promotion.id,
        name: soloCouponEval.promotion.name,
        code: soloCouponEval.promotion.code,
        kind: "coupon",
        discountType: soloCouponEval.promotion.discountType,
        amountMinor: soloCouponEval.totalBenefitMinor,
      });
    }
  }

  // 4. Finalize lines, totals, and deposit calculation
  let itemDiscountTotalMinor = 0;
  let depositLinesSumMinor = 0;

  const evaluatedLines: EvaluatedLineItem[] = params.lines.map((line) => {
    const lineSubtotalMinor = line.unitPriceMinor * line.qty;
    const lineDiscountMinor = Math.min(
      lineSubtotalMinor,
      combinedLineDiscounts[line.variantId] ?? 0,
    );
    const lineTotalMinor = Math.max(0, lineSubtotalMinor - lineDiscountMinor);
    itemDiscountTotalMinor += lineDiscountMinor;

    const effectiveUnitPriceMinor =
      line.qty > 0 ? roundHalfUp(lineTotalMinor / line.qty) : line.unitPriceMinor;
    const originalUnitPriceMinor =
      line.compareAtPriceMinor && line.compareAtPriceMinor > line.unitPriceMinor
        ? line.compareAtPriceMinor
        : line.unitPriceMinor;
    const hasStrikeThrough = effectiveUnitPriceMinor < originalUnitPriceMinor;

    if (
      line.productType === "made_to_order" &&
      line.depositPercent &&
      line.depositPercent > 0 &&
      line.depositPercent < 100
    ) {
      depositLinesSumMinor += roundHalfUp((lineTotalMinor * line.depositPercent) / 100);
    } else {
      depositLinesSumMinor += lineTotalMinor;
    }

    return {
      ...line,
      lineSubtotalMinor,
      lineDiscountMinor,
      lineTotalMinor,
      effectiveUnitPriceMinor,
      hasStrikeThrough,
      originalUnitPriceMinor,
    };
  });

  const shippingEffectiveMinor = Math.max(0, params.shippingFeeMinor - shippingDiscountMinor);
  const discountTotalMinor = itemDiscountTotalMinor + shippingDiscountMinor;
  const totalMinor = Math.max(0, subtotalMinor - itemDiscountTotalMinor + shippingEffectiveMinor);
  const depositRequiredMinor = Math.min(totalMinor, depositLinesSumMinor + shippingEffectiveMinor);

  return {
    lines: evaluatedLines,
    subtotalMinor,
    itemDiscountTotalMinor,
    shippingOriginalMinor: params.shippingFeeMinor,
    shippingDiscountMinor,
    shippingEffectiveMinor,
    discountTotalMinor,
    totalMinor,
    depositRequiredMinor,
    appliedDiscounts,
    couponStatus,
    stackingNote,
  };
}

/**
 * Computes display pricing for product cards and detail pages including active automatic offers.
 */
export function computeProductDisplayPrice(params: {
  productId: string;
  productType: "ready_to_wear" | "made_to_order";
  categoryId: string;
  collectionIds: string[];
  priceMinor: number;
  compareAtPriceMinor: number | null;
  promotions: SeedPromotion[];
  now?: Date;
}): {
  effectivePriceMinor: number;
  originalPriceMinor: number | null;
  hasSale: boolean;
  activeOfferLabel: string | null;
  offerEndsAt: string | null;
} {
  const now = params.now ?? new Date();
  const dummyLine: PricingLineInput = {
    variantId: "display",
    productId: params.productId,
    productName: "",
    productSlug: "",
    variantLabel: "",
    productType: params.productType,
    categoryId: params.categoryId,
    collectionIds: params.collectionIds,
    unitPriceMinor: params.priceMinor,
    compareAtPriceMinor: params.compareAtPriceMinor,
    qty: 1,
    leadTimeDays: null,
    depositPercent: null,
    imageUrl: null,
  };

  let bestDiscountMinor = 0;
  let bestPromo: SeedPromotion | null = null;

  for (const promo of params.promotions) {
    if (promo.kind !== "automatic" || !isPromotionWithinSchedule(promo, now)) continue;
    if (promo.minOrderMinor && promo.minOrderMinor > params.priceMinor) continue;
    const res = evaluateSinglePromotion(promo, [dummyLine], {}, params.priceMinor, 0);
    if (res && res.itemDiscountMinor > bestDiscountMinor) {
      bestDiscountMinor = res.itemDiscountMinor;
      bestPromo = promo;
    }
  }

  const effectivePriceMinor = Math.max(0, params.priceMinor - bestDiscountMinor);
  const baseOriginal =
    params.compareAtPriceMinor && params.compareAtPriceMinor > params.priceMinor
      ? params.compareAtPriceMinor
      : bestDiscountMinor > 0
        ? params.priceMinor
        : null;

  return {
    effectivePriceMinor,
    originalPriceMinor: baseOriginal,
    hasSale: baseOriginal !== null && effectivePriceMinor < baseOriginal,
    activeOfferLabel: bestPromo ? bestPromo.name : null,
    offerEndsAt: bestPromo?.endsAt ?? null,
  };
}
