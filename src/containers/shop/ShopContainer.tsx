"use client";

import * as React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Search, SlidersHorizontal, Tag, X } from "lucide-react";
import { toast } from "sonner";
import { useProductsInfinite } from "@/services/products/products.hooks";
import { useCartStore } from "@/stores/cart.store";
import { useUiStore } from "@/stores/ui.store";
import { useDebounce } from "@/hooks/use-debounce";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { ProductGrid } from "@/components/modules/ProductGrid";
import type { QuickAddPayload } from "@/components/molecules/ProductCard";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function ShopContainer() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const initialCategory = searchParams.get("category") ?? undefined;
  const initialType = searchParams.get("type") as
    | "ready_to_wear"
    | "made_to_order"
    | null;
  const couponParam = searchParams.get("coupon");

  const [category, setCategory] = React.useState<string | undefined>(initialCategory);
  const [productType, setProductType] = React.useState<
    "ready_to_wear" | "made_to_order" | undefined
  >(initialType ?? undefined);
  const [sort, setSort] = React.useState<"newest" | "price_asc" | "price_desc">(
    "newest",
  );
  const [searchInput, setSearchInput] = React.useState("");
  const debouncedSearch = useDebounce(searchInput, 250);

  const setCouponCode = useCartStore((s) => s.setCouponCode);
  const activeCoupon = useCartStore((s) => s.couponCode);
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

  // Auto-apply shareable promo link (?coupon=CODE) per Section 11.7
  React.useEffect(() => {
    if (couponParam && couponParam.trim()) {
      const normalized = couponParam.trim().toUpperCase();
      setCouponCode(normalized);
      toast.success(`Coupon code ${normalized} saved to your shopping bag.`);
    }
  }, [couponParam, setCouponCode]);

  // Sync URL category param changes
  React.useEffect(() => {
    const cat = searchParams.get("category") ?? undefined;
    setCategory(cat);
  }, [searchParams]);

  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useProductsInfinite({
    category,
    type: productType,
    sort,
    q: debouncedSearch || undefined,
    limit: 12,
  });

  const sentinelRef = useInfiniteScroll({
    hasNextPage: Boolean(hasNextPage),
    isFetchingNextPage,
    onLoadMore: () => {
      void fetchNextPage();
    },
  });

  const items = data?.pages.flatMap((p) => p.items) ?? [];
  const categories = data?.pages[0]?.categories ?? [];

  const handleCategoryChange = (slug: string | undefined) => {
    setCategory(slug);
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set("category", slug);
    } else {
      params.delete("category");
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-8 sm:py-14">
      {/* HEADER */}
      <div className="border-b border-border pb-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-accent">
          FADÉ EXCLUSIVES CATALOG
        </p>
        <h1 className="mt-2 font-serif text-4xl font-normal uppercase tracking-wide sm:text-5xl">
          The 2026 Collection
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Explore ready-to-wear statement garments and made-to-order ceremonial
          pieces crafted in our Maitama, Abuja Atelier.
        </p>

        {activeCoupon && (
          <div className="mt-4 inline-flex items-center gap-2 border border-accent bg-surface px-3.5 py-1.5 text-xs">
            <Tag className="h-3.5 w-3.5 text-accent" />
            <span>
              Active bag coupon:{" "}
              <strong className="font-mono">{activeCoupon}</strong>
            </span>
            <button
              type="button"
              onClick={() => setCouponCode(null)}
              aria-label="Remove coupon"
              className="ml-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="mt-6 flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleCategoryChange(undefined)}
            className={cn(
              "min-h-[40px] border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition-colors",
              !category
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-surface-elevated text-foreground hover:border-foreground",
            )}
          >
            All Pieces
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryChange(cat.slug)}
              className={cn(
                "min-h-[40px] border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition-colors",
                category === cat.slug
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-surface-elevated text-foreground hover:border-foreground",
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search + Type + Sort */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search Agbada, Kaftan, Fila..."
              aria-label="Search pieces"
              className="pl-9 text-xs"
            />
          </div>

          <Select
            aria-label="Filter by garment type"
            size="compact"
            searchable={false}
            className="w-[180px]"
            value={productType ?? ""}
            onValueChange={(val) =>
              setProductType(
                val ? (val as "ready_to_wear" | "made_to_order") : undefined,
              )
            }
            options={[
              { value: "", label: "All Fulfillments" },
              { value: "ready_to_wear", label: "Ready-to-Wear" },
              { value: "made_to_order", label: "Made-to-Order" },
            ]}
          />

          <div className="inline-flex items-center gap-1.5">
            <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
            <Select
              aria-label="Sort pieces"
              size="compact"
              searchable={false}
              align="right"
              className="w-[190px]"
              value={sort}
              onValueChange={(val) =>
                setSort(val as "newest" | "price_asc" | "price_desc")
              }
              options={[
                { value: "newest", label: "Newest Arrivals" },
                { value: "price_asc", label: "Price: Low to High" },
                { value: "price_desc", label: "Price: High to Low" },
              ]}
            />
          </div>
        </div>
      </div>

      {/* PRODUCT GRID */}
      <div className="mt-8">
        <ProductGrid
          items={items}
          isLoading={isLoading}
          isError={isError}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={Boolean(hasNextPage)}
          onLoadMore={() => {
            void fetchNextPage();
          }}
          sentinelRef={sentinelRef}
          favoriteProductIds={favoriteProductIds}
          onToggleFavorite={handleToggleFavorite}
          onQuickAdd={handleQuickAdd}
          onResetFilters={() => {
            setCategory(undefined);
            setProductType(undefined);
            setSearchInput("");
            router.replace(pathname);
          }}
        />
      </div>
    </div>
  );
}
