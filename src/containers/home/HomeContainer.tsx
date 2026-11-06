"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, Scissors } from "lucide-react";
import { toast } from "sonner";
import { usePublicBanners } from "@/services/banners/banners.hooks";
import { useProductsInfinite } from "@/services/products/products.hooks";
import { useCollectionsInfinite } from "@/services/collections/collections.hooks";
import { usePublicPress } from "@/services/content/content.hooks";
import { useCartStore } from "@/stores/cart.store";
import { useUiStore } from "@/stores/ui.store";
import { BannerBar } from "@/components/modules/BannerBar";
import { ProductGrid } from "@/components/modules/ProductGrid";
import type { QuickAddPayload } from "@/components/molecules/ProductCard";
import { CollectionCard } from "@/components/molecules/CollectionCard";
import { PressCard } from "@/components/molecules/PressCard";

export function HomeContainer() {
  const { data: banners = [] } = usePublicBanners();
  const {
    data: productsData,
    isLoading: productsLoading,
    isError: productsError,
  } = useProductsInfinite({
    limit: 6,
  });
  const { data: collectionsData } = useCollectionsInfinite({ limit: 3 });
  const { data: pressItems = [] } = usePublicPress();

  const heroBanner = banners.find((b) => b.type === "hero_banner");
  const promoStrip = banners.find((b) => b.type === "promo_strip");
  const featuredProducts = productsData?.pages.flatMap((p) => p.items) ?? [];
  const collections = collectionsData?.pages.flatMap((p) => p.items) ?? [];

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

  return (
    <div className="space-y-0">
      {/* EDITORIAL HERO SECTION */}
      <section className="bg-obsidian text-obsidian-foreground border-b border-obsidian-foreground/15">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-8 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 border border-obsidian-foreground/25 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-accent">
                <span>BRAND &amp; GROWTH PORTFOLIO 2026</span>
              </div>

              <h1 className="font-serif text-4xl font-normal leading-[1.08] tracking-wide sm:text-6xl lg:text-7xl">
                {heroBanner?.title ??
                  "FADÉ EXCLUSIVES — 2026 SIGNATURE EDITION"}
              </h1>

              <p className="max-w-xl font-serif text-xl italic leading-relaxed text-obsidian-foreground/85 sm:text-2xl">
                {heroBanner?.subtitle ??
                  "African luxury. Contemporary expression. Thoughtfully designed in our Maitama, Abuja Atelier."}
              </p>

              <div className="flex flex-wrap gap-4 pt-3">
                <Link
                  href={heroBanner?.ctaUrl || "/shop"}
                  className="inline-flex min-h-12 items-center justify-center gap-2 bg-accent px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground hover:opacity-90"
                >
                  <span>{heroBanner?.ctaLabel || "Explore 2026 Pieces"}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/custom-fit"
                  className="inline-flex min-h-12 items-center justify-center border border-obsidian-foreground/40 px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-obsidian-foreground hover:bg-obsidian-foreground hover:text-obsidian"
                >
                  Commission Custom Fit
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-4 border-t border-obsidian-foreground/20 pt-8 text-xs">
                <div>
                  <p className="font-serif text-2xl text-accent">01</p>
                  <p className="mt-1 font-semibold uppercase tracking-[0.16em]">
                    THE AGBADA
                  </p>
                  <p className="mt-0.5 text-obsidian-foreground/70">
                    Hand-loomed Aso-Oke &amp; Zari
                  </p>
                </div>
                <div>
                  <p className="font-serif text-2xl text-accent">02</p>
                  <p className="mt-1 font-semibold uppercase tracking-[0.16em]">
                    THE MODERN SET
                  </p>
                  <p className="mt-0.5 text-obsidian-foreground/70">
                    Architectural Senator Sets
                  </p>
                </div>
                <div>
                  <p className="font-serif text-2xl text-accent">03</p>
                  <p className="mt-1 font-semibold uppercase tracking-[0.16em]">
                    THE FILA
                  </p>
                  <p className="mt-0.5 text-obsidian-foreground/70">
                    Sculpted Yorùbá Crowns
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative aspect-4/5 overflow-hidden border border-obsidian-foreground/20 bg-surface">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=85"
                  alt="Fadé Exclusives Royal Alabaster & Gold Hand-Woven Agbada"
                  className="h-full w-full object-cover"
                />
                <div className="absolute bottom-0 inset-x-0 bg-obsidian/95 p-5 border-t border-obsidian-foreground/20">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-accent">
                    ATELIER SIGNATURE PIECE
                  </p>
                  <p className="mt-1 font-serif text-lg text-obsidian-foreground">
                    The Royal Alabaster &amp; Gold Agbada
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DYNAMIC PROMO STRIP BANNER (IF ACTIVE) */}
      {promoStrip && <BannerBar banner={promoStrip} />}

      {/* FEATURED 2026 PIECES */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-8 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-accent">
              CURATED READY-TO-WEAR &amp; MADE-TO-ORDER
            </p>
            <h2 className="mt-2 font-serif text-3xl font-normal uppercase sm:text-4xl">
              2026 Signature Pieces
            </h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-foreground underline underline-offset-4 hover:text-accent"
          >
            <span>View Full Collection</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-10">
          <ProductGrid
            items={featuredProducts}
            isLoading={productsLoading}
            isError={productsError}
            favoriteProductIds={favoriteProductIds}
            onToggleFavorite={handleToggleFavorite}
            onQuickAdd={handleQuickAdd}
          />
        </div>
      </section>

      {/* BRAND PILLARS BAND */}
      <section className="border-y border-border bg-surface py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="border border-border bg-surface-elevated p-6">
              <Sparkles className="h-5 w-5 text-accent" />
              <h3 className="mt-4 text-xs font-semibold uppercase tracking-[0.2em]">
                AFRICAN HERITAGE LUXURY
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Hand-loomed Aso-Oke, superfine merino wool, and architectural
                tailoring crafted in our Abuja Flagship Atelier.
              </p>
            </div>
            <div className="border border-border bg-surface-elevated p-6">
              <Scissors className="h-5 w-5 text-accent" />
              <h3 className="mt-4 text-xs font-semibold uppercase tracking-[0.2em]">
                MADE-TO-ORDER &amp; BESPOKE DEPOSITS
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Commission Made-to-Order garments with a 50% Atelier deposit and
                dedicated production milestones.
              </p>
            </div>
            <div className="border border-border bg-surface-elevated p-6">
              <ShieldCheck className="h-5 w-5 text-accent" />
              <h3 className="mt-4 text-xs font-semibold uppercase tracking-[0.2em]">
                DIRECT BANK TRANSFER &amp; VERIFIED RECEIPTS
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Instant order reference codes, 48-hour stock reservation, and
                cryptographically signed receipts via WhatsApp &amp; Email.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* LOOKBOOKS / COLLECTIONS */}
      {collections.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-8 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-accent">
                SEASONAL ARCHIVES
              </p>
              <h2 className="mt-2 font-serif text-3xl font-normal uppercase sm:text-4xl">
                Editorial Lookbooks
              </h2>
            </div>
            <Link
              href="/collections"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-foreground underline underline-offset-4 hover:text-accent"
            >
              <span>All Lookbooks</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
            {collections.map((col) => (
              <CollectionCard key={col.id} {...col} />
            ))}
          </div>
        </section>
      )}

      {/* PRESS & RECOGNITION */}
      {pressItems.length > 0 && (
        <section className="border-t border-border bg-surface py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-accent">
                  CULTURAL IMPACT
                </p>
                <h2 className="mt-2 font-serif text-3xl font-normal uppercase">
                  In The Press
                </h2>
              </div>
              <Link
                href="/press"
                className="text-xs font-semibold uppercase tracking-[0.2em] underline underline-offset-4"
              >
                View Press Archive
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
              {pressItems.slice(0, 3).map((item) => (
                <PressCard key={item.id} {...item} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
