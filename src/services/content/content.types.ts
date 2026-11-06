import type { z } from "zod";
import type {
  updateContentPageSchema,
  upsertPressItemSchema,
} from "./content.schema";

export type UpsertPressItemInput = z.infer<typeof upsertPressItemSchema>;
export type UpdateContentPageInput = z.infer<typeof updateContentPageSchema>;

export interface PressItemDTO {
  id: string;
  outlet: string;
  title: string;
  excerpt: string;
  url: string;
  publishedDate: string;
  coverUrl: string;
  coverAlt: string;
  isFeatured: boolean;
}

export interface ContentPageDTO {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  bodyMarkdown: string;
  updatedAt: string;
}
