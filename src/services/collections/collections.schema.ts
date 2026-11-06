import { z } from "zod";

export const collectionListQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(24).default(12),
});

export const upsertCollectionSchema = z.object({
  title: z.string().min(2, "Title is required").max(140),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
  season: z.string().min(2, "Season label is required"),
  story: z.string().min(10, "Collection story is required"),
  coverUrl: z.string().min(1, "Cover image URL is required"),
  coverAlt: z.string().min(2, "Cover alt text is required"),
  status: z.enum(["draft", "published", "archived"]).default("published"),
  items: z
    .array(
      z.object({
        id: z.string().optional(),
        imageUrl: z.string().min(1),
        altText: z.string().min(2),
        caption: z.string().default(""),
        linkedProductId: z.string().nullable().optional(),
        sortOrder: z.coerce.number().int().default(1),
      }),
    )
    .default([]),
});
