"use client";

import * as React from "react";
import Link from "next/link";
import { Trash2, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import {
  usePublicContentPage,
  usePublicPress,
} from "@/services/content/content.hooks";
import { useCartStore } from "@/stores/cart.store";
import { useCartPreview } from "@/services/cart/cart.hooks";
import { PressCard } from "@/components/molecules/PressCard";
import { Price } from "@/components/atoms/Price";
import { QuantityStepper } from "@/components/molecules/QuantityStepper";
import { EmptyState } from "@/components/atoms/EmptyState";
import {
  DataTable,
  type DataTableColumnDef,
} from "@/components/modules/DataTable";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export function PressContainer() {
  const { data: pressItems = [], isLoading } = usePublicPress();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8 sm:py-16">
      <div className="border-b border-border pb-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-accent">
          CULTURAL RECOGNITION
        </p>
        <h1 className="mt-2 font-serif text-4xl font-normal uppercase sm:text-5xl">
          Press &amp; Editorial Archive
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Selected global features, runway reviews, and cultural commentary on
          Fadé Exclusives.
        </p>
      </div>

      {isLoading ? (
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {pressItems.map((item) => (
            <PressCard key={item.id} {...item} />
          ))}
        </div>
      )}
    </div>
  );
}

export function ContentPageContainer({ slug }: { slug: string }) {
  const { data: page, isLoading } = usePublicContentPage(slug);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 space-y-4">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <EmptyState
          title="Page Not Found"
          description="The requested editorial or policy document could not be found."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-8 sm:py-16">
      <div className="border-b border-border pb-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-accent">
          FADÉ EXCLUSIVES ATELIER
        </p>
        <h1 className="mt-2 font-serif text-4xl font-normal uppercase sm:text-5xl">
          {page.title}
        </h1>
        {page.subtitle && (
          <p className="mt-2 font-serif text-xl italic text-muted-foreground">
            {page.subtitle}
          </p>
        )}
      </div>

      <div className="mt-8 space-y-6">
        <div className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">
          {page.bodyMarkdown}
        </div>
      </div>
    </div>
  );
}

interface SizeGuideRow {
  size: string;
  chest: string;
  shoulder: string;
  sleeve: string;
  length: string;
  waist: string;
}

const SIZE_GUIDE_ROWS: SizeGuideRow[] = [
  {
    size: "S (38)",
    chest: "96 cm / 38 in",
    shoulder: "45 cm / 17.7 in",
    sleeve: "63 cm / 24.8 in",
    length: "86 cm",
    waist: "81 cm / 32 in",
  },
  {
    size: "M (40)",
    chest: "102 cm / 40 in",
    shoulder: "47 cm / 18.5 in",
    sleeve: "64 cm / 25.2 in",
    length: "88 cm",
    waist: "86 cm / 34 in",
  },
  {
    size: "L (42)",
    chest: "108 cm / 42.5 in",
    shoulder: "49 cm / 19.3 in",
    sleeve: "65 cm / 25.6 in",
    length: "90 cm",
    waist: "91 cm / 36 in",
  },
  {
    size: "XL (44)",
    chest: "114 cm / 45 in",
    shoulder: "51 cm / 20.1 in",
    sleeve: "66 cm / 26 in",
    length: "92 cm",
    waist: "97 cm / 38 in",
  },
  {
    size: "XXL (46)",
    chest: "120 cm / 47 in",
    shoulder: "53 cm / 20.8 in",
    sleeve: "67 cm / 26.4 in",
    length: "94 cm",
    waist: "102 cm / 40 in",
  },
];

const SIZE_GUIDE_COLUMNS: DataTableColumnDef<SizeGuideRow>[] = [
  {
    accessorKey: "size",
    header: "Size",
    cell: ({ row }) => (
      <span className="font-semibold text-foreground">{row.original.size}</span>
    ),
  },
  {
    accessorKey: "chest",
    header: "Chest (cm / in)",
  },
  {
    accessorKey: "shoulder",
    header: "Shoulder (cm / in)",
  },
  {
    accessorKey: "sleeve",
    header: "Sleeve (cm / in)",
  },
  {
    accessorKey: "length",
    header: "Tunic Length (cm)",
  },
  {
    accessorKey: "waist",
    header: "Trouser Waist (cm / in)",
  },
];

export function SizeGuidePageContainer() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-8 sm:py-16 space-y-10">
      <div className="border-b border-border pb-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-accent">
          ARCHITECTURAL PROPORTIONS
        </p>
        <h1 className="mt-2 font-serif text-4xl font-normal uppercase sm:text-5xl">
          Size &amp; Fit Guide
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Our Agbadas, Kaftans, and Senator Sets are cut for a regal, structured
          drape. Review our standard measurements below or request a bespoke
          Custom Fit.
        </p>
      </div>

      <DataTable columns={SIZE_GUIDE_COLUMNS} data={SIZE_GUIDE_ROWS} />

      <div className="flex flex-wrap items-center justify-between gap-6 border border-border bg-obsidian p-8 text-obsidian-foreground">
        <div>
          <h2 className="font-serif text-2xl font-normal uppercase">
            Prefer Bespoke Measurements?
          </h2>
          <p className="mt-1 text-xs text-obsidian-foreground/80">
            Submit your individual chest, shoulder, sleeve, and height
            measurements for a custom-cut garment.
          </p>
        </div>
        <Link
          href="/custom-fit"
          className="inline-flex min-h-[44px] items-center justify-center bg-accent px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-accent-foreground"
        >
          Open Custom Fit Form
        </Link>
      </div>
    </div>
  );
}

