"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import {
  useCollectionDetail,
  useCollectionsInfinite,
} from "@/services/collections/collections.hooks";
import type { ProductCardDTO } from "@/services/products/products.types";
import { useCartStore } from "@/stores/cart.store";
import { useUiStore } from "@/stores/ui.store";
import { CollectionCard } from "@/components/molecules/CollectionCard";
import { ProductGrid } from "@/components/modules/ProductGrid";
import type { QuickAddPayload } from "@/components/molecules/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/atoms/ErrorState";

export function CollectionsListContainer() {
  const { data, isLoading } = useCollectionsInfinite({ limit: 12 });
  const collections = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8 sm:py-16">
      <div className="border-b border-border pb-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-accent">
          EDITORIAL ARCHIVES
        </p>
        <h1 className="mt-2 font-serif text-4xl font-normal uppercase sm:text-5xl">
          Collections &amp; Lookbooks
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Seasonal studies in African architectural tailoring, hand-woven Aso-Oke,
          and contemporary eveningwear.
        </p>
      </div>

      {isLoading ? (
        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
          <Skeleton className="aspect-[16/10] w-full" />
          <Skeleton className="aspect-[16/10] w-full" />
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
          {collections.map((col) => (
            <CollectionCard key={col.id} {...col} />
          ))}
        </div>
      )}
    </div>
  );
}

export function CollectionDetailContainer({ slug }: { slug: string }) {
  const { data: collection, isLoading, isError, refetch } = useCollectionDetail(slug);
  const addItem = useCartStore((s) => s.addItem);
  const favoriteProductIds = useCartStore((s) => s.favoriteProductIds);
  const toggleFavorite = useCartStore((s) => s.toggleFavorite);
  const setCartDrawerOpen = useUiStore((s) => s.setCartDrawerOpen);

  const handleQuickAdd = (payload: QuickAddPayload) => {
    addItem({
      variantId: payload.variantId,
      productId: payload.productId,
      qty: 1,
      productNameHint: payload.productName,
      productSlugHint: payload.productSlug,
      variantLabelHint: payload.variantLabel,
      imageUrlHint: payload.imageUrl,
    });
    toast.success(
      `Added ${payload.productName} (${payload.variantLabel}) to your shopping bag.`,
    );
    setCartDrawerOpen(true);
  };

  const handleToggleFavorite = (productId: string, productName: string) => {
    const added = toggleFavorite(productId);
    toast.success(
      added
        ? `Saved ${productName} to your Atelier favorites.`
        : `Removed ${productName} from favorites.`,
    );
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8 space-y-8">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError || !collection) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <ErrorState
          title="Lookbook Not Found"
          message="This editorial archive is unavailable."
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  const linkedProducts: ProductCardDTO[] = collection.items
    .map((item) => item.linkedProduct)
    .filter((p): p is ProductCardDTO => p !== null);

  return (
    <div className="space-y-12 pb-20">
      <section className="bg-obsidian text-obsidian-foreground border-b border-obsidian-foreground/20 px-4 py-16 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/collections"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-obsidian-foreground/75 hover:text-obsidian-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>All Lookbooks</span>
          </Link>

          <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-6 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-accent">
                {collection.season}
              </p>
              <h1 className="font-serif text-4xl font-normal uppercase sm:text-5xl">
                {collection.title}
              </h1>
              <p className="text-sm leading-relaxed text-obsidian-foreground/80">
                {collection.story}
              </p>
            </div>
            <div className="lg:col-span-6">
              <div className="aspect-[16/10] overflow-hidden border border-obsidian-foreground/20">
                <img
                  src={collection.coverUrl}
                  alt={collection.coverAlt}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EDITORIAL LOOKBOOK FRAMES & LINKED PIECES */}
      <section className="mx-auto max-w-7xl px-4 sm:px-8 space-y-12">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {collection.items.map((item) => (
            <figure
              key={item.id}
              className="border border-border bg-surface-elevated p-4 space-y-3"
            >
              <div className="aspect-[4/5] overflow-hidden bg-surface">
                <img
                  src={item.imageUrl}
                  alt={item.altText}
                  className="h-full w-full object-cover"
                />
              </div>
              <figcaption className="text-xs text-muted-foreground">
                {item.caption}
              </figcaption>
            </figure>
          ))}
        </div>

        {linkedProducts.length > 0 && (
          <div>
            <h2 className="font-serif text-2xl font-normal uppercase tracking-wide sm:text-3xl">
              Shop Pieces from {collection.title}
            </h2>
            <div className="mt-6">
              <ProductGrid
                items={linkedProducts}
                isLoading={false}
                isError={false}
                favoriteProductIds={favoriteProductIds}
                onToggleFavorite={handleToggleFavorite}
                onQuickAdd={handleQuickAdd}
              />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
