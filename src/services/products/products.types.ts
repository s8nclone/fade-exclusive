import type { z } from "zod";
import type {
  adminProductListQuerySchema,
  bulkProductActionSchema,
  productListQuerySchema,
  upsertProductSchema,
} from "./products.schema";

export type ProductListQuery = z.infer<typeof productListQuerySchema>;
export type AdminProductListQuery = z.infer<typeof adminProductListQuerySchema>;
export type UpsertProductInput = z.infer<typeof upsertProductSchema>;
export type BulkProductActionInput = z.infer<typeof bulkProductActionSchema>;

export type PublicAvailabilityStatus =
  | "in_stock"
  | "low_stock"
  | "out_of_stock"
  | "made_to_order";

export interface PublicProductVariantDTO {
  id: string;
  label: string;
  sku: string;
  priceMinor: number;
  availability: PublicAvailabilityStatus;
}

export interface ProductCardDTO {
  id: string;
  slug: string;
  name: string;
  type: "ready_to_wear" | "made_to_order";
  categoryName: string;
  categorySlug: string;
  priceMinor: number;
  effectivePriceMinor: number;
  originalPriceMinor: number | null;
  hasSale: boolean;
  activeOfferLabel: string | null;
  offerEndsAt: string | null;
  currency: string;
  leadTimeDays: number | null;
  depositPercent: number | null;
  primaryImage: {
    url: string;
    altText: string;
  };
  secondaryImage: {
    url: string;
    altText: string;
  } | null;
  availability: PublicAvailabilityStatus;
  isFeatured: boolean;
  variants: PublicProductVariantDTO[];
}

export interface ProductDetailDTO extends ProductCardDTO {
  description: string;
  fabricNotes: string;
  careNotes: string;
  fitNotes: string;
  images: Array<{
    id: string;
    url: string;
    altText: string;
    sortOrder: number;
  }>;
  sizeGuide: {
    id: string;
    name: string;
    unit: "cm" | "in";
    notesMarkdown: string;
    measurements: Array<{
      size: string;
      chest: string;
      shoulder: string;
      sleeve: string;
      length: string;
      waist?: string;
    }>;
  } | null;
  relatedProducts: ProductCardDTO[];
  seoTitle: string;
  seoDescription: string;
}

export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface Paginated<T> {
  items: T[];
  nextCursor: string | null;
  categories?: CategoryDTO[];
}

export interface AdminPaginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminProductDTO {
  id: string;
  slug: string;
  name: string;
  type: "ready_to_wear" | "made_to_order";
  categoryId: string;
  categoryName: string;
  description: string;
  priceMinor: number;
  compareAtPriceMinor: number | null;
  currency: string;
  leadTimeDays: number | null;
  depositPercent: number | null;
  fabricNotes: string;
  careNotes: string;
  fitNotes: string;
  status: "draft" | "published" | "archived";
  isFeatured: boolean;
  sortOrder: number;
  seoTitle: string;
  seoDescription: string;
  hasOrders: boolean;
  totalStockOnHand: number;
  images: Array<{
    id: string;
    url: string;
    altText: string;
    sortOrder: number;
  }>;
  variants: Array<{
    id: string;
    label: string;
    sku: string;
    priceOverrideMinor: number | null;
    stockOnHand: number;
    availableStock: number;
    lowStockThreshold: number;
    sortOrder: number;
  }>;
  updatedAt: string;
}