export function CartPageContainer() {
  const items = useCartStore((s) => s.items);
  const couponCode = useCartStore((s) => s.couponCode);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const changeVariant = useCartStore((s) => s.changeVariant);
  const removeItem = useCartStore((s) => s.removeItem);

  const [expandedVariantIds, setExpandedVariantIds] = React.useState<string[]>(
    [],
  );

  const toggleDetails = (variantId: string) => {
    setExpandedVariantIds((prev) =>
      prev.includes(variantId)
        ? prev.filter((id) => id !== variantId)
        : [...prev, variantId],
    );
  };

  const { data: preview } = useCartPreview({
    items: items.map((i) => ({ variantId: i.variantId, qty: i.qty })),
    couponCode: couponCode ?? undefined,
  });

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <EmptyState
          title="Your Shopping Bag is Empty"
          description="Explore our 2026 Agbadas, Senator Sets, and Kaftans to begin your reservation."
          actionLabel="Explore 2026 Collection"
          actionHref="/shop"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-8">
      <h1 className="border-b border-border pb-6 font-serif text-3xl font-normal uppercase sm:text-4xl">
        Your Shopping Bag
      </h1>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="divide-y divide-border border border-border bg-surface-elevated p-6 lg:col-span-8">
          {(preview?.lines ?? []).map((line) => {
            const isExpanded = expandedVariantIds.includes(line.variantId);
            const variantChoices = line.variants ?? [];

            return (
              <div key={line.variantId} className="space-y-3 py-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-4">
                    {line.imageUrl && (
                      <Link href={`/shop/${line.productSlug}`} className="shrink-0">
                        <img
                          src={line.imageUrl}
                          alt={line.productName}
                          className="h-28 w-22 border border-border object-cover"
                        />
                      </Link>
                    )}
                    <div className="space-y-1">
                      {line.categoryName && (
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          {line.categoryName}
                        </p>
                      )}
                      <Link
                        href={`/shop/${line.productSlug}`}
                        className="font-serif text-lg font-medium hover:text-accent"
                      >
                        {line.productName}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        Selected Size: <strong>{line.variantLabel}</strong> •{" "}
                        {line.productType === "made_to_order"
                          ? "Made to Order"
                          : "Ready to Wear"}
                      </p>
                      <Price
                        amountMinor={line.effectiveUnitPriceMinor}
                        originalAmountMinor={
                          line.effectiveUnitPriceMinor < line.unitPriceMinor
                            ? line.unitPriceMinor
                            : null
                        }
                        size="sm"
                        className="mt-1"
                      />

                      <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px]">
                        <button
                          type="button"
                          onClick={() => toggleDetails(line.variantId)}
                          className="inline-flex cursor-pointer items-center gap-1 font-semibold uppercase tracking-[0.14em] text-foreground hover:text-accent"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="h-3.5 w-3.5 text-accent" />
                              <span>Hide Details</span>
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-3.5 w-3.5 text-accent" />
                              <span>Inspect Garment Details</span>
                            </>
                          )}
                        </button>

                        <Link
                          href={`/shop/${line.productSlug}`}
                          className="inline-flex items-center gap-1 font-semibold uppercase tracking-[0.14em] text-accent underline underline-offset-4 hover:text-foreground"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View Product Page</span>
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
                    {variantChoices.length > 1 && (
                      <div className="w-[124px]">
                        <Select
                          aria-label={`Change size for ${line.productName}`}
                          size="sm"
                          value={line.variantId}
                          onValueChange={(nextVarId) => {
                            const matched = variantChoices.find(
                              (v) => v.id === nextVarId,
                            );
                            changeVariant(
                              line.variantId,
                              nextVarId,
                              matched?.label,
                            );
                            if (matched) {
                              toast.success(
                                `Updated ${line.productName} to size ${matched.label}.`,
                              );
                            }
                          }}
                          options={variantChoices.map((v) => ({
                            value: v.id,
                            label: `Size: ${v.label}${
                              !v.available ? " (Out)" : ""
                            }`,
                            disabled: !v.available,
                          }))}
                        />
                      </div>
                    )}

                    <QuantityStepper
                      value={line.qty}
                      onChange={(next) => updateQuantity(line.variantId, next)}
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(line.variantId)}
                      aria-label="Remove item"
                      className="cursor-pointer p-2 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border border-border bg-surface p-4 text-xs space-y-2">
                    {line.description && (
                      <p className="leading-relaxed text-foreground/90">
                        {line.description}
                      </p>
                    )}
                    {line.fabricNotes && (
                      <p className="text-[11px] text-muted-foreground">
                        <strong className="uppercase tracking-wider text-foreground">
                          Fabric &amp; Provenance:{" "}
                        </strong>
                        {line.fabricNotes}
                      </p>
                    )}
                    {line.fitNotes && (
                      <p className="text-[11px] text-muted-foreground">
                        <strong className="uppercase tracking-wider text-foreground">
                          Silhouette &amp; Fit:{" "}
                        </strong>
                        {line.fitNotes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-4">
          <div className="space-y-4 border border-border bg-surface p-6">
            <h2 className="border-b border-border pb-3 font-serif text-xl uppercase">
              Bag Summary
            </h2>
            {preview && (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <Price amountMinor={preview.subtotalMinor} size="sm" />
                </div>
                {preview.discountTotalMinor > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Discounts</span>
                    <span>
                      -<Price amountMinor={preview.discountTotalMinor} size="sm" />
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t border-border pt-3 text-sm font-semibold">
                  <span>Estimated Total</span>
                  <Price amountMinor={preview.totalMinor} size="md" />
                </div>
              </div>
            )}
            <Link
              href="/checkout"
              className="flex min-h-[48px] w-full items-center justify-center bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground hover:opacity-90"
            >
              Proceed to Guest Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
