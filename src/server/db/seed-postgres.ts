import "server-only";
import crypto from "crypto";
import { sql } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import { getStore } from "./client";
import { hashPassword } from "@/server/security/crypto";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Deterministically maps any arbitrary string ID into a valid RFC 4122 UUID.
 * Preserves existing valid UUID strings intact.
 */
export function toUuid(id: string): string {
  if (UUID_REGEX.test(id)) {
    return id;
  }
  const hash = crypto.createHash("md5").update(id).digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

export interface SeedSummary {
  users: number;
  categories: number;
  products: number;
  variants: number;
  images: number;
  collections: number;
  collectionItems: number;
  banners: number;
  promotions: number;
  forms: number;
  orders: number;
  customRequests: number;
  settings: number;
  bankAccounts: number;
  contentPages: number;
}

/**
 * Truncates all application tables in Neon PostgreSQL.
 * Used when running `pnpm db:seed --reset` or `pnpm db:reset`.
 */
export async function clearPostgresDatabase(
  db: PostgresJsDatabase<typeof schema>,
): Promise<void> {
  await db.execute(sql`
    TRUNCATE TABLE 
      audit_logs,
      receipts,
      payments,
      order_status_history,
      promotion_redemptions,
      order_discounts,
      stock_reservations,
      order_items,
      orders,
      custom_requests,
      form_submissions,
      forms,
      banners,
      promotions,
      content_pages,
      press_items,
      collection_items,
      collections,
      product_images,
      product_variants,
      product_categories,
      products,
      categories,
      size_guides,
      media_assets,
      sessions,
      users,
      bank_accounts,
      settings
    CASCADE;
  `);
}

/**
 * Seeds the connected PostgreSQL database (Neon) using Drizzle ORM.
 * Idempotent: uses onConflictDoNothing to avoid duplicating records.
 * If `options.reset` is true, clears all existing table data before seeding.
 */
export async function seedPostgresDatabase(
  db: PostgresJsDatabase<typeof schema>,
  options: { reset?: boolean } = {},
): Promise<SeedSummary> {
  if (options.reset) {
    await clearPostgresDatabase(db);
  }

  const store = getStore();
  const summary: SeedSummary = {
    users: 0,
    categories: 0,
    products: 0,
    variants: 0,
    images: 0,
    collections: 0,
    collectionItems: 0,
    banners: 0,
    promotions: 0,
    forms: 0,
    orders: 0,
    customRequests: 0,
    settings: 0,
    bankAccounts: 0,
    contentPages: 0,
  };

  // 1. USERS
  const ownerEmail = (process.env.OWNER_EMAIL || "owner@fadeexclusive.com")
    .trim()
    .toLowerCase();
  const ownerName = process.env.OWNER_NAME?.trim() || "Fadé Owner";
  const ownerPassword = process.env.OWNER_PASSWORD || "FadeOwner2026!Secure";
  const ownerHash = hashPassword(ownerPassword);

  const userRecords = [
    {
      id: toUuid("usr-owner-01"),
      name: ownerName,
      email: ownerEmail,
      emailVerified: true,
      passwordHash: ownerHash,
      role: "owner" as const,
      isActive: true,
      totpEnabled: false,
      totpSecret: null,
      failedLoginAttempts: 0,
      lockedUntil: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    ...store.users.map((u) => ({
      id: toUuid(u.id),
      name: u.name,
      email: u.email,
      emailVerified: true,
      passwordHash: u.passwordHash,
      role: u.role,
      isActive: u.isActive,
      totpEnabled: u.totpEnabled,
      totpSecret: u.totpSecret,
      failedLoginAttempts: u.failedLoginAttempts,
      lockedUntil: u.lockedUntil ? new Date(u.lockedUntil) : null,
      createdAt: new Date(u.createdAt),
      updatedAt: new Date(u.updatedAt),
    })),
  ];

  for (const u of userRecords) {
    await db.insert(schema.users).values(u).onConflictDoNothing();
    summary.users++;
  }

  // 2. SIZE GUIDES
  for (const sg of store.sizeGuides) {
    await db
      .insert(schema.sizeGuides)
      .values({
        id: toUuid(sg.id),
        name: sg.name,
        slug: sg.slug,
        unit: sg.unit,
        notesMarkdown: sg.notesMarkdown,
        measurementsJson: sg.measurements,
        updatedAt: new Date(),
      })
      .onConflictDoNothing();
  }

  // 3. CATEGORIES
  for (const cat of store.categories) {
    await db
      .insert(schema.categories)
      .values({
        id: toUuid(cat.id),
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        sortOrder: cat.sortOrder,
        createdAt: new Date(),
      })
      .onConflictDoNothing();
    summary.categories++;
  }

  // 4. MEDIA ASSETS
  for (const m of store.mediaAssets) {
    await db
      .insert(schema.mediaAssets)
      .values({
        id: toUuid(m.id),
        bucket: m.bucket,
        objectKey: m.objectKey,
        url: m.url,
        mimeType: m.mimeType,
        sizeBytes: m.sizeBytes,
        altText: m.altText,
        createdAt: new Date(m.createdAt),
      })
      .onConflictDoNothing();
  }

  // 5. PRODUCTS, VARIANTS, IMAGES, CATEGORY LINKS
  for (const p of store.products) {
    await db
      .insert(schema.products)
      .values({
        id: toUuid(p.id),
        name: p.name,
        slug: p.slug,
        type: p.type,
        description: p.description,
        priceMinor: p.priceMinor,
        compareAtPriceMinor: p.compareAtPriceMinor,
        currency: p.currency,
        leadTimeDays: p.leadTimeDays,
        depositPercent: p.depositPercent,
        fabricNotes: p.fabricNotes,
        careNotes: p.careNotes,
        fitNotes: p.fitNotes,
        sizeGuideId: p.sizeGuideId ? toUuid(p.sizeGuideId) : null,
        status: p.status,
        isFeatured: p.isFeatured,
        sortOrder: p.sortOrder,
        seoTitle: p.seoTitle,
        seoDescription: p.seoDescription,
        publishedAt: p.status === "published" ? new Date(p.createdAt) : null,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
      })
      .onConflictDoNothing();
    summary.products++;

    if (p.categoryId) {
      await db
        .insert(schema.productCategories)
        .values({
          id: toUuid(`pc-${p.id}-${p.categoryId}`),
          productId: toUuid(p.id),
          categoryId: toUuid(p.categoryId),
        })
        .onConflictDoNothing();
    }

    for (const v of p.variants) {
      await db
        .insert(schema.productVariants)
        .values({
          id: toUuid(v.id),
          productId: toUuid(p.id),
          label: v.label,
          sku: v.sku,
          priceOverrideMinor: v.priceOverrideMinor,
          stockOnHand: v.stockOnHand,
          lowStockThreshold: v.lowStockThreshold,
          sortOrder: v.sortOrder,
          createdAt: new Date(p.createdAt),
        })
        .onConflictDoNothing();
      summary.variants++;
    }

    for (const img of p.images) {
      await db
        .insert(schema.productImages)
        .values({
          id: toUuid(img.id),
          productId: toUuid(p.id),
          url: img.url,
          altText: img.altText,
          sortOrder: img.sortOrder,
        })
        .onConflictDoNothing();
      summary.images++;
    }
  }

  // 6. COLLECTIONS & COLLECTION ITEMS
  for (const c of store.collections) {
    await db
      .insert(schema.collections)
      .values({
        id: toUuid(c.id),
        title: c.title,
        slug: c.slug,
        season: c.season,
        story: c.story,
        coverUrl: c.coverUrl,
        coverAlt: c.coverAlt,
        status: c.status,
        sortOrder: c.sortOrder,
        createdAt: new Date(c.createdAt),
        updatedAt: new Date(c.updatedAt),
      })
      .onConflictDoNothing();
    summary.collections++;

    for (const item of c.items) {
      await db
        .insert(schema.collectionItems)
        .values({
          id: toUuid(item.id),
          collectionId: toUuid(c.id),
          imageUrl: item.imageUrl,
          altText: item.altText,
          caption: item.caption,
          linkedProductId: item.linkedProductId ? toUuid(item.linkedProductId) : null,
          sortOrder: item.sortOrder,
        })
        .onConflictDoNothing();
      summary.collectionItems++;
    }
  }

  // 7. PRESS ITEMS
  for (const pi of store.pressItems) {
    await db
      .insert(schema.pressItems)
      .values({
        id: toUuid(pi.id),
        outlet: pi.outlet,
        title: pi.title,
        excerpt: pi.excerpt,
        url: pi.url,
        publishedDate: pi.publishedDate,
        coverUrl: pi.coverUrl,
        coverAlt: pi.coverAlt,
        isFeatured: pi.isFeatured,
        sortOrder: pi.sortOrder,
        createdAt: new Date(),
      })
      .onConflictDoNothing();
  }

  // 8. CONTENT PAGES
  for (const cp of store.contentPages) {
    await db
      .insert(schema.contentPages)
      .values({
        id: toUuid(cp.id),
        slug: cp.slug,
        title: cp.title,
        subtitle: cp.subtitle,
        bodyMarkdown: cp.bodyMarkdown,
        updatedAt: new Date(cp.updatedAt),
      })
      .onConflictDoNothing();
    summary.contentPages++;
  }

  // 9. PROMOTIONS
  for (const promo of store.promotions) {
    await db
      .insert(schema.promotions)
      .values({
        id: toUuid(promo.id),
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
        startsAt: promo.startsAt ? new Date(promo.startsAt) : null,
        endsAt: promo.endsAt ? new Date(promo.endsAt) : null,
        isActive: promo.isActive,
        stackable: promo.stackable,
        excludeDiscountedItems: promo.excludeDiscountedItems,
        linkedBannerId: null,
        createdBy: toUuid("usr-owner-01"),
        createdAt: new Date(promo.createdAt),
        updatedAt: new Date(promo.updatedAt),
      })
      .onConflictDoNothing();
    summary.promotions++;
  }

  // 10. BANNERS
  for (const b of store.banners) {
    await db
      .insert(schema.banners)
      .values({
        id: toUuid(b.id),
        type: b.type,
        title: b.title,
        subtitle: b.subtitle,
        ctaLabel: b.ctaLabel,
        ctaUrl: b.ctaUrl,
        backgroundColor: b.backgroundColor,
        textColor: b.textColor,
        buttonBgColor: b.buttonBgColor,
        buttonTextColor: b.buttonTextColor,
        imageUrl: b.imageUrl,
        imageAlt: b.imageAlt,
        placement: b.placement,
        priority: b.priority,
        startsAt: b.startsAt ? new Date(b.startsAt) : null,
        endsAt: b.endsAt ? new Date(b.endsAt) : null,
        isActive: b.isActive,
        dismissible: b.dismissible,
        version: b.version,
        linkedPromotionId: b.linkedPromotionId ? toUuid(b.linkedPromotionId) : null,
        updatedAt: new Date(b.updatedAt),
      })
      .onConflictDoNothing();
    summary.banners++;
  }

  // 11. FORMS
  for (const f of store.forms) {
    await db
      .insert(schema.forms)
      .values({
        id: toUuid(f.id),
        slug: f.slug,
        title: f.title,
        description: f.description,
        version: f.version,
        fieldsJson: f.fields,
        updatedAt: new Date(f.updatedAt),
      })
      .onConflictDoNothing();
    summary.forms++;
  }

  // 12. CUSTOM FIT REQUESTS
  for (const cr of store.customRequests) {
    await db
      .insert(schema.customRequests)
      .values({
        id: toUuid(cr.id),
        requestNumber: cr.requestNumber,
        submissionId: null,
        customerName: cr.customerName,
        customerEmail: cr.customerEmail,
        customerPhone: cr.customerPhone,
        occasion: cr.occasion,
        eventDate: cr.eventDate,
        budgetRange: cr.budgetRange,
        styleNotes: cr.styleNotes,
        measurementsJson: cr.measurements,
        referenceImageUrls: cr.referenceImageUrls,
        preferredContact: cr.preferredContact,
        status: cr.status,
        quoteMinor: cr.quoteMinor,
        depositMinor: cr.depositMinor,
        currency: cr.currency,
        estimatedCompletion: cr.estimatedCompletion,
        adminNotes: cr.adminNotes,
        convertedOrderId: null,
        formVersionSnapshot: cr.formVersionSnapshot,
        createdAt: new Date(cr.createdAt),
        updatedAt: new Date(cr.updatedAt),
      })
      .onConflictDoNothing();
    summary.customRequests++;
  }

  // 13. DEMO ORDERS & RELATED RECORDS
  for (const o of store.orders) {
    await db
      .insert(schema.orders)
      .values({
        id: toUuid(o.id),
        orderNumber: o.orderNumber,
        referenceCode: o.referenceCode,
        accessTokenHash: o.accessTokenHash,
        idempotencyKey: o.idempotencyKey,
        status: o.status,
        customerName: o.customerName,
        customerEmail: o.customerEmail,
        customerPhone: o.customerPhone,
        deliveryAddressJson: o.deliveryAddress,
        shippingOptionJson: o.shippingOption,
        subtotalMinor: o.subtotalMinor,
        discountTotalMinor: o.discountTotalMinor,
        shippingMinor: o.shippingMinor,
        totalMinor: o.totalMinor,
        depositRequiredMinor: o.depositRequiredMinor,
        amountPaidMinor: o.amountPaidMinor,
        currency: o.currency,
        paymentDueAt: new Date(o.paymentDueAt),
        customerNotes: o.customerNotes,
        extraFieldsJson: o.extraFields,
        internalNotes: o.internalNotes,
        receiptAssetUrl: o.receiptAssetUrl,
        source: o.source,
        createdAt: new Date(o.createdAt),
        updatedAt: new Date(o.updatedAt),
      })
      .onConflictDoNothing();
    summary.orders++;

    for (const item of o.items) {
      await db
        .insert(schema.orderItems)
        .values({
          id: toUuid(item.id),
          orderId: toUuid(o.id),
          productId: item.productId ? toUuid(item.productId) : null,
          variantId: item.variantId ? toUuid(item.variantId) : null,
          productName: item.productName,
          productSlug: item.productSlug,
          variantLabel: item.variantLabel,
          productType: item.productType,
          unitPriceMinor: item.unitPriceMinor,
          qty: item.qty,
          lineSubtotalMinor: item.lineSubtotalMinor,
          lineDiscountMinor: item.lineDiscountMinor,
          lineTotalMinor: item.lineTotalMinor,
          leadTimeDays: item.leadTimeDays,
          depositPercent: item.depositPercent,
          imageUrl: item.imageUrl,
        })
        .onConflictDoNothing();
    }

    for (const d of o.discounts) {
      await db
        .insert(schema.orderDiscounts)
        .values({
          id: toUuid(d.id),
          orderId: toUuid(o.id),
          promotionId: d.promotionId ? toUuid(d.promotionId) : null,
          name: d.name,
          code: d.code,
          kind: d.kind,
          discountType: d.discountType,
          amountMinor: d.amountMinor,
        })
        .onConflictDoNothing();
    }

    for (const h of o.history) {
      await db
        .insert(schema.orderStatusHistory)
        .values({
          id: toUuid(h.id),
          orderId: toUuid(o.id),
          fromStatus: h.fromStatus,
          toStatus: h.toStatus,
          actor: h.actor,
          note: h.note,
          createdAt: new Date(h.createdAt),
        })
        .onConflictDoNothing();
    }

    for (const p of o.payments) {
      await db
        .insert(schema.payments)
        .values({
          id: toUuid(p.id),
          orderId: toUuid(o.id),
          kind: p.kind,
          method: p.method,
          amountMinor: p.amountMinor,
          currency: p.currency,
          status: p.status,
          confirmedBy: p.confirmedBy,
          confirmedAt: p.confirmedAt ? new Date(p.confirmedAt) : null,
          bankReference: p.bankReference,
          receiptAssetUrl: p.receiptAssetUrl,
          notes: p.notes,
          createdAt: new Date(p.createdAt),
        })
        .onConflictDoNothing();
    }

    for (const r of o.receipts) {
      await db
        .insert(schema.receipts)
        .values({
          id: toUuid(r.id),
          orderId: toUuid(o.id),
          paymentId: toUuid(r.paymentId),
          receiptNumber: r.receiptNumber,
          tokenHash: r.tokenHash,
          issuedAt: new Date(r.issuedAt),
        })
        .onConflictDoNothing();
    }
  }

  // 14. BANK ACCOUNTS
  for (const ba of store.bankAccounts) {
    await db
      .insert(schema.bankAccounts)
      .values({
        id: toUuid(ba.id),
        label: ba.label,
        bankName: ba.bankName,
        accountName: ba.accountName,
        accountNumber: ba.accountNumber,
        instructions: ba.instructions,
        isActive: ba.isActive,
        sortOrder: ba.sortOrder,
        updatedAt: new Date(ba.updatedAt),
      })
      .onConflictDoNothing();
    summary.bankAccounts++;
  }

  // 15. SETTINGS
  await db
    .insert(schema.settings)
    .values({
      id: "singleton",
      businessName: store.settings.businessName,
      tagline: store.settings.tagline,
      contactEmail: store.settings.contactEmail,
      whatsappNumber: store.settings.whatsappNumber,
      address: store.settings.address,
      currency: store.settings.currency,
      defaultPhoneCountry: store.settings.defaultPhoneCountry,
      paymentWindowHours: store.settings.paymentWindowHours,
      orderPrefix: store.settings.orderPrefix,
      largeDiscountAlertThresholdPercent:
        store.settings.largeDiscountAlertThresholdPercent,
      storePaused: store.settings.storePaused,
      storePausedMessage: store.settings.storePausedMessage,
      shippingOptionsJson: store.settings.shippingOptions,
      socialLinksJson: store.settings.socialLinks,
      seoDefaultsJson: store.settings.seoDefaults,
      updatedAt: new Date(store.settings.updatedAt),
    })
    .onConflictDoNothing();
  summary.settings++;

  // 16. AUDIT LOGS
  for (const al of store.auditLogs) {
    await db
      .insert(schema.auditLogs)
      .values({
        id: toUuid(al.id),
        actorId: al.actorId,
        actorEmail: al.actorEmail,
        actorRole: al.actorRole,
        action: al.action,
        entity: al.entity,
        entityId: al.entityId,
        summary: al.summary,
        beforeJson: al.beforeJson,
        afterJson: al.afterJson,
        createdAt: new Date(al.createdAt),
      })
      .onConflictDoNothing();
  }

  return summary;
}
