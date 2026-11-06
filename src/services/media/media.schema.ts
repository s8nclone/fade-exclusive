import { z } from "zod";

export const requestUploadSignSchema = z.object({
  bucketKind: z.enum(["public", "private"]).default("public"),
  mimeType: z.enum(["image/webp", "image/jpeg", "image/png"]),
  sizeBytes: z.coerce.number().int().min(1).max(8 * 1024 * 1024),
  altText: z.string().min(2, "Alt text is required").max(220),
});

export const confirmUploadSchema = z.object({
  bucketKind: z.enum(["public", "private"]).default("public"),
  objectKey: z.string().min(4),
  publicUrl: z.string().min(1),
  mimeType: z.enum(["image/webp", "image/jpeg", "image/png"]),
  sizeBytes: z.coerce.number().int().min(1),
  altText: z.string().min(2).max(220),
});
