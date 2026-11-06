import "server-only";
import { getStore } from "@/server/db/client";
import type {
  SeedCollection,
  SeedCustomRequest,
  SeedOrder,
  SeedProduct,
  SeedPromotion,
  SeedReceipt,
  SeedPayment,
} from "@/server/db/seed-data";
import { computeProductDisplayPrice } from "@/server/domain/pricing/pricing.domain";
import {
  ALLOWED_ORDER_TRANSITIONS,
  getAvailableVariantStock,
} from "@/server/domain/orders/orders.domain";
import type {
  AdminProductDTO,
  ProductCardDTO,
  ProductDetailDTO,
  PublicAvailabilityStatus,
  PublicProductVariantDTO,
} from "@/services/products/products.types";
import type {
  CollectionCardDTO,
  CollectionDetailDTO,
} from "@/services/collections/collections.types";
import type {
  AdminOrderDTO,
  PublicOrderDTO,
  PublicReceiptDTO,
} from "@/services/orders/orders.types";
import type { PromotionAdminDTO } from "@/services/promotions/promotions.types";
import type { CustomRequestAdminDTO } from "@/services/custom-requests/custom-requests.types";
import {
  buildAdminReceiptShareWhatsAppLink,
  buildCustomQuoteWhatsAppLink,
  buildOrderReceiptWhatsAppLink,
} from "@/lib/whatsapp";
import { getEnv } from "@/lib/env";

/**
 * Maps a SeedProduct to a public ProductCardDTO.
 * Strictly strips internal stock counts, order history, and internal fields (Section 5.3 & 17.2).
 */
export function mapToProductCardDTO(
  product: SeedProduct,
  promotions: SeedPromotion[],
  now: Date = new Date(),
): ProductCardDTO {
  const displayPrice = computeProductDisplayPrice({
    productId: product.id,
    productType: product.type,
    categoryId: product.categoryId,
    collectionIds: product.collectionIds,
    priceMinor: product.priceMinor,
    compareAtPriceMinor: product.compareAtPriceMinor,
    promotions,
    now,
  });

  const sortedVariants = [...product.variants].sort((a, b) => a.sortOrder - b.sortOrder);
  const publicVariants: PublicProductVariantDTO[] = sortedVariants.map((v) => {
    const unitPrice = v.priceOverrideMinor ?? product.priceMinor;
    if (product.type === "made_to_order") {
      return {
        id: v.id,
        label: v.label,
        sku: v.sku,
        priceMinor: unitPrice,
        availability: "made_to_order",
      };
    }
    const available = getAvailableVariantStock(v.id, v.stockOnHand, now);
    const availability: PublicAvailabilityStatus =
      available <= 0
        ? "out_of_stock"
        : available <= v.lowStockThreshold
          ? "low_stock"
          : "in_stock";
    return {
      id: v.id,
      label: v.label,
      sku: v.sku,
      priceMinor: unitPrice,
      availability,
    };
  });

  let overallAvailability: PublicAvailabilityStatus = "out_of_stock";
  if (product.type === "made_to_order") {
    overallAvailability = "made_to_order";
  } else if (publicVariants.some((v) => v.availability === "in_stock")) {
    overallAvailability = "in_stock";
  } else if (publicVariants.some((v) => v.availability === "low_stock")) {
    overallAvailability = "low_stock";
  }

  const sortedImages = [...product.images].sort((a, b) => a.sortOrder - b.sortOrder);
  const firstImg = sortedImages[0] ?? {
    url: "/brand/logo-full.jpg",
    altText: product.name,
  };
  const secondImg = sortedImages[1] ?? null;

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    type: product.type,
    categoryName: product.categoryName,
    categorySlug: product.categorySlug,
    priceMinor: product.priceMinor,
    effectivePriceMinor: displayPrice.effectivePriceMinor,
    originalPriceMinor: displayPrice.originalPriceMinor,
    hasSale: displayPrice.hasSale,
    activeOfferLabel: displayPrice.activeOfferLabel,
    offerEndsAt: displayPrice.offerEndsAt,
    currency: product.currency,
    leadTimeDays: product.leadTimeDays,
    depositPercent: product.depositPercent,
    primaryImage: {
      url: firstImg.url,
      altText: firstImg.altText,
    },
    secondaryImage: secondImg
      ? {
          url: secondImg.url,
          altText: secondImg.altText,
        }
      : null,
    availability: overallAvailability,
    isFeatured: product.isFeatured,
    variants: publicVariants,
  };
}

