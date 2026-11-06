import { z } from "zod";
import { HEX_COLOR_REGEX } from "@/lib/contrast";

const hexColorSchema = z
  .string()
  .regex(HEX_COLOR_REGEX, "Must be a valid 6-digit hex color (e.g. #161412)");

export const upsertBannerSchema = z.object({
  type: z.enum(["announcement_bar", "hero_banner", "promo_strip"]),
  title: z.string().min(2, "Banner title/message is required").max(220),
  subtitle: z.string().max(300).nullable().optional(),
  ctaLabel: z.string().max(60).nullable().optional(),
  ctaUrl: z
    .string()
    .max(250)
    .nullable()
    .optional()
    .refine(
      (val) => {
        if (!val || !val.trim()) return true;
        const trimmed = val.trim();
        if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return true;
        try {
          const parsed = new URL(trimmed);
          return parsed.protocol === "https:";
        } catch {
          return false;
        }
      },
      { message: "CTA URL must be an internal path (/...) or an https:// URL" },
    ),
  backgroundColor: hexColorSchema,
  textColor: hexColorSchema,
  buttonBgColor: hexColorSchema,
  buttonTextColor: hexColorSchema,
  imageUrl: z.string().nullable().optional(),
  imageAlt: z.string().nullable().optional(),
  placement: z.string().default("global"),
  priority: z.coerce.number().int().min(0).max(1000).default(10),
  startsAt: z.string().nullable().optional(),
  endsAt: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
  dismissible: z.boolean().default(true),
  linkedPromotionId: z.string().nullable().optional(),
});
