import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// 1. USERS & BETTER AUTH TABLES
export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    emailVerified: boolean("email_verified").notNull().default(false),
    image: text("image"),
    passwordHash: text("password_hash").notNull(),
    role: text("role", { enum: ["owner", "manager", "customer"] })
      .notNull()
      .default("manager"),
    isActive: boolean("is_active").notNull().default(true),
    totpEnabled: boolean("totp_enabled").notNull().default(false),
    totpSecret: text("totp_secret"),
    failedLoginAttempts: integer("failed_login_attempts").notNull().default(0),
    lockedUntil: timestamp("locked_until", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("users_email_idx").on(table.email)],
);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("sessions_token_hash_idx").on(table.tokenHash),
    index("sessions_user_id_idx").on(table.userId),
  ],
);

// 2. MEDIA ASSETS & CATALOG
export const mediaAssets = pgTable("media_assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  bucket: text("bucket", { enum: ["public", "private"] }).notNull().default("public"),
  objectKey: text("object_key").notNull(),
  url: text("url").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  width: integer("width"),
  height: integer("height"),
  altText: text("alt_text").notNull(),
  variantsJson: jsonb("variants_json").$type<{
    w480?: string;
    w960?: string;
    w1920?: string;
  }>(),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const sizeGuides = pgTable("size_guides", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  unit: text("unit", { enum: ["cm", "in"] }).notNull().default("cm"),
  notesMarkdown: text("notes_markdown").notNull(),
  measurementsJson: jsonb("measurements_json")
    .$type<Array<{ size: string; chest: string; shoulder: string; sleeve: string; length: string; waist?: string }>>()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("categories_slug_idx").on(table.slug)],
);

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    type: text("type", { enum: ["ready_to_wear", "made_to_order"] }).notNull(),
    description: text("description").notNull(),
    priceMinor: integer("price_minor").notNull(),
    compareAtPriceMinor: integer("compare_at_price_minor"),
    currency: text("currency").notNull().default("NGN"),
    leadTimeDays: integer("lead_time_days"),
    depositPercent: integer("deposit_percent"),
    fabricNotes: text("fabric_notes"),
    careNotes: text("care_notes"),
    fitNotes: text("fit_notes"),
    sizeGuideId: uuid("size_guide_id").references(() => sizeGuides.id),
    status: text("status", { enum: ["draft", "published", "archived"] })
      .notNull()
      .default("draft"),
    isFeatured: boolean("is_featured").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("products_slug_idx").on(table.slug),
    index("products_status_idx").on(table.status),
  ],
);

export const productCategories = pgTable(
  "product_categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
  },
  (table) => [index("prod_cat_product_idx").on(table.productId)],
);

export const productVariants = pgTable(
  "product_variants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    sku: text("sku").notNull(),
    priceOverrideMinor: integer("price_override_minor"),
    stockOnHand: integer("stock_on_hand").notNull().default(0),
    lowStockThreshold: integer("low_stock_threshold").notNull().default(2),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("variants_product_idx").on(table.productId),
    uniqueIndex("variants_sku_idx").on(table.sku),
  ],
);

export const productImages = pgTable(
  "product_images",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    assetId: uuid("asset_id").references(() => mediaAssets.id),
    url: text("url").notNull(),
    altText: text("alt_text").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [index("product_images_product_idx").on(table.productId)],
);

// 3. COLLECTIONS (LOOKBOOKS), PRESS & CONTENT PAGES
export const collections = pgTable(
  "collections",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    season: text("season"),
    story: text("story").notNull(),
    coverUrl: text("cover_url").notNull(),
    coverAlt: text("cover_alt").notNull(),
    status: text("status", { enum: ["draft", "published", "archived"] })
      .notNull()
      .default("published"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("collections_slug_idx").on(table.slug)],
);

export const collectionItems = pgTable(
  "collection_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    collectionId: uuid("collection_id")
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),
    imageUrl: text("image_url").notNull(),
    altText: text("alt_text").notNull(),
    caption: text("caption"),
    linkedProductId: uuid("linked_product_id").references(() => products.id, {
      onDelete: "set null",
    }),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [index("collection_items_col_idx").on(table.collectionId)],
);