export function mapToProductDetailDTO(product: SeedProduct): ProductDetailDTO {
  const store = getStore();
  const baseCard = mapToProductCardDTO(product, store.promotions);
  const sizeGuide =
    store.sizeGuides.find((sg) => sg.id === product.sizeGuideId) ??
    store.sizeGuides[0] ??
    null;

  const relatedProducts = store.products
    .filter((p) => p.status === "published" && p.id !== product.id)
    .slice(0, 3)
    .map((p) => mapToProductCardDTO(p, store.promotions));

  return {
    ...baseCard,
    description: product.description,
    fabricNotes: product.fabricNotes,
    careNotes: product.careNotes,
    fitNotes: product.fitNotes,
    images: [...product.images].sort((a, b) => a.sortOrder - b.sortOrder),
    sizeGuide: sizeGuide
      ? {
          id: sizeGuide.id,
          name: sizeGuide.name,
          unit: sizeGuide.unit,
          notesMarkdown: sizeGuide.notesMarkdown,
          measurements: sizeGuide.measurements,
        }
      : null,
    relatedProducts,
    seoTitle: product.seoTitle || `${product.name} | Fadé Exclusive`,
    seoDescription: product.seoDescription || product.description.slice(0, 155),
  };
}

export function mapToAdminProductDTO(product: SeedProduct): AdminProductDTO {
  const store = getStore();
  const now = new Date();
  const hasOrders = store.orders.some((o) =>
    o.items.some((item) => item.productId === product.id),
  );
  const totalStockOnHand = product.variants.reduce((acc, v) => acc + v.stockOnHand, 0);

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    type: product.type,
    categoryId: product.categoryId,
    categoryName: product.categoryName,
    description: product.description,
    priceMinor: product.priceMinor,
    compareAtPriceMinor: product.compareAtPriceMinor,
    currency: product.currency,
    leadTimeDays: product.leadTimeDays,
    depositPercent: product.depositPercent,
    fabricNotes: product.fabricNotes,
    careNotes: product.careNotes,
    fitNotes: product.fitNotes,
    status: product.status,
    isFeatured: product.isFeatured,
    sortOrder: product.sortOrder,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    hasOrders,
    totalStockOnHand,
    images: [...product.images].sort((a, b) => a.sortOrder - b.sortOrder),
    variants: [...product.variants]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((v) => ({
        id: v.id,
        label: v.label,
        sku: v.sku,
        priceOverrideMinor: v.priceOverrideMinor,
        stockOnHand: v.stockOnHand,
        availableStock: getAvailableVariantStock(v.id, v.stockOnHand, now),
        lowStockThreshold: v.lowStockThreshold,
        sortOrder: v.sortOrder,
      })),
    updatedAt: product.updatedAt,
  };
}

export function mapToCollectionCardDTO(col: SeedCollection): CollectionCardDTO {
  return {
    id: col.id,
    title: col.title,
    slug: col.slug,
    season: col.season,
    story: col.story,
    coverUrl: col.coverUrl,
    coverAlt: col.coverAlt,
    itemCount: col.items.length,
    status: col.status,
  };
}

export function mapToCollectionDetailDTO(col: SeedCollection): CollectionDetailDTO {
  const store = getStore();
  return {
    ...mapToCollectionCardDTO(col),
    items: [...col.items]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((item) => {
        const linked = item.linkedProductId
          ? store.products.find(
              (p) => p.id === item.linkedProductId && p.status === "published",
            )
          : null;
        return {
          id: item.id,
          imageUrl: item.imageUrl,
          altText: item.altText,
          caption: item.caption,
          linkedProduct: linked ? mapToProductCardDTO(linked, store.promotions) : null,
          sortOrder: item.sortOrder,
        };
      }),
  };
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "***";
  const prefix = local.slice(0, 2);
  return `${prefix}***@${domain}`;
}

