"use client";

import * as React from "react";
import Link from "next/link";
import { Ruler, Clock, ShieldCheck, ShoppingBag, ArrowLeft, Heart } from "lucide-react";
import { toast } from "sonner";
import { useProductDetail } from "@/services/products/products.hooks";
import { useCartStore } from "@/stores/cart.store";
import { useUiStore } from "@/stores/ui.store";
import { Price } from "@/components/atoms/Price";
import { StatusBadge } from "@/components/atoms/StatusBadge";
import { SizeSelector } from "@/components/molecules/SizeSelector";
import { QuantityStepper } from "@/components/molecules/QuantityStepper";
import { ProductGrid } from "@/components/modules/ProductGrid";
import type { QuickAddPayload } from "@/components/molecules/ProductCard";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { ErrorState } from "@/components/atoms/ErrorState";
import { Skeleton } from "@/components/ui/skeleton";

export function ProductDetailContainer({ slug }: { slug: string }) {
  const { data: product, isLoading, isError, refetch } = useProductDetail(slug);
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

  const [selectedVariantId, setSelectedVariantId] = React.useState<string>("");
  const [selectedImageIdx, setSelectedImageIdx] = React.useState(0);
  const [qty, setQty] = React.useState(1);
  const [sizeGuideOpen, setSizeGuideOpen] = React.useState(false);

  React.useEffect(() => {
    if (product && product.variants.length > 0 && !selectedVariantId) {
      const firstAvailable =
        product.variants.find((v) => v.availability !== "out_of_stock") ??
        product.variants[0];
      if (firstAvailable) {
        setSelectedVariantId(firstAvailable.id);
      }
    }
  }, [product, selectedVariantId]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Skeleton className="aspect-[3/4] w-full" />
          </div>
          <div className="lg:col-span-5 space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <ErrorState
          title="Piece Not Found"
          message="We could not locate this garment in the 2026 Fadé Exclusives catalog."
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  const activeVariant =
    product.variants.find((v) => v.id === selectedVariantId) ??
    product.variants[0];
  const isOutOfStock = activeVariant?.availability === "out_of_stock";
  const activeImage =
    product.images[selectedImageIdx] ?? {
      url: product.primaryImage.url,
      altText: product.primaryImage.altText,
    };

  const handleAddToBag = () => {
    if (!activeVariant) return;
    if (activeVariant.availability === "out_of_stock") {
      toast.error("This size is currently sold out.");
      return;
    }

    addItem({
      variantId: activeVariant.id,
      productId: product.id,
      qty,
      productNameHint: product.name,
      productSlugHint: product.slug,
      variantLabelHint: activeVariant.label,
      imageUrlHint: product.primaryImage.url,
    });

    toast.success(`Added ${product.name} (${activeVariant.label}) to bag.`);
    setCartDrawerOpen(true);
  };

  // JSON-LD Product Schema (Section 18)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((i) => i.url),
    offers: {
      "@type": "Offer",
      priceCurrency: product.currency,
      price: (product.effectivePriceMinor / 100).toFixed(2),
      availability:
        product.availability === "out_of_stock"
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-12 pb-28 lg:pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mb-6">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to 2026 Catalog</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* LEFT GALLERY */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[3/4] w-full overflow-hidden border border-border bg-surface">
            <img
              src={activeImage.url}
              alt={activeImage.altText}
              className="h-full w-full object-cover"
            />
            {product.activeOfferLabel && (
              <div className="absolute left-4 top-4 bg-accent px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-accent-foreground">
                {product.activeOfferLabel}
              </div>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
              {product.images.map((img, idx) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`aspect-[3/4] overflow-hidden border ${
                    idx === selectedImageIdx
                      ? "border-2 border-primary"
                      : "border-border opacity-75 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img.url}
                    alt={img.altText}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT DETAILS */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2 border-b border-border pb-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                {product.categoryName}
              </span>
              <StatusBadge status={activeVariant?.availability ?? product.availability} />
            </div>

            <h1 className="font-serif text-3xl font-normal tracking-wide sm:text-4xl">
              {product.name}
            </h1>

            <div className="pt-2">
              <Price
                amountMinor={product.effectivePriceMinor}
                originalAmountMinor={product.originalPriceMinor}
                currency={product.currency}
                size="lg"
              />
            </div>

            {product.type === "made_to_order" && (
              <div className="mt-3 border border-accent/40 bg-surface p-3.5 text-xs">
                <p className="flex items-center gap-2 font-semibold uppercase tracking-wider text-accent">
                  <Clock className="h-4 w-4" />
                  <span>
                    Made-to-Order • {product.leadTimeDays ?? 14} Days Production Lead Time
                  </span>
                </p>
                {product.depositPercent && (
                  <p className="mt-1 text-muted-foreground">
                    Eligible for a {product.depositPercent}% Atelier deposit at checkout,
                    with the remaining balance due upon tailored completion.
                  </p>
                )}
              </div>
            )}
          </div>

          <p className="text-sm leading-relaxed text-foreground/90">
            {product.description}
          </p>

          {/* SIZE SELECTOR */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.16em]">
                Select Size:{" "}
                <strong className="text-accent">{activeVariant?.label}</strong>
              </span>
              {product.sizeGuide && (
                <button
                  type="button"
                  onClick={() => setSizeGuideOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium underline underline-offset-4 hover:text-accent"
                >
                  <Ruler className="h-3.5 w-3.5" />
                  <span>Size &amp; Fit Guide</span>
                </button>
              )}
            </div>

            <SizeSelector
              options={product.variants.map((v) => ({
                id: v.id,
                label: v.label,
                availability: v.availability,
              }))}
              selectedId={selectedVariantId}
              onSelect={setSelectedVariantId}
            />
          </div>

          {/* QUANTITY & ADD TO BAG + FAVORITE */}
          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
            <QuantityStepper value={qty} onChange={setQty} disabled={isOutOfStock} />
            <Button
              size="lg"
              className="flex-1 gap-2"
              disabled={isOutOfStock}
              onClick={handleAddToBag}
            >
              <ShoppingBag className="h-4 w-4" />
              <span>
                {isOutOfStock
                  ? "Sold Out"
                  : product.type === "made_to_order"
                    ? "Commission Made-to-Order"
                    : "Add to Shopping Bag"}
              </span>
            </Button>
            <Button
              type="button"
              variant={favoriteProductIds.includes(product.id) ? "accent" : "outline"}
              size="lg"
              onClick={() => handleToggleFavorite(product.id, product.name)}
              aria-label={
                favoriteProductIds.includes(product.id)
                  ? `Remove ${product.name} from favorites`
                  : `Save ${product.name} to favorites`
              }
              className="px-4"
            >
              <Heart
                className={`h-4 w-4 ${
                  favoriteProductIds.includes(product.id) ? "fill-current" : ""
                }`}
              />
            </Button>
          </div>

          <div className="border border-border bg-surface p-4 text-xs">
            <p className="font-semibold uppercase tracking-wider">
              Need Bespoke Measurements?
            </p>
            <p className="mt-1 text-muted-foreground">
              Every Fadé piece can be tailored to your exact silhouette via our
              Custom Fit service.
            </p>
            <Link
              href={`/custom-fit?product=${encodeURIComponent(product.name)}`}
              className="mt-2 inline-block font-semibold uppercase tracking-wider text-accent underline underline-offset-4"
            >
              Request Custom Fit for this Piece →
            </Link>
          </div>

          {/* FABRIC, FIT & CARE ACCORDION DETAILS */}
          <div className="space-y-4 border-t border-border pt-6 text-xs">
            {product.fabricNotes && (
              <div>
                <h3 className="font-semibold uppercase tracking-[0.18em] text-foreground">
                  Fabric &amp; Provenance
                </h3>
                <p className="mt-1 leading-relaxed text-muted-foreground">
                  {product.fabricNotes}
                </p>
              </div>
            )}
            {product.fitNotes && (
              <div>
                <h3 className="font-semibold uppercase tracking-[0.18em] text-foreground">
                  Silhouette &amp; Fit
                </h3>
                <p className="mt-1 leading-relaxed text-muted-foreground">
                  {product.fitNotes}
                </p>
              </div>
            )}
            {product.careNotes && (
              <div>
                <h3 className="font-semibold uppercase tracking-[0.18em] text-foreground">
                  Garment Care
                </h3>
                <p className="mt-1 leading-relaxed text-muted-foreground">
                  {product.careNotes}
                </p>
              </div>
            )}
            <div className="flex items-center gap-2 pt-2 text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-accent" />
              <span>
                Individually inspected &amp; steam-pressed in our Abuja Atelier.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* RELATED PIECES */}
      {product.relatedProducts.length > 0 && (
        <section className="mt-20 border-t border-border pt-14">
          <h2 className="font-serif text-2xl font-normal uppercase tracking-wide sm:text-3xl">
            Complete The Look
          </h2>
          <div className="mt-8">
            <ProductGrid
              items={product.relatedProducts}
              isLoading={false}
              isError={false}
              favoriteProductIds={favoriteProductIds}
              onToggleFavorite={handleToggleFavorite}
              onQuickAdd={handleQuickAdd}
            />
          </div>
        </section>
      )}

      {/* STICKY MOBILE ADD TO BAG BAR */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between border-t border-border bg-background px-4 py-3 lg:hidden">
        <div>
          <p className="line-clamp-1 font-serif text-sm font-medium">
            {product.name}
          </p>
          <Price
            amountMinor={product.effectivePriceMinor}
            originalAmountMinor={product.originalPriceMinor}
            currency={product.currency}
            size="sm"
          />
        </div>
        <Button size="default" disabled={isOutOfStock} onClick={handleAddToBag}>
          {isOutOfStock ? "Sold Out" : `Add (${activeVariant?.label ?? ""})`}
        </Button>
      </div>

      {/* SIZE GUIDE MODAL */}
      {product.sizeGuide && (
        <Dialog
          open={sizeGuideOpen}
          onOpenChange={setSizeGuideOpen}
          title={product.sizeGuide.name}
          description={product.sizeGuide.notesMarkdown}
          maxWidthClass="max-w-2xl"
        >
          <div className="border border-border bg-surface-elevated">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Size</TableHead>
                  <TableHead>Chest ({product.sizeGuide.unit})</TableHead>
                  <TableHead>Shoulder ({product.sizeGuide.unit})</TableHead>
                  <TableHead>Sleeve ({product.sizeGuide.unit})</TableHead>
                  <TableHead>Length ({product.sizeGuide.unit})</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {product.sizeGuide.measurements.map((m) => (
                  <TableRow key={m.size}>
                    <TableCell className="font-semibold">{m.size}</TableCell>
                    <TableCell>{m.chest}</TableCell>
                    <TableCell>{m.shoulder}</TableCell>
                    <TableCell>{m.sleeve}</TableCell>
                    <TableCell>{m.length}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Dialog>
      )}
    </div>
  );
}
