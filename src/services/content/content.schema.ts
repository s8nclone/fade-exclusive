import { z } from "zod";

export const upsertPressItemSchema = z.object({
  outlet: z.string().min(2).max(120),
  title: z.string().min(2).max(200),
  excerpt: z.string().max(500).default(""),
  url: z.string().url("Must be a valid URL"),
  publishedDate: z.string().min(4),
  coverUrl: z.string().min(1),
  coverAlt: z.string().min(2),
  isFeatured: z.boolean().default(false),
});

export const updateContentPageSchema = z.object({
  title: z.string().min(2).max(160),
  subtitle: z.string().max(300).default(""),
  bodyMarkdown: z.string().min(5),
});