export function mapToPublicOrderDTO(order: SeedOrder): PublicOrderDTO {
  const store = getStore();
  const amountDueMinor = Math.max(0, order.depositRequiredMinor - order.amountPaidMinor);
  const whatsappLink = buildOrderReceiptWhatsAppLink({
    businessWhatsApp: store.settings.whatsappNumber,
    orderNumber: order.orderNumber,
    referenceCode: order.referenceCode,
    amountMinor: amountDueMinor > 0 ? amountDueMinor : order.totalMinor,
    currency: order.currency,
    customerName: order.customerName,
  });

  const latestReceipt = order.receipts[order.receipts.length - 1] ?? null;

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    referenceCode: order.referenceCode,
    status: order.status,
    customerName: order.customerName,
    customerEmailMasked: maskEmail(order.customerEmail),
    deliveryCityState: `${order.deliveryAddress.city}, ${order.deliveryAddress.state}`,
    shippingOption: {
      name: order.shippingOption.name,
      feeMinor: order.shippingOption.feeMinor,
      eta: order.shippingOption.eta,
    },
    subtotalMinor: order.subtotalMinor,
    discountTotalMinor: order.discountTotalMinor,
    shippingMinor: order.shippingMinor,
    totalMinor: order.totalMinor,
    depositRequiredMinor: order.depositRequiredMinor,
    amountPaidMinor: order.amountPaidMinor,
    amountDueMinor,
    currency: order.currency,
    paymentDueAt: order.paymentDueAt,
    createdAt: order.createdAt,
    items: order.items.map((i) => ({
      id: i.id,
      productName: i.productName,
      productSlug: i.productSlug,
      variantLabel: i.variantLabel,
      productType: i.productType,
      unitPriceMinor: i.unitPriceMinor,
      qty: i.qty,
      lineSubtotalMinor: i.lineSubtotalMinor,
      lineDiscountMinor: i.lineDiscountMinor,
      lineTotalMinor: i.lineTotalMinor,
      leadTimeDays: i.leadTimeDays,
      imageUrl: i.imageUrl,
    })),
    discounts: order.discounts.map((d) => ({
      name: d.name,
      code: d.code,
      amountMinor: d.amountMinor,
    })),
    history: order.history.map((h) => ({
      fromStatus: h.fromStatus,
      toStatus: h.toStatus,
      createdAt: h.createdAt,
      note: h.note,
    })),
    bankAccounts: store.bankAccounts
      .filter((b) => b.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((b) => ({
        id: b.id,
        label: b.label,
        bankName: b.bankName,
        accountName: b.accountName,
        accountNumber: b.accountNumber,
        instructions: b.instructions,
      })),
    whatsappLink,
    latestReceiptToken: latestReceipt?.rawTokenForDemo ?? null,
  };
}