export const pressItems = pgTable("press_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  outlet: text("outlet").notNull(),
  title: text("title").notNull(),
  excerpt: text("excerpt"),
  url: text("url").notNull(),
  publishedDate: text("published_date").notNull(),
  coverUrl: text("cover_url").notNull(),
  coverAlt: text("cover_alt").notNull(),
  isFeatured: boolean("is_featured").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const contentPages = pgTable(
  "content_pages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    subtitle: text("subtitle"),
    bodyMarkdown: text("body_markdown").notNull(),
    structuredJson: jsonb("structured_json").$type<Record<string, unknown>>(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("content_pages_slug_idx").on(table.slug)],
);

// 4. BANNERS & PROMOTIONS
export const promotions = pgTable(
  "promotions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    kind: text("kind", { enum: ["coupon", "automatic"] }).notNull(),
    code: text("code"),
    discountType: text("discount_type", {
      enum: ["percentage", "fixed_amount", "free_shipping"],
    }).notNull(),
    value: integer("value").notNull(),
    scope: text("scope", {
      enum: ["order", "products", "categories", "collections"],
    })
      .notNull()
      .default("order"),
    targetIds: jsonb("target_ids").$type<string[]>().notNull().default([]),
    eligibleProductTypes: jsonb("eligible_product_types")
      .$type<Array<"ready_to_wear" | "made_to_order">>()
      .notNull()
      .default(["ready_to_wear", "made_to_order"]),
    minOrderMinor: integer("min_order_minor"),
    maxDiscountMinor: integer("max_discount_minor"),
    usageLimitTotal: integer("usage_limit_total"),
    usageLimitPerCustomer: integer("usage_limit_per_customer"),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    isActive: boolean("is_active").notNull().default(true),
    stackable: boolean("stackable").notNull().default(false),
    excludeDiscountedItems: boolean("exclude_discounted_items").notNull().default(false),
    linkedBannerId: uuid("linked_banner_id"),
    createdBy: uuid("created_by").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("promotions_code_idx").on(table.code)],
);

export const banners = pgTable("banners", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: text("type", {
    enum: ["announcement_bar", "hero_banner", "promo_strip"],
  }).notNull(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  ctaLabel: text("cta_label"),
  ctaUrl: text("cta_url"),
  backgroundColor: text("background_color").notNull().default("#161412"),
  textColor: text("text_color").notNull().default("#F4F1EA"),
  buttonBgColor: text("button_bg_color").notNull().default("#9E7344"),
  buttonTextColor: text("button_text_color").notNull().default("#FAF8F4"),
  imageUrl: text("image_url"),
  imageAlt: text("image_alt"),
  placement: text("placement").notNull().default("global"),
  priority: integer("priority").notNull().default(10),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  isActive: boolean("is_active").notNull().default(true),
  dismissible: boolean("dismissible").notNull().default(true),
  version: integer("version").notNull().default(1),
  linkedPromotionId: uuid("linked_promotion_id").references(() => promotions.id, {
    onDelete: "set null",
  }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 5. ORDERS, INVENTORY RESERVATIONS, PAYMENTS & RECEIPTS
export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderNumber: text("order_number").notNull(),
    referenceCode: text("reference_code").notNull(),
    accessTokenHash: text("access_token_hash").notNull(),
    idempotencyKey: text("idempotency_key").notNull(),
    status: text("status", {
      enum: [
        "awaiting_payment",
        "payment_submitted",
        "paid",
        "deposit_paid",
        "in_production",
        "ready",
        "shipped",
        "ready_for_pickup",
        "delivered",
        "cancelled",
        "expired",
        "refunded",
      ],
    })
      .notNull()
      .default("awaiting_payment"),
    customerName: text("customer_name").notNull(),
    customerEmail: text("customer_email").notNull(),
    customerPhone: text("customer_phone").notNull(),
    deliveryAddressJson: jsonb("delivery_address_json")
      .$type<{
        line1: string;
        line2?: string;
        city: string;
        state: string;
        postalCode?: string;
        country: string;
      }>()
      .notNull(),
    shippingOptionJson: jsonb("shipping_option_json")
      .$type<{
        id: string;
        name: string;
        feeMinor: number;
        eta: string;
      }>()
      .notNull(),
    subtotalMinor: integer("subtotal_minor").notNull(),
    discountTotalMinor: integer("discount_total_minor").notNull().default(0),
    shippingMinor: integer("shipping_minor").notNull().default(0),
    totalMinor: integer("total_minor").notNull(),
    depositRequiredMinor: integer("deposit_required_minor").notNull(),
    amountPaidMinor: integer("amount_paid_minor").notNull().default(0),
    currency: text("currency").notNull().default("NGN"),
    paymentDueAt: timestamp("payment_due_at", { withTimezone: true }).notNull(),
    customerNotes: text("customer_notes"),
    extraFieldsJson: jsonb("extra_fields_json").$type<Record<string, unknown>>(),
    internalNotes: text("internal_notes"),
    receiptAssetUrl: text("receipt_asset_url"),
    source: text("source", { enum: ["storefront", "custom_fit"] })
      .notNull()
      .default("storefront"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("orders_number_idx").on(table.orderNumber),
    uniqueIndex("orders_ref_code_idx").on(table.referenceCode),
    uniqueIndex("orders_idempotency_idx").on(table.idempotencyKey),
    uniqueIndex("orders_token_hash_idx").on(table.accessTokenHash),
    index("orders_status_idx").on(table.status),
  ],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: uuid("product_id"),
    variantId: uuid("variant_id"),
    productName: text("product_name").notNull(),
    productSlug: text("product_slug").notNull(),
    variantLabel: text("variant_label").notNull(),
    productType: text("product_type", {
      enum: ["ready_to_wear", "made_to_order", "custom_fit"],
    }).notNull(),
    unitPriceMinor: integer("unit_price_minor").notNull(),
    qty: integer("qty").notNull(),
    lineSubtotalMinor: integer("line_subtotal_minor").notNull(),
    lineDiscountMinor: integer("line_discount_minor").notNull().default(0),
    lineTotalMinor: integer("line_total_minor").notNull(),
    leadTimeDays: integer("lead_time_days"),
    depositPercent: integer("deposit_percent"),
    imageUrl: text("image_url"),
  },
  (table) => [index("order_items_order_idx").on(table.orderId)],
);

export const orderDiscounts = pgTable(
  "order_discounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    promotionId: uuid("promotion_id"),
    name: text("name").notNull(),
    code: text("code"),
    kind: text("kind", { enum: ["coupon", "automatic"] }).notNull(),
    discountType: text("discount_type", {
      enum: ["percentage", "fixed_amount", "free_shipping"],
    }).notNull(),
    amountMinor: integer("amount_minor").notNull(),
  },
  (table) => [index("order_discounts_order_idx").on(table.orderId)],
);

