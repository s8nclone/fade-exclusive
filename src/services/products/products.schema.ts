import { z } from "zod";

export const productListQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(48).default(12),
  type: z.enum(["ready_to_wear", "made_to_order"]).optional(),
  category: z.string().optional(),
  q: z.string().optional(),
  sort: z.enum(["newest", "price_asc", "price_desc"]).default("newest"),
});

export const adminProductListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  status: z.enum(["all", "published", "draft", "archived"]).default("all"),
  q: z.string().optional(),
  category: z.string().optional(),
});

export const productVariantInputSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1, "Variant label is required"),
  sku: z.string().min(2, "SKU is required"),
  priceOverrideMinor: z.coerce.number().int().min(0).nullable().optional(),
  stockOnHand: z.coerce.number().int().min(0).default(0),
  lowStockThreshold: z.coerce.number().int().min(0).default(2),
  sortOrder: z.coerce.number().int().default(1),
});

export const productImageInputSchema = z.object({
  id: z.string().optional(),
  url: z.string().min(1, "Image URL is required"),
  altText: z.string().min(2, "Alt text is required for accessibility"),
  sortOrder: z.coerce.number().int().default(1),
});

export const upsertProductSchema = z.object({
  name: z.string().min(2, "Product name is required").max(140),
  slug: z
    .string()
    .min(2, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must contain lowercase letters, numbers, and hyphens only"),
  type: z.enum(["ready_to_wear", "made_to_order"]),
  categoryId: z.string().min(1, "Category is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  priceMinor: z.coerce.number().int().min(100, "Price must be greater than zero"),
  compareAtPriceMinor: z.coerce.number().int().min(0).nullable().optional(),
  leadTimeDays: z.coerce.number().int().min(1).max(120).nullable().optional(),
  depositPercent: z.coerce.number().int().min(10).max(100).nullable().optional(),
  fabricNotes: z.string().optional().default(""),
  careNotes: z.string().optional().default(""),
  fitNotes: z.string().optional().default(""),
  status: z.enum(["draft", "published", "archived"]).default("published"),
  isFeatured: z.boolean().default(false),
  seoTitle: z.string().optional().default(""),
  seoDescription: z.string().optional().default(""),
  images: z.array(productImageInputSchema).min(1, "At least one product image with alt text is required"),
  variants: z.array(productVariantInputSchema).min(1, "At least one variant is required"),
});

export const bulkProductActionSchema = z.object({
  productIds: z.array(z.string()).min(1),
  action: z.enum(["publish", "unpublish", "archive", "change_category"]),
  categoryId: z.string().optional(),
});
