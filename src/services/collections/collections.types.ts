import type { z } from "zod";
import type {
  collectionListQuerySchema,
  upsertCollectionSchema,
} from "./collections.schema";
import type { ProductCardDTO } from "@/services/products/products.types";

export type CollectionListQuery = z.infer<typeof collectionListQuerySchema>;
export type UpsertCollectionInput = z.infer<typeof upsertCollectionSchema>;

export interface CollectionItemDTO {
  id: string;
  imageUrl: string;
  altText: string;
  caption: string;
  linkedProduct: ProductCardDTO | null;
  sortOrder: number;
}

export interface CollectionCardDTO {
  id: string;
  title: string;
  slug: string;
  season: string;
  story: string;
  coverUrl: string;
  coverAlt: string;
  itemCount: number;
  status: "draft" | "published" | "archived";
}

export interface CollectionDetailDTO extends CollectionCardDTO {
  items: CollectionItemDTO[];
}