export const promotionRedemptions = pgTable(
  "promotion_redemptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    promotionId: uuid("promotion_id")
      .notNull()
      .references(() => promotions.id, { onDelete: "cascade" }),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    customerIdentifierHash: text("customer_identifier_hash").notNull(),
    amountMinor: integer("amount_minor").notNull(),
    releasedAt: timestamp("released_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("redemptions_promo_idx").on(table.promotionId),
    index("redemptions_order_idx").on(table.orderId),
  ],
);

export const orderStatusHistory = pgTable(
  "order_status_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    fromStatus: text("from_status"),
    toStatus: text("to_status").notNull(),
    actor: text("actor").notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("order_history_order_idx").on(table.orderId)],
);

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    kind: text("kind", { enum: ["full", "deposit", "balance"] }).notNull(),
    method: text("method", { enum: ["manual_transfer"] })
      .notNull()
      .default("manual_transfer"),
    amountMinor: integer("amount_minor").notNull(),
    currency: text("currency").notNull().default("NGN"),
    status: text("status", { enum: ["pending", "confirmed", "rejected"] })
      .notNull()
      .default("pending"),
    confirmedBy: text("confirmed_by"),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
    bankReference: text("bank_reference"),
    receiptAssetUrl: text("receipt_asset_url"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("payments_order_idx").on(table.orderId)],
);

export const receipts = pgTable(
  "receipts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    paymentId: uuid("payment_id")
      .notNull()
      .references(() => payments.id, { onDelete: "cascade" }),
    receiptNumber: text("receipt_number").notNull(),
    tokenHash: text("token_hash").notNull(),
    issuedAt: timestamp("issued_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("receipts_number_idx").on(table.receiptNumber),
    uniqueIndex("receipts_token_hash_idx").on(table.tokenHash),
  ],
);

export const stockReservations = pgTable(
  "stock_reservations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "cascade" }),
    qty: integer("qty").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    releasedAt: timestamp("released_at", { withTimezone: true }),
    consumedAt: timestamp("consumed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("reservations_variant_idx").on(table.variantId),
    index("reservations_order_idx").on(table.orderId),
  ],
);

// 6. DYNAMIC FORMS & CUSTOM FIT REQUESTS
export const forms = pgTable(
  "forms",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug", { enum: ["contact", "custom-fit", "checkout-extra"] }).notNull(),
    title: text("title").notNull(),
    description: text("description"),
    version: integer("version").notNull().default(1),
    fieldsJson: jsonb("fields_json").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("forms_slug_idx").on(table.slug)],
);

