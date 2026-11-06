import { describe, expect, it, beforeEach } from "vitest";
import { resetStoreForTests, getStore } from "@/server/db/client";
import {
  calculateOrderPricing,
  computeProductDisplayPrice,
  type PricingLineInput,
} from "@/server/domain/pricing/pricing.domain";
import {
  assertValidOrderTransition,
  canTransitionOrderStatus,
  confirmOrderPayment,
  expireOverdueOrders,
  getAvailableVariantStock,
  placeGuestOrder,
} from "@/server/domain/orders/orders.domain";
import {
  generateAccessToken,
  generateReferenceCode,
  hashToken,
  isSafeRedirectOrCtaUrl,
} from "@/server/security/crypto";
import { buildDynamicFormZodSchema, type FormFieldConfig } from "@/services/forms/forms.schema";
import { getContrastRatio, isValidHexColor, meetsWcagAA } from "@/lib/contrast";
import { normalizePhoneE164, toWhatsAppDigits } from "@/lib/phone";
import { formatMinorCurrency, roundHalfUp, toMinorUnits } from "@/lib/format/money";
import {
  mapToProductCardDTO,
  mapToPublicOrderDTO,
} from "@/server/domain/mappers";

describe("Fadé Exclusive — Core Domain Unit Tests", () => {
  beforeEach(() => {
    resetStoreForTests();
  });

  describe("1. Money & Rounding Utilities", () => {
    it("rounds half up accurately and formats minor units", () => {
      expect(roundHalfUp(10.5)).toBe(11);
      expect(roundHalfUp(10.4)).toBe(10);
      expect(toMinorUnits(285000)).toBe(28500000);
      const formatted = formatMinorCurrency(28500000, "NGN");
      expect(formatted).toContain("285,000");
    });
  });

  describe("2. Reference Code & Token Security", () => {
    it("generates unambiguous reference codes without 0, O, 1, I, or L", () => {
      for (let i = 0; i < 50; i++) {
        const code = generateReferenceCode("FD", 6);
        expect(code).toMatch(/^FD-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/);
        expect(code.slice(3)).not.toMatch(/[0O1IL]/);
      }
    });

    it("generates >= 128-bit tokens and deterministic SHA-256 hashes", () => {
      const token = generateAccessToken();
      expect(token.length).toBeGreaterThanOrEqual(24);
      const h1 = hashToken(token);
      const h2 = hashToken(token);
      expect(h1).toBe(h2);
      expect(h1).toHaveLength(64);
    });

    it("validates CTA and redirect URLs against XSS/protocol injection", () => {
      expect(isSafeRedirectOrCtaUrl("/shop?coupon=FADE10")).toBe(true);
      expect(isSafeRedirectOrCtaUrl("https://instagram.com/fadeexclusive")).toBe(true);
      expect(isSafeRedirectOrCtaUrl("javascript:alert(1)")).toBe(false);
      expect(isSafeRedirectOrCtaUrl("//evil.example.com")).toBe(false);
      expect(isSafeRedirectOrCtaUrl("http://insecure.example.com")).toBe(false);
    });
  });

  describe("3. WCAG 2.2 Contrast & Phone Normalization", () => {
    it("computes contrast ratio and enforces 4.5:1 AA minimum", () => {
      expect(isValidHexColor("#161412")).toBe(true);
      expect(isValidHexColor("161412")).toBe(false);
      // Obsidian (#161412) on Alabaster (#F4F1EA) has high contrast (> 14:1)
      expect(getContrastRatio("#161412", "#F4F1EA")).toBeGreaterThan(14);
      expect(meetsWcagAA("#161412", "#F4F1EA")).toBe(true);
      // Low contrast pale gray on ivory fails AA
      expect(meetsWcagAA("#D6CFC1", "#F4F1EA")).toBe(false);
    });

    it("normalizes Nigerian and international phone numbers to E.164", () => {
      expect(normalizePhoneE164("0803 123 4567", "NG")).toBe("+2348031234567");
      expect(normalizePhoneE164("+44 7700 900123", "NG")).toBe("+447700900123");
      expect(toWhatsAppDigits("0803 123 4567", "NG")).toBe("2348031234567");
      expect(normalizePhoneE164("not-a-phone", "NG")).toBeNull();
    });
  });

  describe("4. Pricing Engine, Promotions, Stacking & Proportional Distribution", () => {
    const sampleLines: PricingLineInput[] = [
      {
        variantId: "v1",
        productId: "p1",
        productName: "Alabaster Tunic",
        productSlug: "alabaster-tunic",
        variantLabel: "L",
        productType: "ready_to_wear",
        categoryId: "cat-modern-set",
        collectionIds: ["col-01"],
        unitPriceMinor: 20000000, // NGN 200,000
        compareAtPriceMinor: null,
        qty: 1,
        leadTimeDays: null,
        depositPercent: null,
        imageUrl: null,
      },
      {
        variantId: "v2",
        productId: "p2",
        productName: "Aso-Oke Fila",
        productSlug: "aso-oke-fila",
        variantLabel: "59cm",
        productType: "ready_to_wear",
        categoryId: "cat-fila",
        collectionIds: ["col-01"],
        unitPriceMinor: 10000000, // NGN 100,000
        compareAtPriceMinor: null,
        qty: 1,
        leadTimeDays: null,
        depositPercent: null,
        imageUrl: null,
      },
    ];

    it("distributes fixed discounts proportionally across eligible lines and reconciles remainders", () => {
      const store = getStore();
      const fixedPromo = {
        ...store.promotions[2]!,
        id: "promo-fixed-test",
        kind: "coupon" as const,
        code: "FIXED30K",
        discountType: "fixed_amount" as const,
        value: 3000000, // NGN 30,000 across NGN 300,000 total (2/3 and 1/3)
        minOrderMinor: 10000000,
        stackable: false,
      };

      const res = calculateOrderPricing({
        lines: sampleLines,
        promotions: [fixedPromo],
        couponCode: "fixed30k", // case-insensitive
        shippingFeeMinor: 1000000,
        usage: {
          now: new Date("2026-11-02T00:00:00Z"),
          totalRedemptionsByPromoId: {},
          customerRedemptionsByPromoId: {},
        },
      });

      expect(res.couponStatus.valid).toBe(true);
      expect(res.itemDiscountTotalMinor).toBe(3000000);
      expect(res.lines[0]?.lineDiscountMinor).toBe(2000000); // 2/3 of 30,000
      expect(res.lines[1]?.lineDiscountMinor).toBe(1000000); // 1/3 of 30,000
      expect(res.totalMinor).toBe(28000000); // 300k - 30k + 10k shipping
    });

    it("stacks automatic offer + coupon when both have stackable=true", () => {
      const store = getStore();
      // Seed has promo-auto-fila (10% off cat-fila, stackable=true) and FADE10 (10% off order, stackable=true)
      const res = calculateOrderPricing({
        lines: sampleLines,
        promotions: store.promotions,
        couponCode: "FADE10",
        shippingFeeMinor: 1000000,
        usage: {
          now: new Date("2026-11-02T00:00:00Z"),
          totalRedemptionsByPromoId: {},
          customerRedemptionsByPromoId: {},
        },
      });

      expect(res.appliedDiscounts).toHaveLength(2);
      // Auto offer gives 10% on Fila (10,000) -> remaining balance is 200k + 90k = 290k -> FADE10 gives 10% of 290k = 29,000 -> total discount 39,000
      expect(res.discountTotalMinor).toBe(3900000);
    });

    it("picks the single better discount when promotions are not stackable", () => {
      const store = getStore();
      // HERITAGE50K has stackable=false, minOrder=500,000
      const highValueLines: PricingLineInput[] = [
        {
          ...sampleLines[0]!,
          unitPriceMinor: 60000000, // NGN 600,000
        },
        {
          ...sampleLines[1]!,
          unitPriceMinor: 10000000, // NGN 100,000 (auto offer 10% = NGN 10,000)
        },
      ];

      const res = calculateOrderPricing({
        lines: highValueLines,
        promotions: store.promotions,
        couponCode: "HERITAGE50K", // NGN 50,000 > NGN 10,000 auto offer
        shippingFeeMinor: 1000000,
        usage: {
          now: new Date("2026-11-02T00:00:00Z"),
          totalRedemptionsByPromoId: {},
          customerRedemptionsByPromoId: {},
        },
      });

      expect(res.appliedDiscounts).toHaveLength(1);
      expect(res.appliedDiscounts[0]?.code).toBe("HERITAGE50K");
      expect(res.discountTotalMinor).toBe(5000000);
      expect(res.stackingNote).toContain("HERITAGE50K");
    });

    it("enforces usageLimitTotal and usageLimitPerCustomer", () => {
      const store = getStore();
      const res = calculateOrderPricing({
        lines: sampleLines,
        promotions: store.promotions,
        couponCode: "FADE10",
        shippingFeeMinor: 1000000,
        usage: {
          now: new Date("2026-11-02T00:00:00Z"),
          totalRedemptionsByPromoId: { "promo-coupon-fade10": 100 }, // limit is 100
          customerRedemptionsByPromoId: {},
        },
      });

      expect(res.couponStatus.valid).toBe(false);
    });

    it("computes product card sale price when automatic offer applies", () => {
      const store = getStore();
      const filaProduct = store.products.find((p) => p.slug === "bronze-espresso-aso-oke-fila")!;
      const display = computeProductDisplayPrice({
        productId: filaProduct.id,
        productType: filaProduct.type,
        categoryId: filaProduct.categoryId,
        collectionIds: filaProduct.collectionIds,
        priceMinor: filaProduct.priceMinor,
        compareAtPriceMinor: filaProduct.compareAtPriceMinor,
        promotions: store.promotions,
      });

      expect(display.hasSale).toBe(true);
      expect(display.effectivePriceMinor).toBe(7650000); // 10% off 85,000 = 76,500
      expect(display.originalPriceMinor).toBe(8500000);
    });
  });

  describe("5. Order State Machine, Stock Reservation, Expiry & Idempotency", () => {
    it("enforces legal status transitions and rejects illegal transitions with 409", () => {
      expect(canTransitionOrderStatus("awaiting_payment", "payment_submitted")).toBe(true);
      expect(canTransitionOrderStatus("payment_submitted", "paid")).toBe(true);
      expect(canTransitionOrderStatus("paid", "in_production")).toBe(true);
      expect(canTransitionOrderStatus("delivered", "awaiting_payment")).toBe(false);
      expect(() => assertValidOrderTransition("delivered", "awaiting_payment")).toThrowError(
        /Illegal order status transition/,
      );
    });

    it("reserves stock on order creation, supports idempotency, and releases stock + coupon on expiry", () => {
      const store = getStore();
      const variantId = "var-02-m"; // Initial stockOnHand = 8
      expect(getAvailableVariantStock(variantId, 8)).toBe(8);

      const orderRes = placeGuestOrder({
        idempotencyKey: "test-idem-key-123",
        items: [{ variantId, qty: 2 }],
        couponCode: "FADE10",
        shippingOptionId: "ship-abuja",
        customerName: "Test Buyer",
        customerEmail: "buyer@example.com",
        customerPhone: "08031234567",
        deliveryAddress: {
          line1: "10 Ademola Adetokunbo",
          city: "Maitama",
          state: "FCT",
          country: "Nigeria",
        },
      });

      expect(orderRes.isDuplicateIdempotent).toBe(false);
      // Available stock decreased by 2
      expect(getAvailableVariantStock(variantId, 8)).toBe(6);

      // Re-submitting same idempotencyKey returns exact same order without double reservation
      const duplicateRes = placeGuestOrder({
        idempotencyKey: "test-idem-key-123",
        items: [{ variantId, qty: 2 }],
        couponCode: "FADE10",
        shippingOptionId: "ship-abuja",
        customerName: "Test Buyer",
        customerEmail: "buyer@example.com",
        customerPhone: "08031234567",
        deliveryAddress: {
          line1: "10 Ademola Adetokunbo",
          city: "Maitama",
          state: "FCT",
          country: "Nigeria",
        },
      });
      expect(duplicateRes.isDuplicateIdempotent).toBe(true);
      expect(duplicateRes.order.id).toBe(orderRes.order.id);
      expect(getAvailableVariantStock(variantId, 8)).toBe(6);

      // Simulate time passing past 48-hour payment window
      const futureDate = new Date(Date.now() + 72 * 60 * 60 * 1000);
      const expiryResult = expireOverdueOrders(futureDate);
      expect(expiryResult.expiredOrderNumbers).toContain(orderRes.order.orderNumber);
      expect(orderRes.order.status).toBe("expired");

      // Stock reservation and coupon redemption are released!
      expect(getAvailableVariantStock(variantId, 8)).toBe(8);
      const redemption = store.promotionRedemptions.find(
        (r) => r.orderId === orderRes.order.id,
      );
      expect(redemption?.releasedAt).not.toBeNull();
    });

    it("permanently decrements stock and issues an official receipt when payment is confirmed", () => {
      const store = getStore();
      const variantId = "var-02-s"; // stockOnHand = 4
      const placed = placeGuestOrder({
        idempotencyKey: "test-pay-confirm-key",
        items: [{ variantId, qty: 1 }],
        shippingOptionId: "ship-abuja",
        customerName: "Funke Akindele",
        customerEmail: "funke@example.com",
        customerPhone: "+2348091234567",
        deliveryAddress: {
          line1: "Plot 1042, Ademola Adetokunbo Crescent",
          city: "Maitama",
          state: "FCT",
          country: "Nigeria",
        },
      });

      const confirmed = confirmOrderPayment({
        orderId: placed.order.id,
        amountMinor: placed.order.totalMinor,
        kind: "full",
        bankReference: "NIP-00998877",
        actor: {
          id: "usr-owner-01",
          email: "owner@fadeexclusive.com",
          role: "owner",
        },
      });

      expect(confirmed.order.status).toBe("paid");
      expect(confirmed.receipt.receiptNumber).toContain("RCP-");
      const prod = store.products.find((p) => p.id === "prod-02")!;
      const variant = prod.variants.find((v) => v.id === variantId)!;
      expect(variant.stockOnHand).toBe(3);
    });
  });

  describe("6. Dynamic Form Builder Schema Generation", () => {
    it("generates Zod validation for text, email, select, and measurement fields", () => {
      const fields: FormFieldConfig[] = [
        {
          key: "clientName",
          label: "Client Name",
          type: "text",
          required: true,
          minLength: 3,
          width: "half",
          sortOrder: 1,
          isVisible: true,
          isSystem: true,
        },
        {
          key: "chestSize",
          label: "Chest Circumference",
          type: "measurement",
          required: true,
          min: 30,
          max: 160,
          width: "half",
          sortOrder: 2,
          isVisible: true,
          isSystem: false,
        },
      ];

      const schema = buildDynamicFormZodSchema(fields);
      const validParse = schema.safeParse({
        clientName: "Tunde",
        chestSize: { value: 104, unit: "cm" },
      });
      expect(validParse.success).toBe(true);

      const invalidParse = schema.safeParse({
        clientName: "Tu",
        chestSize: { value: 15, unit: "cm" },
      });
      expect(invalidParse.success).toBe(false);
    });
  });

  describe("7. DTO Mappers — Zero Sensitive Data Leakage", () => {
    it("strips stockOnHand, lowStockThreshold, and internal metadata from public ProductCardDTO", () => {
      const store = getStore();
      const rawProduct = store.products[1]!;
      const dto = mapToProductCardDTO(rawProduct, store.promotions);

      expect(dto.slug).toBe(rawProduct.slug);
      expect(dto.availability).toBe("in_stock");
      const serialized = JSON.stringify(dto);
      expect(serialized).not.toContain("stockOnHand");
      expect(serialized).not.toContain("lowStockThreshold");
      expect(serialized).not.toContain("hasOrders");
    });

    it("masks customer email and strips internalNotes and accessTokenHash from PublicOrderDTO", () => {
      const store = getStore();
      const rawOrder = store.orders[0]!;
      const dto = mapToPublicOrderDTO(rawOrder);

      expect(dto.customerEmailMasked).toBe("ch***@example.com");
      const serialized = JSON.stringify(dto);
      expect(serialized).not.toContain("accessTokenHash");
      expect(serialized).not.toContain("internalNotes");
      expect(serialized).not.toContain("Customer notified us via WhatsApp");
    });
  });
});
