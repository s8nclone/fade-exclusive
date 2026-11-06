import type { z } from "zod";
import type { upsertBannerSchema } from "./banners.schema";

export type UpsertBannerInput = z.infer<typeof upsertBannerSchema>;

export interface BannerDTO {
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