export const formSubmissions = pgTable("form_submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  formId: uuid("form_id")
    .notNull()
    .references(() => forms.id, { onDelete: "cascade" }),
  formSlug: text("form_slug").notNull(),
  formVersion: integer("form_version").notNull(),
  schemaSnapshotJson: jsonb("schema_snapshot_json").notNull(),
  answersJson: jsonb("answers_json").$type<Record<string, unknown>>().notNull(),
  customerName: text("customer_name"),
  customerEmail: text("customer_email"),
  customerPhone: text("customer_phone"),
  status: text("status", { enum: ["new", "read", "archived"] })
    .notNull()
    .default("new"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const customRequests = pgTable(
  "custom_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    requestNumber: text("request_number").notNull(),
    submissionId: uuid("submission_id").references(() => formSubmissions.id),
    customerName: text("customer_name").notNull(),
    customerEmail: text("customer_email").notNull(),
    customerPhone: text("customer_phone").notNull(),
    occasion: text("occasion").notNull(),
    eventDate: text("event_date"),
    budgetRange: text("budget_range"),
    styleNotes: text("style_notes").notNull(),
    measurementsJson: jsonb("measurements_json")
      .$type<Record<string, { value: number; unit: "cm" | "in" }>>()
      .notNull(),
    referenceImageUrls: jsonb("reference_image_urls").$type<string[]>().notNull().default([]),
    preferredContact: text("preferred_contact").notNull().default("whatsapp"),
    status: text("status", {
      enum: [
        "new",
        "in_review",
        "quoted",
        "accepted",
        "in_production",
        "ready",
        "delivered",
        "declined",
        "cancelled",
      ],
    })
      .notNull()
      .default("new"),
    quoteMinor: integer("quote_minor"),
    depositMinor: integer("deposit_minor"),
    currency: text("currency").notNull().default("NGN"),
    estimatedCompletion: text("estimated_completion"),
    adminNotes: text("admin_notes"),
    convertedOrderId: uuid("converted_order_id").references(() => orders.id),
    formVersionSnapshot: jsonb("form_version_snapshot"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("custom_requests_number_idx").on(table.requestNumber)],
);

// 7. SETTINGS, BANK ACCOUNTS, AUDIT LOGS & RATE LIMITS
export const bankAccounts = pgTable("bank_accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  label: text("label").notNull(),
  bankName: text("bank_name").notNull(),
  accountName: text("account_name").notNull(),
  accountNumber: text("account_number").notNull(),
  instructions: text("instructions"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const settings = pgTable("settings", {
  id: text("id").primaryKey().default("singleton"),
  businessName: text("business_name").notNull().default("Fadé Exclusive"),
  tagline: text("tagline")
    .notNull()
    .default("African luxury. Contemporary expression."),
  contactEmail: text("contact_email").notNull().default("atelier@fadeexclusive.com"),
  whatsappNumber: text("whatsapp_number").notNull().default("+2348090001234"),
  address: text("address")
    .notNull()
    .default("Plot 1042, Ademola Adetokunbo Crescent, Maitama, Abuja, Nigeria (By Appointment)"),
  currency: text("currency").notNull().default("NGN"),
  defaultPhoneCountry: text("default_phone_country").notNull().default("NG"),
  paymentWindowHours: integer("payment_window_hours").notNull().default(48),
  orderPrefix: text("order_prefix").notNull().default("FD"),
  largeDiscountAlertThresholdPercent: integer(
    "large_discount_alert_threshold_percent",
  )
    .notNull()
    .default(25),
  storePaused: boolean("store_paused").notNull().default(false),
  storePausedMessage: text("store_paused_message")
    .notNull()
    .default(
      "Our Abuja atelier is currently at capacity fulfilling bespoke commissions. Browse our collections or submit a Custom Fit inquiry.",
    ),
  shippingOptionsJson: jsonb("shipping_options_json")
    .$type<Array<{ id: string; name: string; feeMinor: number; eta: string; isActive: boolean }>>()
    .notNull(),
  socialLinksJson: jsonb("social_links_json")
    .$type<{ instagram?: string; tiktok?: string; pinterest?: string; linkedin?: string }>()
    .notNull(),
  seoDefaultsJson: jsonb("seo_defaults_json")
    .$type<{ defaultTitle: string; defaultDescription: string }>()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  actorId: text("actor_id").notNull(),
  actorEmail: text("actor_email").notNull(),
  actorRole: text("actor_role").notNull(),
  action: text("action").notNull(),
  entity: text("entity").notNull(),
  entityId: text("entity_id").notNull(),
  summary: text("summary").notNull(),
  beforeJson: jsonb("before_json"),
  afterJson: jsonb("after_json"),
  ipHash: text("ip_hash"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
