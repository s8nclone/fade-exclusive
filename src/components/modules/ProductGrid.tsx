"use client";

import * as React from "react";
import { EmptyState } from "@/components/atoms/EmptyState";
import { ErrorState } from "@/components/atoms/ErrorState";
import {
  ProductCard,
  ProductCardSkeleton,
  type ProductCardViewProps,
  type QuickAddPayload,
} from "@/components/molecules/ProductCard";
import { Button } from "@/components/ui/button";

export interface ProductGridProps {
  items: ProductCardViewProps[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
  sentinelRef?: React.RefObject<HTMLDivElement | null>;
  onPrefetchProduct?: (slug: string) => void;
  onResetFilters?: () => void;
  favoriteProductIds?: string[];
  onToggleFavorite?: (productId: string, productName: string) => void;
  onQuickAdd?: (payload: QuickAddPayload) => void;
}

export function ProductGrid({
  items,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  hasNextPage = false,
  isFetchingNextPage = false,
  onLoadMore,
  sentinelRef,
  onPrefetchProduct,
  onResetFilters,
  favoriteProductIds = [],
  onToggleFavorite,
  onQuickAdd,
}: ProductGridProps) {
  if (isError) {
    return (
      <ErrorState
        title="Unable to load collection pieces"
        message={errorMessage || "Please check your connection and try again."}
        onRetry={onRetry}
      />
    );
  }

  if (isLoading) {
    return (
      <div
        data-testid="product-grid-skeleton"
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {Array.from({ length: 6 }).map((_, idx) => (
          <ProductCardSkeleton key={idx} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        eyebrow="NO MATCHING PIECES"
        title="No garments match your current filter selection"
        description="Explore our full 2026 Signature Collection or commission a bespoke piece tailored to your measurements."
        actionLabel={onResetFilters ? "Reset All Filters" : "Request Custom Fit"}
        onAction={onResetFilters}
        actionHref={onResetFilters ? undefined : "/custom-fit"}
      />
    );
  }

  return (
    <div className="space-y-10">
      <div
        data-testid="product-grid"
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {items.map((item) => (
          <ProductCard
            key={item.id}
            {...item}
            isFavorited={favoriteProductIds.includes(item.id)}
            onToggleFavorite={onToggleFavorite}
            onQuickAdd={onQuickAdd}
            onPrefetch={onPrefetchProduct}
          />
        ))}
        {isFetchingNextPage &&
          Array.from({ length: 3 }).map((_, idx) => (
            <ProductCardSkeleton key={`more-skeleton-${idx}`} />
          ))}
      </div>

      {/* Bottom sentinel for IntersectionObserver scroll-triggered pagination (Section 8.5) */}
      <div ref={sentinelRef} className="flex flex-col items-center justify-center py-4">
        {hasNextPage ? (
          <Button
            type="button"
            variant="outline"
            disabled={isFetchingNextPage}
            onClick={onLoadMore}
          >
            {isFetchingNextPage ? "Loading Pieces..." : "Load More Pieces"}
          </Button>
        ) : (
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Showing all {items.length} atelier piece{items.length === 1 ? "" : "s"}
          </p>
        )}
      </div>
    </div>
  );
}