export function mapToAdminOrderDTO(order: SeedOrder): AdminOrderDTO {
  const env = getEnv();
  const baseUrl = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const amountDueMinor = Math.max(0, order.totalMinor - order.amountPaidMinor);

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    referenceCode: order.referenceCode,
    accessTokenForPreview: order.rawTokenForDemo ?? "",
    status: order.status,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    deliveryAddress: order.deliveryAddress,
    shippingOption: order.shippingOption,
    subtotalMinor: order.subtotalMinor,
    discountTotalMinor: order.discountTotalMinor,
    shippingMinor: order.shippingMinor,
    totalMinor: order.totalMinor,
    depositRequiredMinor: order.depositRequiredMinor,
    amountPaidMinor: order.amountPaidMinor,
    amountDueMinor,
    currency: order.currency,
    paymentDueAt: order.paymentDueAt,
    customerNotes: order.customerNotes,
    extraFields: order.extraFields,
    internalNotes: order.internalNotes,
    receiptAssetUrl: order.receiptAssetUrl,
    source: order.source,
    allowedNextStatuses: ALLOWED_ORDER_TRANSITIONS[order.status] ?? [],
    items: order.items.map((i) => ({
      id: i.id,
      productName: i.productName,
      productSlug: i.productSlug,
      variantLabel: i.variantLabel,
      productType: i.productType,
      unitPriceMinor: i.unitPriceMinor,
      qty: i.qty,
      lineSubtotalMinor: i.lineSubtotalMinor,
      lineDiscountMinor: i.lineDiscountMinor,
      lineTotalMinor: i.lineTotalMinor,
      leadTimeDays: i.leadTimeDays,
      imageUrl: i.imageUrl,
    })),
    discounts: order.discounts.map((d) => ({
      name: d.name,
      code: d.code,
      amountMinor: d.amountMinor,
    })),
    history: order.history,
    payments: order.payments.map((p) => ({
      id: p.id,
      kind: p.kind,
      amountMinor: p.amountMinor,
      status: p.status,
      confirmedBy: p.confirmedBy,
      confirmedAt: p.confirmedAt,
      bankReference: p.bankReference,
      notes: p.notes,
    })),
    receipts: order.receipts.map((r) => {
      const payment = order.payments.find((p) => p.id === r.paymentId);
      const token = r.rawTokenForDemo ?? "";
      const receiptUrl = `${baseUrl}/receipt/${token}`;
      return {
        id: r.id,
        receiptNumber: r.receiptNumber,
        token,
        issuedAt: r.issuedAt,
        whatsappShareUrl: buildAdminReceiptShareWhatsAppLink({
          customerPhone: order.customerPhone,
          customerName: order.customerName,
          orderNumber: order.orderNumber,
          receiptNumber: r.receiptNumber,
          amountMinor: payment?.amountMinor ?? order.amountPaidMinor,
          currency: order.currency,
          receiptUrl,
        }),
      };
    }),
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

export function mapToPublicReceiptDTO(params: {
  receipt: SeedReceipt;
  order: SeedOrder;
  payment: SeedPayment;
}): PublicReceiptDTO {
  const store = getStore();
  const { receipt, order, payment } = params;
  return {
    receiptNumber: receipt.receiptNumber,
    issuedAt: receipt.issuedAt,
    orderNumber: order.orderNumber,
    referenceCode: order.referenceCode,
    customerName: order.customerName,
    customerEmail: maskEmail(order.customerEmail),
    paymentKind: payment.kind,
    paymentMethod: "Manual Bank Transfer",
    amountConfirmedMinor: payment.amountMinor,
    orderTotalMinor: order.totalMinor,
    totalPaidMinor: order.amountPaidMinor,
    balanceRemainingMinor: Math.max(0, order.totalMinor - order.amountPaidMinor),
    currency: order.currency,
    bankReference: payment.bankReference,
    businessName: store.settings.businessName,
    businessAddress: store.settings.address,
    businessEmail: store.settings.contactEmail,
    items: order.items.map((i) => ({
      id: i.id,
      productName: i.productName,
      productSlug: i.productSlug,
      variantLabel: i.variantLabel,
      productType: i.productType,
      unitPriceMinor: i.unitPriceMinor,
      qty: i.qty,
      lineSubtotalMinor: i.lineSubtotalMinor,
      lineDiscountMinor: i.lineDiscountMinor,
      lineTotalMinor: i.lineTotalMinor,
      leadTimeDays: i.leadTimeDays,
      imageUrl: i.imageUrl,
    })),
    discounts: order.discounts.map((d) => ({
      name: d.name,
      code: d.code,
      amountMinor: d.amountMinor,
    })),
    shippingMinor: order.shippingMinor,
  };
}

export function mapToPromotionAdminDTO(
  promo: SeedPromotion,
  now: Date = new Date(),
): PromotionAdminDTO {
  const store = getStore();
  const activeRedemptions = store.promotionRedemptions.filter(
    (r) => r.promotionId === promo.id && !r.releasedAt,
  );
  const redemptionsCount = activeRedemptions.length;
  const totalDiscountGivenMinor = activeRedemptions.reduce(
    (sum, r) => sum + r.amountMinor,
    0,
  );

  let computedStatus: PromotionAdminDTO["computedStatus"] = "active";
  if (!promo.isActive) {
    computedStatus = "disabled";
  } else if (promo.endsAt && new Date(promo.endsAt).getTime() < now.getTime()) {
    computedStatus = "expired";
  } else if (promo.startsAt && new Date(promo.startsAt).getTime() > now.getTime()) {
    computedStatus = "scheduled";
  }

  return {
    id: promo.id,
    name: promo.name,
    kind: promo.kind,
    code: promo.code,
    discountType: promo.discountType,
    value: promo.value,
    scope: promo.scope,
    targetIds: promo.targetIds,
    eligibleProductTypes: promo.eligibleProductTypes,
    minOrderMinor: promo.minOrderMinor,
    maxDiscountMinor: promo.maxDiscountMinor,
    usageLimitTotal: promo.usageLimitTotal,
    usageLimitPerCustomer: promo.usageLimitPerCustomer,
    startsAt: promo.startsAt,
    endsAt: promo.endsAt,
    isActive: promo.isActive,
    stackable: promo.stackable,
    excludeDiscountedItems: promo.excludeDiscountedItems,
    redemptionsCount,
    totalDiscountGivenMinor,
    computedStatus,
    updatedAt: promo.updatedAt,
  };
}

export function mapToCustomRequestAdminDTO(
  req: SeedCustomRequest,
): CustomRequestAdminDTO {
  const whatsappQuoteLink =
    req.quoteMinor && req.depositMinor
      ? buildCustomQuoteWhatsAppLink({
          customerPhone: req.customerPhone,
          customerName: req.customerName,
          requestNumber: req.requestNumber,
          quoteMinor: req.quoteMinor,
          depositMinor: req.depositMinor,
          currency: req.currency,
          estimatedCompletion: req.estimatedCompletion || "14–21 days",
        })
      : null;

  return {
    id: req.id,
    requestNumber: req.requestNumber,
    customerName: req.customerName,
    customerEmail: req.customerEmail,
    customerPhone: req.customerPhone,
    occasion: req.occasion,
    eventDate: req.eventDate,
    budgetRange: req.budgetRange,
    styleNotes: req.styleNotes,
    measurements: req.measurements,
    referenceImageUrls: req.referenceImageUrls,
    preferredContact: req.preferredContact,
    status: req.status,
    quoteMinor: req.quoteMinor,
    depositMinor: req.depositMinor,
    currency: req.currency,
    estimatedCompletion: req.estimatedCompletion,
    adminNotes: req.adminNotes,
    convertedOrderId: req.convertedOrderId,
    whatsappQuoteLink,
    formVersionSnapshot: req.formVersionSnapshot,
    createdAt: req.createdAt,
    updatedAt: req.updatedAt,
  };
}
