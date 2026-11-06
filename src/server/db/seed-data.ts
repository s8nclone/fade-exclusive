import "server-only";
import { hashPassword, hashToken } from "@/server/security/crypto";

export interface SeedUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "owner" | "manager";
  isActive: boolean;
  totpEnabled: boolean;
  totpSecret: string | null;
  failedLoginAttempts: number;
  lockedUntil: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SeedCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
}

export interface SeedVariant {
  id: string;
  productId: string;
  label: string;
  sku: string;
  priceOverrideMinor: number | null;
  stockOnHand: number;
  lowStockThreshold: number;
  sortOrder: number;
}

export interface SeedProductImage {
  id: string;
  productId: string;
  url: string;
  altText: string;
  sortOrder: number;
}

export interface SeedProduct {
  id: string;
  name: string;
  slug: string;
  type: "ready_to_wear" | "made_to_order";
  categoryId: string;
  categorySlug: string;
  categoryName: string;
  collectionIds: string[];
  description: string;
  priceMinor: number;
  compareAtPriceMinor: number | null;
  currency: string;
  leadTimeDays: number | null;
  depositPercent: number | null;
  fabricNotes: string;
  careNotes: string;
  fitNotes: string;
  sizeGuideId: string;
  status: "draft" | "published" | "archived";
  isFeatured: boolean;
  sortOrder: number;
  seoTitle: string;
  seoDescription: string;
  images: SeedProductImage[];
  variants: SeedVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface SeedCollectionItem {
  id: string;
  collectionId: string;
  imageUrl: string;
  altText: string;
  caption: string;
  linkedProductId: string | null;
  sortOrder: number;
}

export interface SeedCollection {
  id: string;
  title: string;
  slug: string;
  season: string;
  story: string;
  coverUrl: string;
  coverAlt: string;
  status: "draft" | "published" | "archived";
  sortOrder: number;
  items: SeedCollectionItem[];
  createdAt: string;
  updatedAt: string;
}

export interface SeedPressItem {
  id: string;
  outlet: string;
  title: string;
  excerpt: string;
  url: string;
  publishedDate: string;
  coverUrl: string;
  coverAlt: string;
  isFeatured: boolean;
  sortOrder: number;
}

export interface SeedBanner {
  id: string;
  type: "announcement_bar" | "hero_banner" | "promo_strip";
  title: string;
  subtitle: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  backgroundColor: string;
  textColor: string;
  buttonBgColor: string;
  buttonTextColor: string;
  imageUrl: string | null;
  imageAlt: string | null;
  placement: string;
  priority: number;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
  dismissible: boolean;
  version: number;
  linkedPromotionId: string | null;
  linkedCouponCode: string | null;
  updatedAt: string;
}

export interface SeedPromotion {
  id: string;
  name: string;
  kind: "coupon" | "automatic";
  code: string | null;
  discountType: "percentage" | "fixed_amount" | "free_shipping";
  value: number;
  scope: "order" | "products" | "categories" | "collections";
  targetIds: string[];
  eligibleProductTypes: Array<"ready_to_wear" | "made_to_order">;
  minOrderMinor: number | null;
  maxDiscountMinor: number | null;
  usageLimitTotal: number | null;
  usageLimitPerCustomer: number | null;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
  stackable: boolean;
  excludeDiscountedItems: boolean;
  linkedBannerId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SeedPromotionRedemption {
  id: string;
  promotionId: string;
  orderId: string;
  customerIdentifierHash: string;
  amountMinor: number;
  releasedAt: string | null;
  createdAt: string;
}

export interface SeedFormField {
  key: string;
  label: string;
  type:
    | "text"
    | "textarea"
    | "number"
    | "email"
    | "phone"
    | "select"
    | "radio"
    | "checkbox"
    | "checkbox_group"
    | "date"
    | "measurement"
    | "image";
  placeholder?: string;
  helpText?: string;
  helpImageUrl?: string;
  required: boolean;
  options?: string[];
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  width: "full" | "half";
  sortOrder: number;
  isVisible: boolean;
  isSystem: boolean;
}

export interface SeedForm {
  id: string;
  slug: "contact" | "custom-fit" | "checkout-extra";
  title: string;
  description: string;
  version: number;
  fields: SeedFormField[];
  updatedAt: string;
}

export interface SeedFormSubmission {
  id: string;
  formId: string;
  formSlug: string;
  formVersion: number;
  schemaSnapshot: SeedFormField[];
  answers: Record<string, unknown>;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: "new" | "read" | "archived";
  createdAt: string;
}

export interface SeedCustomRequest {
  id: string;
  requestNumber: string;
  submissionId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  occasion: string;
  eventDate: string | null;
  budgetRange: string | null;
  styleNotes: string;
  measurements: Record<string, { value: number; unit: "cm" | "in" }>;
  referenceImageUrls: string[];
  preferredContact: string;
  status:
    | "new"
    | "in_review"
    | "quoted"
    | "accepted"
    | "in_production"
    | "ready"
    | "delivered"
    | "declined"
    | "cancelled";
  quoteMinor: number | null;
  depositMinor: number | null;
  currency: string;
  estimatedCompletion: string | null;
  adminNotes: string | null;
  convertedOrderId: string | null;
  formVersionSnapshot: SeedFormField[];
  createdAt: string;
  updatedAt: string;
}

export interface SeedOrderItem {
  id: string;
  orderId: string;
  productId: string | null;
  variantId: string | null;
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
  depositPercent: number | null;
  imageUrl: string | null;
}

export interface SeedOrderDiscount {
  id: string;
  orderId: string;
  promotionId: string | null;
  name: string;
  code: string | null;
  kind: "coupon" | "automatic";
  discountType: "percentage" | "fixed_amount" | "free_shipping";
  amountMinor: number;
}

export interface SeedOrderStatusHistory {
  id: string;
  orderId: string;
  fromStatus: string | null;
  toStatus: string;
  actor: string;
  note: string | null;
  createdAt: string;
}

export interface SeedPayment {
  id: string;
  orderId: string;
  kind: "full" | "deposit" | "balance";
  method: "manual_transfer";
  amountMinor: number;
  currency: string;
  status: "pending" | "confirmed" | "rejected";
  confirmedBy: string | null;
  confirmedAt: string | null;
  bankReference: string | null;
  receiptAssetUrl: string | null;
  notes: string | null;
  createdAt: string;
}

export interface SeedReceipt {
  id: string;
  orderId: string;
  paymentId: string;
  receiptNumber: string;
  rawTokenForDemo?: string;
  tokenHash: string;
  issuedAt: string;
}

export interface SeedStockReservation {
  id: string;
  orderId: string;
  variantId: string;
  qty: number;
  expiresAt: string;
  releasedAt: string | null;
  consumedAt: string | null;
  createdAt: string;
}

export interface SeedOrder {
  id: string;
  orderNumber: string;
  referenceCode: string;
  rawTokenForDemo?: string;
  accessTokenHash: string;
  idempotencyKey: string;
  status:
    | "awaiting_payment"
    | "payment_submitted"
    | "paid"
    | "deposit_paid"
    | "in_production"
    | "ready"
    | "shipped"
    | "ready_for_pickup"
    | "delivered"
    | "cancelled"
    | "expired"
    | "refunded";
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
  currency: string;
  paymentDueAt: string;
  customerNotes: string | null;
  extraFields: Record<string, unknown>;
  internalNotes: string | null;
  receiptAssetUrl: string | null;
  source: "storefront" | "custom_fit";
  items: SeedOrderItem[];
  discounts: SeedOrderDiscount[];
  history: SeedOrderStatusHistory[];
  payments: SeedPayment[];
  receipts: SeedReceipt[];
  createdAt: string;
  updatedAt: string;
}

export interface SeedBankAccount {
  id: string;
  label: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  instructions: string;
  isActive: boolean;
  sortOrder: number;
  updatedAt: string;
}

export interface SeedSettings {
  businessName: string;
  tagline: string;
  contactEmail: string;
  whatsappNumber: string;
  address: string;
  currency: string;
  defaultPhoneCountry: string;
  paymentWindowHours: number;
  orderPrefix: string;
  largeDiscountAlertThresholdPercent: number;
  storePaused: boolean;
  storePausedMessage: string;
  shippingOptions: Array<{
    id: string;
    name: string;
    feeMinor: number;
    eta: string;
    isActive: boolean;
  }>;
  socialLinks: {
    instagram?: string;
    tiktok?: string;
    pinterest?: string;
    linkedin?: string;
  };
  seoDefaults: {
    defaultTitle: string;
    defaultDescription: string;
  };
  updatedAt: string;
}

export interface SeedAuditLog {
  id: string;
  actorId: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  entity: string;
  entityId: string;
  summary: string;
  beforeJson: unknown;
  afterJson: unknown;
  createdAt: string;
}

export interface SeedMediaAsset {
  id: string;
  bucket: "public" | "private";
  objectKey: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  altText: string;
  createdAt: string;
}

export interface SeedContentPage {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  bodyMarkdown: string;
  updatedAt: string;
}

export function createInitialSeedStore() {
  const now = new Date("2026-11-01T10:00:00.000Z").toISOString();

  // The owner account is NOT seeded here. It is provisioned at server startup
  // from OWNER_EMAIL / OWNER_PASSWORD (see src/server/bootstrap/owner.ts).
  const users: SeedUser[] = [
    {
      id: "usr-manager-01",
      name: "Atelier Operations Manager",
      email: "manager@fadeexclusive.com",
      passwordHash: hashPassword("FadeAtelierManager2026!"),
      role: "manager",
      isActive: true,
      totpEnabled: false,
      totpSecret: null,
      failedLoginAttempts: 0,
      lockedUntil: null,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const categories: SeedCategory[] = [
    {
      id: "cat-agbada",
      name: "The Agbada",
      slug: "the-agbada",
      description:
        "Monumental three-piece ceremonial ensembles featuring hand-guided geometric embroidery and noble drape.",
      sortOrder: 1,
    },
    {
      id: "cat-modern-set",
      name: "The Modern Set",
      slug: "the-modern-set",
      description:
        "Contemporary architectural tunics, tailored kaftans, and artisanal knit sets designed for global luxury living.",
      sortOrder: 2,
    },
    {
      id: "cat-fila",
      name: "The Fila",
      slug: "the-fila",
      description:
        "Hand-woven traditional Yoruba caps crafted from heritage Aso-Oke and structured brocade.",
      sortOrder: 3,
    },
    {
      id: "cat-occasionwear",
      name: "Evening & Occasion",
      slug: "occasionwear",
      description:
        "Bespoke-grade dinner jackets and statement pieces tailored for black-tie galas and landmark celebrations.",
      sortOrder: 4,
    },
  ];

  const products: SeedProduct[] = [
    {
      id: "prod-01",
      name: "Oba Sovereign Ochre Agbada Ensemble",
      slug: "oba-sovereign-ochre-agbada",
      type: "made_to_order",
      categoryId: "cat-agbada",
      categorySlug: "the-agbada",
      categoryName: "The Agbada",
      collectionIds: ["col-01", "col-02"],
      description:
        "An iconic study in form, texture, and cultural depth. The Oba Sovereign Agbada Ensemble is tailored in our Abuja atelier from heavyweight golden-ochre cashmere-blend suiting with a contrasting metallic gold woven chest panel and intricate geometric hand-embroidery across the front and back.",
      priceMinor: 68000000, // NGN 680,000
      compareAtPriceMinor: 75000000,
      currency: "NGN",
      leadTimeDays: 14,
      depositPercent: 50,
      fabricNotes:
        "100% Superfine Merino & Silk-Linen Damask blend with hand-guided metallic bullion cord embroidery.",
      careNotes: "Specialist dry clean only. Store on a wide contoured cedar hanger inside the Fadé breathable garment bag.",
      fitNotes:
        "Generous ceremonial outer drape paired with a structured inner Buba tunic and tapered Sokoto trousers.",
      sizeGuideId: "sg-default",
      status: "published",
      isFeatured: true,
      sortOrder: 1,
      seoTitle: "Oba Sovereign Ochre Agbada Ensemble | Fadé Exclusive",
      seoDescription:
        "Hand-finished golden-ochre three-piece Agbada ensemble crafted in Abuja by Fadé Exclusive.",
      images: [
        {
          id: "img-p1-1",
          productId: "prod-01",
          url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=85",
          altText: "Oba Sovereign Ochre Agbada Ensemble full ceremonial silhouette",
          sortOrder: 1,
        },
        {
          id: "img-p1-2",
          productId: "prod-01",
          url: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=1200&q=85",
          altText: "Close-up of geometric golden ochre chest embroidery on Oba Sovereign Agbada",
          sortOrder: 2,
        },
      ],
      variants: [
        {
          id: "var-01-s",
          productId: "prod-01",
          label: "Size M (Chest 40 in)",
          sku: "FD-AGB-001-M",
          priceOverrideMinor: null,
          stockOnHand: 5,
          lowStockThreshold: 2,
          sortOrder: 1,
        },
        {
          id: "var-01-l",
          productId: "prod-01",
          label: "Size L (Chest 42 in)",
          sku: "FD-AGB-001-L",
          priceOverrideMinor: null,
          stockOnHand: 5,
          lowStockThreshold: 2,
          sortOrder: 2,
        },
        {
          id: "var-01-xl",
          productId: "prod-01",
          label: "Size XL (Chest 44-46 in)",
          sku: "FD-AGB-001-XL",
          priceOverrideMinor: null,
          stockOnHand: 5,
          lowStockThreshold: 2,
          sortOrder: 3,
        },
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "prod-02",
      name: "Alabaster Heritage Senator Tunic Set",
      slug: "alabaster-heritage-senator-set",
      type: "ready_to_wear",
      categoryId: "cat-modern-set",
      categorySlug: "the-modern-set",
      categoryName: "The Modern Set",
      collectionIds: ["col-01", "col-03"],
      description:
        "Crisp optical-white two-piece contemporary Senator set featuring architectural horizontal chest pintucks, a concealed front placket, and the signature brushed-brass Fadé Exclusive pocket insignia. Designed for effortless sophistication from Abuja to London.",
      priceMinor: 28500000, // NGN 285,000
      compareAtPriceMinor: null,
      currency: "NGN",
      leadTimeDays: null,
      depositPercent: null,
      fabricNotes: "Double-mercerized Swiss cotton poplin with structured breathable interlining.",
      careNotes: "Gentle dry clean or cold hand wash. Steam press on reverse.",
      fitNotes: "Tailored contemporary fit with elbow-length sleeves and ankle-skimming tapered trousers.",
      sizeGuideId: "sg-default",
      status: "published",
      isFeatured: true,
      sortOrder: 2,
      seoTitle: "Alabaster Heritage Senator Tunic Set | Fadé Exclusive",
      seoDescription:
        "Signature white architectural tunic and trouser set with brushed-brass Fadé plaque.",
      images: [
        {
          id: "img-p2-1",
          productId: "prod-02",
          url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=1200&q=85",
          altText: "Alabaster Heritage Senator Tunic Set in bright sunlit editorial view",
          sortOrder: 1,
        },
      ],
      variants: [
        {
          id: "var-02-s",
          productId: "prod-02",
          label: "Size S",
          sku: "FD-MOD-002-S",
          priceOverrideMinor: null,
          stockOnHand: 4,
          lowStockThreshold: 2,
          sortOrder: 1,
        },
        {
          id: "var-02-m",
          productId: "prod-02",
          label: "Size M",
          sku: "FD-MOD-002-M",
          priceOverrideMinor: null,
          stockOnHand: 8,
          lowStockThreshold: 2,
          sortOrder: 2,
        },
        {
          id: "var-02-l",
          productId: "prod-02",
          label: "Size L",
          sku: "FD-MOD-002-L",
          priceOverrideMinor: null,
          stockOnHand: 6,
          lowStockThreshold: 2,
          sortOrder: 3,
        },
        {
          id: "var-02-xl",
          productId: "prod-02",
          label: "Size XL",
          sku: "FD-MOD-002-XL",
          priceOverrideMinor: null,
          stockOnHand: 1,
          lowStockThreshold: 2,
          sortOrder: 4,
        },
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "prod-03",
      name: "Obsidian Noir Kaftan Lounge Set",
      slug: "obsidian-noir-kaftan-set",
      type: "ready_to_wear",
      categoryId: "cat-modern-set",
      categorySlug: "the-modern-set",
      categoryName: "The Modern Set",
      collectionIds: ["col-01"],
      description:
        "Featured on the cover of the Fadé Exclusives 2026 Portfolio. A commanding jet-black two-piece kaftan crafted from fluid Italian wool-silk crepe, complete with a mandarin collar, chest welt pocket for eyewear or fountain pen, and relaxed tailored trousers.",
      priceMinor: 31000000, // NGN 310,000
      compareAtPriceMinor: 34000000,
      currency: "NGN",
      leadTimeDays: null,
      depositPercent: null,
      fabricNotes: "Italian Virgin Wool & Mulberry Silk Crepe (260 gsm).",
      careNotes: "Dry clean only.",
      fitNotes: "Relaxed modern drape with structured shoulder seam.",
      sizeGuideId: "sg-default",
      status: "published",
      isFeatured: true,
      sortOrder: 3,
      seoTitle: "Obsidian Noir Kaftan Lounge Set | Fadé Exclusive",
      seoDescription:
        "Cover piece of the 2026 Fadé Exclusives portfolio in jet-black Italian wool-silk crepe.",
      images: [
        {
          id: "img-p3-1",
          productId: "prod-03",
          url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1200&q=85",
          altText: "Obsidian Noir Kaftan Lounge Set worn in leather study lounge",
          sortOrder: 1,
        },
      ],
      variants: [
        {
          id: "var-03-m",
          productId: "prod-03",
          label: "Size M",
          sku: "FD-KAF-003-M",
          priceOverrideMinor: null,
          stockOnHand: 5,
          lowStockThreshold: 2,
          sortOrder: 1,
        },
        {
          id: "var-03-l",
          productId: "prod-03",
          label: "Size L",
          sku: "FD-KAF-003-L",
          priceOverrideMinor: null,
          stockOnHand: 4,
          lowStockThreshold: 2,
          sortOrder: 2,
        },
        {
          id: "var-03-xl",
          productId: "prod-03",
          label: "Size XL",
          sku: "FD-KAF-003-XL",
          priceOverrideMinor: null,
          stockOnHand: 2,
          lowStockThreshold: 2,
          sortOrder: 3,
        },
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "prod-04",
      name: "Bronze & Espresso Aso-Oke Fila",
      slug: "bronze-espresso-aso-oke-fila",
      type: "ready_to_wear",
      categoryId: "cat-fila",
      categorySlug: "the-fila",
      categoryName: "The Fila",
      collectionIds: ["col-01", "col-02"],
      description:
        "Hand-loomed heritage Aso-Oke Fila in rich espresso brown and warm bronze diagonal stripes. Lined in breathable mulberry silk satin for all-day comfort and effortless shaping.",
      priceMinor: 8500000, // NGN 85,000
      compareAtPriceMinor: null,
      currency: "NGN",
      leadTimeDays: null,
      depositPercent: null,
      fabricNotes: "Hand-woven Nigerian Aso-Oke cotton-silk strip weave with satin interior lining.",
      careNotes: "Spot clean or specialist dry clean only. Do not machine wash.",
      fitNotes: "Structured crown designed to be folded left, right, or center.",
      sizeGuideId: "sg-default",
      status: "published",
      isFeatured: true,
      sortOrder: 4,
      seoTitle: "Bronze & Espresso Aso-Oke Fila | Fadé Exclusive",
      seoDescription: "Hand-woven Aso-Oke traditional Yoruba Fila cap in espresso and bronze.",
      images: [
        {
          id: "img-p4-1",
          productId: "prod-04",
          url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85",
          altText: "Bronze and Espresso hand-woven Aso-Oke Fila cap",
          sortOrder: 1,
        },
      ],
      variants: [
        {
          id: "var-04-57",
          productId: "prod-04",
          label: "22.5 in (57 cm)",
          sku: "FD-FIL-004-57",
          priceOverrideMinor: null,
          stockOnHand: 7,
          lowStockThreshold: 2,
          sortOrder: 1,
        },
        {
          id: "var-04-59",
          productId: "prod-04",
          label: "23.2 in (59 cm)",
          sku: "FD-FIL-004-59",
          priceOverrideMinor: null,
          stockOnHand: 9,
          lowStockThreshold: 2,
          sortOrder: 2,
        },
        {
          id: "var-04-61",
          productId: "prod-04",
          label: "24.0 in (61 cm)",
          sku: "FD-FIL-004-61",
          priceOverrideMinor: null,
          stockOnHand: 3,
          lowStockThreshold: 2,
          sortOrder: 3,
        },
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "prod-05",
      name: "Eko Artisanal Knit Stripe Polo",
      slug: "eko-artisanal-knit-polo",
      type: "ready_to_wear",
      categoryId: "cat-modern-set",
      categorySlug: "the-modern-set",
      categoryName: "The Modern Set",
      collectionIds: ["col-03"],
      description:
        "Open-weave unbleached ecru cotton knit polo with contrast obsidian ladder-stitch stripes, spread resort collar, and ribbed cuffs. A community favorite worn across social and cultural gatherings.",
      priceMinor: 16500000, // NGN 165,000
      compareAtPriceMinor: null,
      currency: "NGN",
      leadTimeDays: null,
      depositPercent: null,
      fabricNotes: "100% Combed Long-Staple Organic Cotton Crochet Knit.",
      careNotes: "Hand wash cold and dry flat to preserve knit tension.",
      fitNotes: "True to size with a structured ribbed hem.",
      sizeGuideId: "sg-default",
      status: "published",
      isFeatured: false,
      sortOrder: 5,
      seoTitle: "Eko Artisanal Knit Stripe Polo | Fadé Exclusive",
      seoDescription: "Ecru open-weave knit polo with obsidian horizontal stripe detailing.",
      images: [
        {
          id: "img-p5-1",
          productId: "prod-05",
          url: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=1200&q=85",
          altText: "Eko Artisanal Knit Stripe Polo worn outdoors",
          sortOrder: 1,
        },
      ],
      variants: [
        {
          id: "var-05-m",
          productId: "prod-05",
          label: "Size M",
          sku: "FD-POL-005-M",
          priceOverrideMinor: null,
          stockOnHand: 6,
          lowStockThreshold: 2,
          sortOrder: 1,
        },
        {
          id: "var-05-l",
          productId: "prod-05",
          label: "Size L",
          sku: "FD-POL-005-L",
          priceOverrideMinor: null,
          stockOnHand: 5,
          lowStockThreshold: 2,
          sortOrder: 2,
        },
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "prod-06",
      name: "Viceroy Ivory Double-Breasted Dinner Jacket",
      slug: "viceroy-ivory-dinner-jacket",
      type: "made_to_order",
      categoryId: "cat-occasionwear",
      categorySlug: "occasionwear",
      categoryName: "Evening & Occasion",
      collectionIds: ["col-02"],
      description:
        "Six-button double-breasted peak-lapel dinner jacket in tactile ivory bouclé-jacquard with contrast horn buttons and full canvas construction. Tailored to order for black-tie weddings and red-carpet galas.",
      priceMinor: 52000000, // NGN 520,000
      compareAtPriceMinor: null,
      currency: "NGN",
      leadTimeDays: 12,
      depositPercent: 50,
      fabricNotes: "Textured Silk-Wool Jacquard with Bemberg Cupro lining.",
      careNotes: "Specialist dry clean only.",
      fitNotes: "Structured Savile-grade shoulder with sculpted waist suppression.",
      sizeGuideId: "sg-default",
      status: "published",
      isFeatured: false,
      sortOrder: 6,
      seoTitle: "Viceroy Ivory Double-Breasted Dinner Jacket | Fadé Exclusive",
      seoDescription: "Made-to-order ivory double-breasted evening jacket by Fadé Exclusive.",
      images: [
        {
          id: "img-p6-1",
          productId: "prod-06",
          url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=85",
          altText: "Viceroy Ivory Double-Breasted Dinner Jacket",
          sortOrder: 1,
        },
      ],
      variants: [
        {
          id: "var-06-48",
          productId: "prod-06",
          label: "EU 48 / UK 38",
          sku: "FD-OCC-006-48",
          priceOverrideMinor: null,
          stockOnHand: 3,
          lowStockThreshold: 1,
          sortOrder: 1,
        },
        {
          id: "var-06-50",
          productId: "prod-06",
          label: "EU 50 / UK 40",
          sku: "FD-OCC-006-50",
          priceOverrideMinor: null,
          stockOnHand: 3,
          lowStockThreshold: 1,
          sortOrder: 2,
        },
        {
          id: "var-06-52",
          productId: "prod-06",
          label: "EU 52 / UK 42",
          sku: "FD-OCC-006-52",
          priceOverrideMinor: null,
          stockOnHand: 3,
          lowStockThreshold: 1,
          sortOrder: 3,
        },
      ],
      createdAt: now,
      updatedAt: now,
    },
  ];

  const collections: SeedCollection[] = [
    {
      id: "col-01",
      title: "Brand & Growth Portfolio 2026: Signature Edit",
      slug: "signature-edit-2026",
      season: "2026 Flagship Collection",
      story:
        "African fashion does not need to imitate global luxury to participate in it. Our 2026 Signature Edit draws from Nigerian visual culture — translating the Agbada, the Modern Senator Set, and the hand-woven Fila into silhouettes, materials, and experiences built for the contemporary luxury customer.",
      coverUrl:
        "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=85",
      coverAlt: "Fadé Exclusives 2026 Signature Edit Lookbook Cover",
      status: "published",
      sortOrder: 1,
      items: [
        {
          id: "ci-01",
          collectionId: "col-01",
          imageUrl:
            "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=85",
          altText: "Look 01 — The Agbada Silhouette in Golden Ochre",
          caption: "01 — SILHOUETTE: Distinctive proportions and occasion-led construction.",
          linkedProductId: "prod-01",
          sortOrder: 1,
        },
        {
          id: "ci-02",
          collectionId: "col-01",
          imageUrl:
            "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=1200&q=85",
          altText: "Look 02 — The Alabaster Modern Set",
          caption: "02 — MATERIAL: Premium textiles selected for texture, movement and visual presence.",
          linkedProductId: "prod-02",
          sortOrder: 2,
        },
        {
          id: "ci-03",
          collectionId: "col-01",
          imageUrl:
            "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1200&q=85",
          altText: "Look 03 — Obsidian Noir Kaftan",
          caption: "03 — DETAIL: Hand-finished elements that create recognition and elevate the overall look.",
          linkedProductId: "prod-03",
          sortOrder: 3,
        },
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "col-02",
      title: "Ceremonial Heritage & Occasionwear",
      slug: "ceremonial-heritage-occasionwear",
      season: "Atelier Archive",
      story:
        "High-value occasionwear crafted for landmark weddings, royal installations, and black-tie cultural galas across Abuja, London, and the global diaspora.",
      coverUrl:
        "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=1200&q=85",
      coverAlt: "Ceremonial Heritage Collection Cover",
      status: "published",
      sortOrder: 2,
      items: [
        {
          id: "ci-04",
          collectionId: "col-02",
          imageUrl:
            "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=1200&q=85",
          altText: "Hand-guided geometric embroidery detail",
          caption: "THE DETAIL: Multi-stage artisanal embroidery finished in our Abuja studio.",
          linkedProductId: "prod-01",
          sortOrder: 1,
        },
        {
          id: "ci-05",
          collectionId: "col-02",
          imageUrl:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=85",
          altText: "Viceroy Ivory Double-Breasted Dinner Jacket",
          caption: "BLACK-TIE OCCASION: Savile-grade tailoring meets African luxury sensibility.",
          linkedProductId: "prod-06",
          sortOrder: 2,
        },
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "col-03",
      title: "Contemporary Resort & Knitwear",
      slug: "contemporary-resort-knitwear",
      season: "Resort 2026",
      story:
        "Breathable open-weave cotton knits and architectural short-sleeve sets tailored for warm-weather sophistication.",
      coverUrl:
        "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=1200&q=85",
      coverAlt: "Contemporary Resort Collection Cover",
      status: "published",
      sortOrder: 3,
      items: [
        {
          id: "ci-06",
          collectionId: "col-03",
          imageUrl:
            "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=1200&q=85",
          altText: "Eko Artisanal Knit Stripe Polo",
          caption: "COMMUNITY PROOF: Worn across celebratory and resort environments.",
          linkedProductId: "prod-05",
          sortOrder: 1,
        },
      ],
      createdAt: now,
      updatedAt: now,
    },
  ];

  const pressItems: SeedPressItem[] = [
    {
      id: "press-01",
      outlet: "Vogue Business Africa",
      title: "Why Fadé Exclusive Is Redefining Contemporary African Occasionwear",
      excerpt:
        "Occupying the space between culturally authentic Nigerian heritage and globally legible contemporary luxury.",
      url: "https://fadeexclusive.com/press",
      publishedDate: "2026-10-14",
      coverUrl:
        "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80",
      coverAlt: "Vogue Business feature on Fadé Exclusive",
      isFeatured: true,
      sortOrder: 1,
    },
    {
      id: "press-02",
      outlet: "GQ Style Diaspora",
      title: "The New Guard of Abuja Savile Craft: Inside the Fadé Atelier",
      excerpt:
        "From precision pattern cutting to hand-woven Aso-Oke Filas, how traditional craft meets scalable modern systems.",
      url: "https://fadeexclusive.com/press",
      publishedDate: "2026-09-02",
      coverUrl:
        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=900&q=80",
      coverAlt: "GQ Style feature on Fadé Atelier",
      isFeatured: true,
      sortOrder: 2,
    },
    {
      id: "press-03",
      outlet: "Arise Fashion Journal",
      title: "Silhouettes of Authority: The Return of the Architectural Agbada",
      excerpt:
        "How diaspora grooms and cultural tastemakers are commissioning bespoke Agbadas for global milestone events.",
      url: "https://fadeexclusive.com/press",
      publishedDate: "2026-07-19",
      coverUrl:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80",
      coverAlt: "Arise Fashion Journal feature",
      isFeatured: false,
      sortOrder: 3,
    },
  ];

  const promotions: SeedPromotion[] = [
    {
      id: "promo-auto-fila",
      name: "Signature Fila 10% Atelier Offer",
      kind: "automatic",
      code: null,
      discountType: "percentage",
      value: 10,
      scope: "categories",
      targetIds: ["cat-fila"],
      eligibleProductTypes: ["ready_to_wear", "made_to_order"],
      minOrderMinor: null,
      maxDiscountMinor: 5000000,
      usageLimitTotal: null,
      usageLimitPerCustomer: null,
      startsAt: "2026-01-01T00:00:00.000Z",
      endsAt: "2027-12-31T23:59:59.000Z",
      isActive: true,
      stackable: true,
      excludeDiscountedItems: false,
      linkedBannerId: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "promo-coupon-fade10",
      name: "Welcome 2026 Portfolio 10% Privilege",
      kind: "coupon",
      code: "FADE10",
      discountType: "percentage",
      value: 10,
      scope: "order",
      targetIds: [],
      eligibleProductTypes: ["ready_to_wear", "made_to_order"],
      minOrderMinor: 15000000, // Min NGN 150,000
      maxDiscountMinor: 7500000, // Max NGN 75,000
      usageLimitTotal: 100,
      usageLimitPerCustomer: 2,
      startsAt: "2026-01-01T00:00:00.000Z",
      endsAt: "2027-12-31T23:59:59.000Z",
      isActive: true,
      stackable: true,
      excludeDiscountedItems: false,
      linkedBannerId: "ban-01",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "promo-coupon-heritage50k",
      name: "Ceremonial Edit ₦50,000 Privilege",
      kind: "coupon",
      code: "HERITAGE50K",
      discountType: "fixed_amount",
      value: 5000000, // NGN 50,000 in minor units
      scope: "order",
      targetIds: [],
      eligibleProductTypes: ["ready_to_wear", "made_to_order"],
      minOrderMinor: 50000000, // Min NGN 500,000
      maxDiscountMinor: null,
      usageLimitTotal: 50,
      usageLimitPerCustomer: 1,
      startsAt: "2026-01-01T00:00:00.000Z",
      endsAt: "2027-12-31T23:59:59.000Z",
      isActive: true,
      stackable: false,
      excludeDiscountedItems: false,
      linkedBannerId: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "promo-coupon-freeship",
      name: "Complimentary Express Courier",
      kind: "coupon",
      code: "FREESHIPVIP",
      discountType: "free_shipping",
      value: 100,
      scope: "order",
      targetIds: [],
      eligibleProductTypes: ["ready_to_wear", "made_to_order"],
      minOrderMinor: 25000000,
      maxDiscountMinor: null,
      usageLimitTotal: null,
      usageLimitPerCustomer: null,
      startsAt: "2026-01-01T00:00:00.000Z",
      endsAt: "2027-12-31T23:59:59.000Z",
      isActive: true,
      stackable: true,
      excludeDiscountedItems: false,
      linkedBannerId: null,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const banners: SeedBanner[] = [
    {
      id: "ban-01",
      type: "announcement_bar",
      title: "2026 PORTFOLIO COLLECTION — ENJOY 10% OFF ORDERS ABOVE ₦150,000 WITH CODE FADE10",
      subtitle: "Worldwide DHL Express shipping & private Abuja atelier fittings available.",
      ctaLabel: "Apply FADE10",
      ctaUrl: "/shop?coupon=FADE10",
      backgroundColor: "#161412",
      textColor: "#F4F1EA",
      buttonBgColor: "#9E7344",
      buttonTextColor: "#FAF8F4",
      imageUrl: null,
      imageAlt: null,
      placement: "global",
      priority: 100,
      startsAt: null,
      endsAt: null,
      isActive: true,
      dismissible: true,
      version: 1,
      linkedPromotionId: "promo-coupon-fade10",
      linkedCouponCode: "FADE10",
      updatedAt: now,
    },
    {
      id: "ban-02",
      type: "promo_strip",
      title: "BESPOKE & CUSTOM FIT COMMISSIONS FOR 2026 WEDDINGS & GALAS",
      subtitle:
        "Submit your measurements online or book a private consultation with our Abuja master tailors.",
      ctaLabel: "Request Custom Fit",
      ctaUrl: "/custom-fit",
      backgroundColor: "#28211C",
      textColor: "#F4F1EA",
      buttonBgColor: "#F4F1EA",
      buttonTextColor: "#161412",
      imageUrl: null,
      imageAlt: null,
      placement: "home",
      priority: 50,
      startsAt: null,
      endsAt: null,
      isActive: true,
      dismissible: false,
      version: 1,
      linkedPromotionId: null,
      linkedCouponCode: null,
      updatedAt: now,
    },
  ];

  const forms: SeedForm[] = [
    {
      id: "form-contact",
      slug: "contact",
      title: "Atelier Concierge & Client Inquiries",
      description:
        "Direct inquiries regarding ready-to-wear availability, international wholesale, press loans, or private appointments.",
      version: 1,
      fields: [
        {
          key: "fullName",
          label: "Full Name",
          type: "text",
          placeholder: "e.g. Tunde Bakare",
          required: true,
          minLength: 2,
          maxLength: 100,
          width: "half",
          sortOrder: 1,
          isVisible: true,
          isSystem: true,
        },
        {
          key: "email",
          label: "Email Address",
          type: "email",
          placeholder: "you@example.com",
          required: true,
          width: "half",
          sortOrder: 2,
          isVisible: true,
          isSystem: true,
        },
        {
          key: "phone",
          label: "Phone / WhatsApp Number",
          type: "phone",
          placeholder: "+234 809 000 1234",
          required: true,
          width: "half",
          sortOrder: 3,
          isVisible: true,
          isSystem: true,
        },
        {
          key: "inquiryType",
          label: "Nature of Inquiry",
          type: "select",
          required: true,
          options: [
            "Private Client Order Inquiry",
            "Bespoke / Groom Party Commission",
            "Retail & Wholesale Partnership",
            "Press & Styling Pull",
            "General Atelier Question",
          ],
          width: "half",
          sortOrder: 4,
          isVisible: true,
          isSystem: false,
        },
        {
          key: "message",
          label: "Message",
          type: "textarea",
          placeholder: "Tell our client concierge how we may assist you...",
          required: true,
          minLength: 10,
          maxLength: 1500,
          width: "full",
          sortOrder: 5,
          isVisible: true,
          isSystem: true,
        },
      ],
      updatedAt: now,
    },
    {
      id: "form-custom-fit",
      slug: "custom-fit",
      title: "Custom Fit & Bespoke Commission Request",
      description:
        "Provide your event details, silhouette preferences, and body measurements. Our master pattern cutter will review your submission and prepare a tailored quotation.",
      version: 1,
      fields: [
        {
          key: "customerName",
          label: "Full Name",
          type: "text",
          placeholder: "e.g. Adewale Ogunlesi",
          required: true,
          minLength: 2,
          maxLength: 100,
          width: "half",
          sortOrder: 1,
          isVisible: true,
          isSystem: true,
        },
        {
          key: "customerEmail",
          label: "Email Address",
          type: "email",
          placeholder: "adewale@example.com",
          required: true,
          width: "half",
          sortOrder: 2,
          isVisible: true,
          isSystem: true,
        },
        {
          key: "customerPhone",
          label: "WhatsApp / Phone Number",
          type: "phone",
          placeholder: "+234 803 000 0000",
          helpText: "Include country code for international clients (e.g. +44, +1, +234).",
          required: true,
          width: "half",
          sortOrder: 3,
          isVisible: true,
          isSystem: true,
        },
        {
          key: "preferredContact",
          label: "Preferred Contact Channel",
          type: "select",
          required: true,
          options: ["WhatsApp", "Email", "Phone Call"],
          width: "half",
          sortOrder: 4,
          isVisible: true,
          isSystem: true,
        },
        {
          key: "occasion",
          label: "Occasion / Silhouette Type",
          type: "select",
          required: true,
          options: [
            "Ceremonial Three-Piece Agbada",
            "Bespoke Groom / Groomsmen Ensemble",
            "Contemporary Senator Two-Piece Set",
            "Black-Tie Evening / Dinner Jacket",
            "Full Wardrobe Capsule",
          ],
          width: "full",
          sortOrder: 5,
          isVisible: true,
          isSystem: true,
        },
        {
          key: "eventDate",
          label: "Target Event / Delivery Date",
          type: "date",
          helpText: "Allow 14–21 days for hand-embroidered commissions.",
          required: true,
          width: "half",
          sortOrder: 6,
          isVisible: true,
          isSystem: true,
        },
        {
          key: "budgetRange",
          label: "Estimated Investment Range",
          type: "select",
          helpText: "Guides textile & embroidery recommendations.",
          required: true,
          options: [
            "₦300,000 – ₦500,000",
            "₦500,000 – ₦850,000",
            "₦850,000 – ₦1,500,000",
            "Above ₦1,500,000 (Multi-piece / Bridal Party)",
          ],
          width: "half",
          sortOrder: 7,
          isVisible: true,
          isSystem: false,
        },
        {
          key: "neckMeasurement",
          label: "Neck Circumference",
          type: "measurement",
          helpText: "Measure around the base of the neck with one finger of ease.",
          required: true,
          min: 10,
          max: 80,
          width: "half",
          sortOrder: 8,
          isVisible: true,
          isSystem: false,
        },
        {
          key: "chestMeasurement",
          label: "Chest Circumference",
          type: "measurement",
          helpText: "Measure horizontally around the fullest part of the chest.",
          required: true,
          min: 25,
          max: 180,
          width: "half",
          sortOrder: 9,
          isVisible: true,
          isSystem: false,
        },
        {
          key: "shoulderMeasurement",
          label: "Shoulder Width",
          type: "measurement",
          helpText: "Bone to bone across the upper back from shoulder tip to tip.",
          required: true,
          min: 12,
          max: 80,
          width: "half",
          sortOrder: 10,
          isVisible: true,
          isSystem: false,
        },
        {
          key: "sleeveLengthMeasurement",
          label: "Sleeve Length",
          type: "measurement",
          helpText: "From the shoulder tip down to the wrist bone with arm relaxed.",
          required: true,
          min: 15,
          max: 110,
          width: "half",
          sortOrder: 11,
          isVisible: true,
          isSystem: false,
        },
        {
          key: "tunicLengthMeasurement",
          label: "Tunic / Top Length",
          type: "measurement",
          helpText: "From the base of the side neck vertically down to mid-thigh.",
          required: true,
          min: 20,
          max: 140,
          width: "half",
          sortOrder: 12,
          isVisible: true,
          isSystem: false,
        },
        {
          key: "waistMeasurement",
          label: "Trouser Waist",
          type: "measurement",
          helpText: "Measure comfortably around your natural trouser waistline.",
          required: true,
          min: 20,
          max: 160,
          width: "half",
          sortOrder: 13,
          isVisible: true,
          isSystem: false,
        },
        {
          key: "trouserLengthMeasurement",
          label: "Trouser Outseam Length",
          type: "measurement",
          helpText: "From the natural trouser waist down to the ankle bone.",
          required: true,
          min: 25,
          max: 140,
          width: "half",
          sortOrder: 14,
          isVisible: true,
          isSystem: false,
        },
        {
          key: "headCircumference",
          label: "Head Circumference (Fila)",
          type: "measurement",
          helpText: "Optional: Measure around the forehead just above the ears.",
          required: false,
          min: 18,
          max: 70,
          width: "half",
          sortOrder: 15,
          isVisible: true,
          isSystem: false,
        },
        {
          key: "styleNotes",
          label: "Fabric, Color Palette & Embroidery Notes",
          type: "textarea",
          placeholder:
            "Describe your preferred color palette (e.g. Ochre Gold, Alabaster White, Midnight Indigo), embroidery preferences, and posture notes...",
          required: true,
          minLength: 10,
          maxLength: 2000,
          width: "full",
          sortOrder: 16,
          isVisible: true,
          isSystem: true,
        },
        {
          key: "referenceImageUrl",
          label: "Reference Look or Inspiration Image (Private Upload)",
          type: "image",
          helpText: "Stored securely in our private client vault; visible only to our master tailors.",
          required: false,
          width: "full",
          sortOrder: 17,
          isVisible: true,
          isSystem: false,
        },
      ],
      updatedAt: now,
    },
    {
      id: "form-checkout-extra",
      slug: "checkout-extra",
      title: "Additional Checkout Preferences",
      description: "Optional custom fields displayed during guest checkout.",
      version: 1,
      fields: [
        {
          key: "occasionDate",
          label: "Target Occasion Date (Optional)",
          type: "date",
          helpText: "If you are ordering for a specific event date, let our dispatch team know.",
          required: false,
          width: "half",
          sortOrder: 1,
          isVisible: true,
          isSystem: false,
        },
        {
          key: "giftPackagingNote",
          label: "Complimentary Gift Card Message (Optional)",
          type: "text",
          placeholder: "Include a personalized note inside the Fadé presentation box",
          required: false,
          maxLength: 200,
          width: "half",
          sortOrder: 2,
          isVisible: true,
          isSystem: false,
        },
      ],
      updatedAt: now,
    },
  ];

  // Sample Demo Order so Admin & Order Lookup have rich data out of the box
  const demoOrderToken = "demo-order-token-fade-2026-9x8k7m";
  const demoReceiptToken = "demo-receipt-token-fade-2026-3p4q5r";

  const orders: SeedOrder[] = [
    {
      id: "ord-demo-01",
      orderNumber: "FD26-8K4M",
      referenceCode: "FD-8K4M9P",
      rawTokenForDemo: demoOrderToken,
      accessTokenHash: hashToken(demoOrderToken),
      idempotencyKey: "idem-seed-01",
      status: "payment_submitted",
      customerName: "Chukwudi Adebayo",
      customerEmail: "chukwudi@example.com",
      customerPhone: "+2348031234567",
      deliveryAddress: {
        line1: "Plot 1042, Ademola Adetokunbo Crescent, Maitama",
        city: "Abuja",
        state: "FCT",
        postalCode: "900271",
        country: "Nigeria",
      },
      shippingOption: {
        id: "ship-abuja",
        name: "Abuja White-Glove Courier",
        feeMinor: 1000000, // NGN 10,000
        eta: "1–2 business days",
      },
      subtotalMinor: 28500000,
      discountTotalMinor: 2850000,
      shippingMinor: 1000000,
      totalMinor: 26650000, // NGN 266,500
      depositRequiredMinor: 26650000,
      amountPaidMinor: 0,
      currency: "NGN",
      paymentDueAt: new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString(),
      customerNotes: "Please deliver before Friday afternoon.",
      extraFields: {
        giftPackagingNote: "For the Chairman's 50th Celebration",
      },
      internalNotes: "Customer notified us via WhatsApp that transfer was initiated from Zenith Bank.",
      receiptAssetUrl: null,
      source: "storefront",
      items: [
        {
          id: "oi-demo-01",
          orderId: "ord-demo-01",
          productId: "prod-02",
          variantId: "var-02-l",
          productName: "Alabaster Heritage Senator Tunic Set",
          productSlug: "alabaster-heritage-senator-set",
          variantLabel: "Size L",
          productType: "ready_to_wear",
          unitPriceMinor: 28500000,
          qty: 1,
          lineSubtotalMinor: 28500000,
          lineDiscountMinor: 2850000,
          lineTotalMinor: 25650000,
          leadTimeDays: null,
          depositPercent: null,
          imageUrl:
            "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=1200&q=85",
        },
      ],
      discounts: [
        {
          id: "od-demo-01",
          orderId: "ord-demo-01",
          promotionId: "promo-coupon-fade10",
          name: "Welcome 2026 Portfolio 10% Privilege",
          code: "FADE10",
          kind: "coupon",
          discountType: "percentage",
          amountMinor: 2850000,
        },
      ],
      history: [
        {
          id: "osh-01",
          orderId: "ord-demo-01",
          fromStatus: null,
          toStatus: "awaiting_payment",
          actor: "customer",
          note: "Order placed via storefront checkout.",
          createdAt: now,
        },
        {
          id: "osh-02",
          orderId: "ord-demo-01",
          fromStatus: "awaiting_payment",
          toStatus: "payment_submitted",
          actor: "customer",
          note: "Customer marked bank transfer as sent.",
          createdAt: now,
        },
      ],
      payments: [],
      receipts: [],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "ord-demo-02",
      orderNumber: "FD26-3P7Q",
      referenceCode: "FD-3P7Q2W",
      rawTokenForDemo: "demo-order-token-paid-2026",
      accessTokenHash: hashToken("demo-order-token-paid-2026"),
      idempotencyKey: "idem-seed-02",
      status: "in_production",
      customerName: "Olumide Balogun",
      customerEmail: "olumide@example.com",
      customerPhone: "+447700900123",
      deliveryAddress: {
        line1: "28 Mount Street, Mayfair",
        city: "London",
        state: "Greater London",
        postalCode: "W1K 2TH",
        country: "United Kingdom",
      },
      shippingOption: {
        id: "ship-intl",
        name: "International DHL Express (UK / US / Europe)",
        feeMinor: 6500000, // NGN 65,000
        eta: "4–6 business days",
      },
      subtotalMinor: 68000000,
      discountTotalMinor: 5000000,
      shippingMinor: 6500000,
      totalMinor: 69500000, // NGN 695,000
      depositRequiredMinor: 34750000,
      amountPaidMinor: 69500000,
      currency: "NGN",
      paymentDueAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      customerNotes: "Ordering for a December wedding in London.",
      extraFields: {},
      internalNotes: "Full wire transfer verified in Guaranty Trust Bank statement.",
      receiptAssetUrl: null,
      source: "storefront",
      items: [
        {
          id: "oi-demo-02",
          orderId: "ord-demo-02",
          productId: "prod-01",
          variantId: "var-01-l",
          productName: "Oba Sovereign Ochre Agbada Ensemble",
          productSlug: "oba-sovereign-ochre-agbada",
          variantLabel: "Size L (Chest 42 in)",
          productType: "made_to_order",
          unitPriceMinor: 68000000,
          qty: 1,
          lineSubtotalMinor: 68000000,
          lineDiscountMinor: 5000000,
          lineTotalMinor: 63000000,
          leadTimeDays: 14,
          depositPercent: 50,
          imageUrl:
            "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=85",
        },
      ],
      discounts: [
        {
          id: "od-demo-02",
          orderId: "ord-demo-02",
          promotionId: "promo-coupon-heritage50k",
          name: "Ceremonial Edit ₦50,000 Privilege",
          code: "HERITAGE50K",
          kind: "coupon",
          discountType: "fixed_amount",
          amountMinor: 5000000,
        },
      ],
      history: [
        {
          id: "osh-03",
          orderId: "ord-demo-02",
          fromStatus: null,
          toStatus: "awaiting_payment",
          actor: "customer",
          note: "Order placed.",
          createdAt: now,
        },
        {
          id: "osh-04",
          orderId: "ord-demo-02",
          fromStatus: "awaiting_payment",
          toStatus: "paid",
          actor: "owner@fadeexclusive.com",
          note: "Confirmed full transfer in GTBank statement (Ref: FD-3P7Q2W).",
          createdAt: now,
        },
        {
          id: "osh-05",
          orderId: "ord-demo-02",
          fromStatus: "paid",
          toStatus: "in_production",
          actor: "manager@fadeexclusive.com",
          note: "Assigned to Master Tailor Ibrahim for ochre embroidery work.",
          createdAt: now,
        },
      ],
      payments: [
        {
          id: "pay-demo-01",
          orderId: "ord-demo-02",
          kind: "full",
          method: "manual_transfer",
          amountMinor: 69500000,
          currency: "NGN",
          status: "confirmed",
          confirmedBy: "owner@fadeexclusive.com",
          confirmedAt: now,
          bankReference: "GTB-NIP-994827162",
          receiptAssetUrl: null,
          notes: "Cleared in GTBank corporate account.",
          createdAt: now,
        },
      ],
      receipts: [
        {
          id: "rec-demo-01",
          orderId: "ord-demo-02",
          paymentId: "pay-demo-01",
          receiptNumber: "RCP-FD26-0001",
          rawTokenForDemo: demoReceiptToken,
          tokenHash: hashToken(demoReceiptToken),
          issuedAt: now,
        },
      ],
      createdAt: now,
      updatedAt: now,
    },
  ];

  const customRequests: SeedCustomRequest[] = [
    {
      id: "cr-demo-01",
      requestNumber: "CF26-9M2K",
      submissionId: null,
      customerName: "Damilola Osinbajo",
      customerEmail: "damilola@example.com",
      customerPhone: "+2348091112233",
      occasion: "Ceremonial Three-Piece Agbada",
      eventDate: "2026-12-19",
      budgetRange: "₦850,000 – ₦1,500,000",
      styleNotes:
        "Commissioning a custom espresso-brown and bronze Agbada with matching hand-woven Aso-Oke Fila for my traditional wedding engagement in Abuja.",
      measurements: {
        neckMeasurement: { value: 42, unit: "cm" },
        chestMeasurement: { value: 108, unit: "cm" },
        shoulderMeasurement: { value: 49, unit: "cm" },
        sleeveLengthMeasurement: { value: 65, unit: "cm" },
        tunicLengthMeasurement: { value: 94, unit: "cm" },
        waistMeasurement: { value: 92, unit: "cm" },
        trouserLengthMeasurement: { value: 106, unit: "cm" },
        headCircumference: { value: 59, unit: "cm" },
      },
      referenceImageUrls: [],
      preferredContact: "WhatsApp",
      status: "quoted",
      quoteMinor: 95000000, // NGN 950,000
      depositMinor: 47500000, // NGN 475,000 (50% deposit)
      currency: "NGN",
      estimatedCompletion: "2026-12-05",
      adminNotes: "Includes custom Aso-Oke weaving and 2 fitting sessions at our Maitama, Abuja studio.",
      convertedOrderId: null,
      formVersionSnapshot: forms[1]?.fields ?? [],
      createdAt: now,
      updatedAt: now,
    },
  ];

  const bankAccounts: SeedBankAccount[] = [
    {
      id: "bank-01",
      label: "Primary Corporate Account (NGN)",
      bankName: "Guaranty Trust Bank (GTBank)",
      accountName: "FADE EXCLUSIVE FASHION HOUSE LTD",
      accountNumber: "0123456789", // TODO(owner): Replace with live corporate account number in Admin -> Settings
      instructions:
        "Include your unique Order Reference Code (e.g. FD-XXXXXX) in the bank transfer narration/remark.",
      isActive: true,
      sortOrder: 1,
      updatedAt: now,
    },
    {
      id: "bank-02",
      label: "Secondary Corporate Account (NGN)",
      bankName: "Zenith Bank PLC",
      accountName: "FADE EXCLUSIVE FASHION HOUSE LTD",
      accountNumber: "1029384756", // TODO(owner): Replace with live corporate account number in Admin -> Settings
      instructions:
        "After completing your transfer, tap 'Send Receipt on WhatsApp' on your order page for priority verification.",
      isActive: true,
      sortOrder: 2,
      updatedAt: now,
    },
  ];

  const settings: SeedSettings = {
    businessName: "Fadé Exclusive",
    tagline: "African luxury. Contemporary expression.",
    contactEmail: "atelier@fadeexclusive.com",
    whatsappNumber: "+2348090001234", // TODO(owner): Replace with official atelier WhatsApp number
    address: "Plot 1042, Ademola Adetokunbo Crescent, Maitama, Abuja, Nigeria",
    currency: "NGN",
    defaultPhoneCountry: "NG",
    paymentWindowHours: 48,
    orderPrefix: "FD",
    largeDiscountAlertThresholdPercent: 25,
    storePaused: false,
    storePausedMessage:
      "Our Abuja atelier is currently paused for seasonal inventory preparation. You may still explore our lookbooks and submit a Custom Fit inquiry.",
    shippingOptions: [
      {
        id: "ship-abuja",
        name: "Abuja White-Glove Courier",
        feeMinor: 1000000, // NGN 10,000
        eta: "1–2 business days",
        isActive: true,
      },
      {
        id: "ship-nigeria",
        name: "Nationwide DHL Express (Lagos / Port Harcourt / Other States)",
        feeMinor: 2200000, // NGN 22,000
        eta: "2–4 business days",
        isActive: true,
      },
      {
        id: "ship-intl",
        name: "International DHL Express (UK / US / Europe / Global Diaspora)",
        feeMinor: 6500000, // NGN 65,000
        eta: "4–6 business days",
        isActive: true,
      },
      {
        id: "ship-pickup",
        name: "Maitama Atelier Pickup (Abuja — By Appointment)",
        feeMinor: 0,
        eta: "Ready upon atelier notification",
        isActive: true,
      },
    ],
    socialLinks: {
      instagram: "https://instagram.com/fadeexclusive",
      tiktok: "https://tiktok.com/@fadeexclusive",
      pinterest: "https://pinterest.com/fadeexclusive",
      linkedin: "https://linkedin.com/company/fade-exclusive",
    },
    seoDefaults: {
      defaultTitle: "Fadé Exclusive | African Luxury Fashion House & Bespoke Atelier",
      defaultDescription:
        "Thoughtfully designed. Expertly crafted. Distinctively Fadé. Ready-to-wear, made-to-order, and custom-fit African luxury occasionwear.",
    },
    updatedAt: now,
  };

  const contentPages: SeedContentPage[] = [
    {
      id: "page-shipping",
      slug: "shipping",
      title: "Shipping & Delivery Policy",
      subtitle: "Domestic Abuja white-glove delivery and worldwide DHL Express courier.",
      bodyMarkdown: [
        "### Ready-to-Wear Dispatch",
        "Ready-to-wear pieces in stock are inspected, steam-pressed, and dispatched from our Maitama, Abuja atelier within **1–2 business days** of payment confirmation.",
        "",
        "### Made-to-Order & Bespoke Lead Times",
        "Made-to-order pieces are crafted individually to your selected size or bespoke measurements. Standard production lead times range from **10 to 18 days** as displayed on each product page.",
        "",
        "### International Duties",
        "International shipments are dispatched via DHL Express with full tracking. Import duties and local customs taxes, where applicable, are the responsibility of the recipient.",
        "",
        "<!-- TODO(owner): Review final shipping terms with logistics partner -->",
      ].join("\n"),
      updatedAt: now,
    },
    {
      id: "page-returns",
      slug: "returns",
      title: "Returns, Exchanges & Fit Adjustments",
      subtitle: "Our commitment to impeccable fit and garment craftsmanship.",
      bodyMarkdown: [
        "### Ready-to-Wear Pieces",
        "Ready-to-wear garments may be exchanged for a different size or store credit within **7 days of delivery**, provided the garment is unworn, unaltered, and returned in its original Fadé Exclusive presentation box with all security tags intact.",
        "",
        "### Made-to-Order & Custom-Fit Commissions",
        "Because Made-to-Order and Custom-Fit pieces are cut and embroidered specifically for you, **they are final sale and non-refundable**. However, every commission includes **complimentary fit adjustments** at our Abuja atelier within 14 days of delivery.",
        "",
        "<!-- TODO(owner): Confirm legal return window for international orders -->",
      ].join("\n"),
      updatedAt: now,
    },
    {
      id: "page-privacy",
      slug: "privacy",
      title: "Privacy & Client Data Protection Policy",
      subtitle: "How Fadé Exclusive safeguards your personal information and private measurements.",
      bodyMarkdown: [
        "### Data Minimization",
        "We collect only the information required to craft, fulfill, and deliver your garments: your name, contact details, delivery address, and (for custom commissions) your body measurements and reference images.",
        "",
        "### Private Vault for Custom Measurements & Receipts",
        "Customer reference photographs and bank transfer receipts are stored in an encrypted private bucket and are never publicly accessible.",
        "",
        "<!-- TODO(owner): Insert registered corporate DPO contact details -->",
      ].join("\n"),
      updatedAt: now,
    },
    {
      id: "page-terms",
      slug: "terms",
      title: "Terms of Service",
      subtitle: "Conditions governing purchases and bespoke commissions at Fadé Exclusive.",
      bodyMarkdown: [
        "### Order Reservation & Payment Window",
        "Placing an order reserves ready-to-wear stock for **48 hours**. Orders not settled via bank transfer within the payment window expire automatically and release reserved stock.",
        "",
        "### Pricing & Authenticity",
        "Every Fadé Exclusive piece is crafted in-house at our Abuja atelier without third-party vendors. All prices are confirmed server-side at checkout.",
        "",
        "<!-- TODO(owner): Final legal review of governing law clause -->",
      ].join("\n"),
      updatedAt: now,
    },
  ];

  const auditLogs: SeedAuditLog[] = [
    {
      id: "aud-01",
      actorId: "usr-owner-01",
      actorEmail: "owner@fadeexclusive.com",
      actorRole: "owner",
      action: "order.payment_confirmed",
      entity: "order",
      entityId: "ord-demo-02",
      summary: "Confirmed full manual bank transfer of ₦695,000 for Order FD26-3P7Q",
      beforeJson: { status: "awaiting_payment", amountPaidMinor: 0 },
      afterJson: { status: "paid", amountPaidMinor: 69500000 },
      createdAt: now,
    },
    {
      id: "aud-02",
      actorId: "usr-manager-01",
      actorEmail: "manager@fadeexclusive.com",
      actorRole: "manager",
      action: "custom_request.quoted",
      entity: "custom_request",
      entityId: "cr-demo-01",
      summary: "Issued bespoke quote of ₦950,000 (50% deposit) for inquiry CF26-9M2K",
      beforeJson: { status: "new" },
      afterJson: { status: "quoted", quoteMinor: 95000000, depositMinor: 47500000 },
      createdAt: now,
    },
  ];

  const mediaAssets: SeedMediaAsset[] = [
    {
      id: "med-01",
      bucket: "public",
      objectKey: "public/2026-11-01/logo-full.jpg",
      url: "/brand/logo-full.jpg",
      mimeType: "image/jpeg",
      sizeBytes: 34839,
      altText: "Fadé Exclusive Official Logotype",
      createdAt: now,
    },
    {
      id: "med-02",
      bucket: "public",
      objectKey: "public/2026-11-01/logo-mark.jpg",
      url: "/brand/logo-mark.jpg",
      mimeType: "image/jpeg",
      sizeBytes: 17255,
      altText: "Fadé Exclusive Geometric Monogram Mark",
      createdAt: now,
    },
  ];

  return {
    users,
    sessions: new Map<
      string,
      { userId: string; tokenHash: string; expiresAt: string; createdAt: string }
    >(),
    categories,
    products,
    collections,
    pressItems,
    promotions,
    promotionRedemptions: [
      {
        id: "red-01",
        promotionId: "promo-coupon-fade10",
        orderId: "ord-demo-01",
        customerIdentifierHash: hashToken("chukwudi@example.com"),
        amountMinor: 2850000,
        releasedAt: null,
        createdAt: now,
      },
      {
        id: "red-02",
        promotionId: "promo-coupon-heritage50k",
        orderId: "ord-demo-02",
        customerIdentifierHash: hashToken("olumide@example.com"),
        amountMinor: 5000000,
        releasedAt: null,
        createdAt: now,
      },
    ] as SeedPromotionRedemption[],
    banners,
    forms,
    formSubmissions: [] as SeedFormSubmission[],
    customRequests,
    orders,
    stockReservations: [
      {
        id: "res-demo-01",
        orderId: "ord-demo-01",
        variantId: "var-02-l",
        qty: 1,
        expiresAt: new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString(),
        releasedAt: null,
        consumedAt: null,
        createdAt: now,
      },
    ] as SeedStockReservation[],
    bankAccounts,
    settings,
    contentPages,
    auditLogs,
    mediaAssets,
    sizeGuides: [
      {
        id: "sg-default",
        name: "Fadé Menswear & Occasionwear Size Guide",
        slug: "menswear-standard",
        unit: "cm" as const,
        notesMarkdown:
          "All measurements are in centimeters (cm). For Agbada ensembles, the outer garment is cut with generous ceremonial drape; select your size based on your chest and shoulder width.",
        measurements: [
          { size: "S (EU 46 / UK 36)", chest: "96–100", shoulder: "44", sleeve: "63", length: "88", waist: "80–84" },
          { size: "M (EU 48 / UK 38)", chest: "101–105", shoulder: "46", sleeve: "64", length: "90", waist: "85–89" },
          { size: "L (EU 50 / UK 40)", chest: "106–111", shoulder: "48", sleeve: "65", length: "92", waist: "90–95" },
          { size: "XL (EU 52-54 / UK 42-44)", chest: "112–118", shoulder: "50", sleeve: "66", length: "95", waist: "96–102" },
          { size: "XXL (EU 56 / UK 46)", chest: "119–125", shoulder: "52", sleeve: "67", length: "97", waist: "103–110" },
        ],
      },
    ],
  };
}

export type InMemoryStore = ReturnType<typeof createInitialSeedStore>;
