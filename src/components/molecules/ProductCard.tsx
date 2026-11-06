"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Eye, Heart, ShoppingBag } from "lucide-react";
import { Price } from "@/components/atoms/Price";
import { StatusBadge } from "@/components/atoms/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface ProductCardVariantOption {
  id: string;
  label: string;
  sku?: string;
  priceMinor?: number;
  availability: "in_stock" | "low_stock" | "out_of_stock" | "made_to_order";
}

export interface QuickAddPayload {
  productId: string;
  productName: string;
  productSlug: string;
  variantId: string;
  variantLabel: string;
  imageUrl: string;
}

export interface ProductCardViewProps {
  id: string;
  slug: string;
  name: string;
  type: "ready_to_wear" | "made_to_order";
  categoryName: string;
  effectivePriceMinor: number;
  originalPriceMinor: number | null;
  hasSale: boolean;
  activeOfferLabel: string | null;
  currency: string;
  leadTimeDays: number | null;
  primaryImage: { url: string; altText: string };
  availability: "in_stock" | "low_stock" | "out_of_stock" | "made_to_order";
  variants?: ProductCardVariantOption[];
  isFavorited?: boolean;
  onPrefetch?: (slug: string) => void;
  onQuickAdd?: (payload: QuickAddPayload) => void;
  onToggleFavorite?: (productId: string, productName: string) => void;
  className?: string;
}

export function ProductCard({
  id,
  slug,
  name,
  type,
  categoryName,
  effectivePriceMinor,
  originalPriceMinor,
  hasSale,
  activeOfferLabel,
  currency,
  leadTimeDays,
  primaryImage,
  availability,
  variants = [],
  isFavorited = false,
  onPrefetch,
  onQuickAdd,
  onToggleFavorite,
  className,
}: ProductCardViewProps) {
  const firstAvailableVariant = React.useMemo(
    () =>
      variants.find((v) => v.availability !== "out_of_stock") ?? variants[0],
    [variants],
  );

  const [selectedVariantId, setSelectedVariantId] = React.useState<string>(
    firstAvailableVariant?.id ?? "",
  );
  const [justAdded, setJustAdded] = React.useState(false);

  React.useEffect(() => {
    if (!selectedVariantId && firstAvailableVariant) {
      setSelectedVariantId(firstAvailableVariant.id);
    }
  }, [firstAvailableVariant, selectedVariantId]);

  const activeVariant =
    variants.find((v) => v.id === selectedVariantId) ?? firstAvailableVariant;
  const isSoldOut =
    availability === "out_of_stock" ||
    activeVariant?.availability === "out_of_stock";

  const handleQuickAddClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSoldOut || !onQuickAdd) return;

    const variantId = activeVariant?.id ?? `${id}-default`;
    const variantLabel = activeVariant?.label ?? "Standard";

    onQuickAdd({
      productId: id,
      productName: name,
      productSlug: slug,
      variantId,
      variantLabel,
      imageUrl: primaryImage.url,
    });

    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  };

  return (
    <article
      onMouseEnter={() => onPrefetch?.(slug)}
      onTouchStart={() => onPrefetch?.(slug)}
      className={cn(
        "group relative flex flex-col border border-border bg-surface-elevated transition-colors hover:border-foreground/50",
        className,
      )}
    >
      {/* IMAGE CONTAINER WITH STATUS BADGES & FAVORITE BUTTON */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface">
        <Link href={`/shop/${slug}`} className="block h-full w-full">
          <img
            src={primaryImage.url}
            alt={primaryImage.altText}
            loading="lazy"
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
          <StatusBadge status={availability} kind="availability" />
          {hasSale && (
            <Badge variant="accent">
              {activeOfferLabel ? activeOfferLabel : "Privilege Offer"}
            </Badge>
          )}
        </div>

        {onToggleFavorite && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavorite(id, name);
            }}
            aria-label={
              isFavorited
                ? `Remove ${name} from saved pieces`
                : `Save ${name} to favorites`
            }
            aria-pressed={isFavorited}
            className={cn(
              "absolute right-3 top-3 z-10 inline-flex h-9 w-9 cursor-pointer items-center justify-center border transition-colors",
              isFavorited
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border bg-surface-elevated text-foreground hover:border-accent hover:text-accent",
            )}
          >
            <Heart
              className={cn("h-4 w-4", isFavorited && "fill-current")}
            />
          </button>
        )}
      </div>

      {/* CARD BODY */}
      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            {categoryName}
          </p>
          <Link
            href={`/shop/${slug}`}
            className="mt-1 block font-serif text-lg font-medium leading-snug text-foreground group-hover:text-accent"
          >
            {name}
          </Link>
        </div>

        <div className="mt-3 space-y-3 border-t border-border/60 pt-3">
          {/* Price & Lead Time */}
          <div className="flex items-baseline justify-between gap-2">
            <Price
              amountMinor={effectivePriceMinor}
              originalAmountMinor={originalPriceMinor}
              currency={currency}
            />
            {type === "made_to_order" && leadTimeDays && (
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {leadTimeDays}d Atelier Lead
              </span>
            )}
          </div>

          {/* Inline Size Picker (when variants are present) */}
          {variants.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Size:
              </span>
              {variants.map((v) => {
                const isSelected = v.id === activeVariant?.id;
                const isVarOut = v.availability === "out_of_stock";
                return (
                  <button
                    key={v.id}
                    type="button"
                    disabled={isVarOut}
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedVariantId(v.id);
                    }}
                    aria-label={`Select size ${v.label} for ${name}`}
                    className={cn(
                      "min-h-[26px] min-w-[28px] cursor-pointer border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-colors",
                      isVarOut &&
                        "cursor-not-allowed line-through opacity-40",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-surface text-foreground hover:border-accent",
                    )}
                  >
                    {v.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Intentional Action Buttons: Quick Add to Bag + View Details */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {onQuickAdd ? (
              <Button
                type="button"
                size="sm"
                variant={justAdded ? "accent" : "default"}
                disabled={isSoldOut}
                onClick={handleQuickAddClick}
                className="min-h-[38px] w-full gap-1.5 px-2.5 text-[10px]"
              >
                {justAdded ? (
                  <>
                    <Check className="h-3.5 w-3.5 shrink-0" />
                    <span>Added ({activeVariant?.label ?? "M"})</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-3.5 w-3.5 shrink-0" />
                    <span>{isSoldOut ? "Sold Out" : "Add to Bag"}</span>
                  </>
                )}
              </Button>
            ) : null}

            <Link
              href={`/shop/${slug}`}
              className={cn(
                "inline-flex min-h-[38px] items-center justify-center gap-1.5 border border-foreground/35 bg-surface px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground transition-colors hover:border-accent hover:bg-accent hover:text-accent-foreground",
                !onQuickAdd && "col-span-2",
              )}
            >
              <Eye className="h-3.5 w-3.5 shrink-0" />
              <span>View Details</span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col border border-border bg-surface-elevated",
        className,
      )}
    >
      <Skeleton className="aspect-[4/5] w-full" />
      <div className="p-4 space-y-2.5">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-4 w-32 mt-3" />
        <div className="grid grid-cols-2 gap-2 pt-2">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      </div>
    </div>
  );
}
