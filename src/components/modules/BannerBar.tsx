"use client";

import * as React from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BannerViewItem {
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
  dismissible: boolean;
  version: number;
  linkedCouponCode?: string | null;
}

export interface BannerBarProps {
  banner: BannerViewItem;
  onDismiss?: (dismissKey: string) => void;
  className?: string;
}

/**
 * Renders admin-customizable banners using inline CSS variables and Tailwind v4 variable classes
 * (`bg-(--banner-bg) text-(--banner-fg)`), strictly solid colors only (Section 14.1).
 */
export function BannerBar({ banner, onDismiss, className }: BannerBarProps) {
  const dismissKey = `${banner.id}:v${banner.version}`;
  const customStyle = {
    "--banner-bg": banner.backgroundColor,
    "--banner-fg": banner.textColor,
    "--banner-btn-bg": banner.buttonBgColor,
    "--banner-btn-fg": banner.buttonTextColor,
  } as React.CSSProperties;

  if (banner.type === "announcement_bar") {
    return (
      <div
        style={customStyle}
        data-testid="announcement-banner"
        className={cn(
          "relative flex items-center justify-between gap-4 border-b border-border/30 bg-(--banner-bg) px-4 py-2.5 text-(--banner-fg)",
          className,
        )}
      >
        <div className="mx-auto flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center text-[11px] font-medium tracking-[0.14em] uppercase">
          <span>{banner.title}</span>
          {banner.ctaLabel && banner.ctaUrl && (
            <Link
              href={banner.ctaUrl}
              className="inline-flex items-center bg-(--banner-btn-bg) px-2.5 py-1 text-[10px] font-semibold tracking-[0.18em] text-(--banner-btn-fg) uppercase transition-opacity hover:opacity-90"
            >
              {banner.ctaLabel}
            </Link>
          )}
        </div>
        {banner.dismissible && onDismiss && (
          <button
            type="button"
            onClick={() => onDismiss(dismissKey)}
            aria-label="Dismiss announcement"
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center opacity-80 hover:opacity-100 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    );
  }

  return (
    <section
      style={customStyle}
      data-testid="promo-strip-banner"
      className={cn(
        "border-y border-border bg-(--banner-bg) px-6 py-10 text-(--banner-fg) md:px-12 md:py-14",
        className,
      )}
    >
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div className="max-w-2xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] opacity-75">
            ATELIER PRIVILEGE
          </p>
          <h2 className="mt-2 font-serif text-2xl font-normal tracking-wide md:text-3xl">
            {banner.title}
          </h2>
          {banner.subtitle && (
            <p className="mt-2 text-sm opacity-85">{banner.subtitle}</p>
          )}
        </div>
        {banner.ctaLabel && banner.ctaUrl && (
          <Link
            href={banner.ctaUrl}
            className="inline-flex min-h-[46px] shrink-0 items-center justify-center bg-(--banner-btn-bg) px-7 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-(--banner-btn-fg) transition-opacity hover:opacity-90"
          >
            {banner.ctaLabel}
          </Link>
        )}
      </div>
    </section>
  );
}
