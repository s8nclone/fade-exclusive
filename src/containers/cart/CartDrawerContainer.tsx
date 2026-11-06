"use client";

import * as React from "react";
import Link from "next/link";
import {
  Trash2,
  Tag,
  X,
  AlertCircle,
  Eye,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { Price } from "@/components/atoms/Price";
import { QuantityStepper } from "@/components/molecules/QuantityStepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SheetDrawer } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMinorCurrency } from "@/lib/format/money";
import { useCartPreview } from "@/services/cart/cart.hooks";
import { useCartStore } from "@/stores/cart.store";
import { useUiStore } from "@/stores/ui.store";

export function CartBagContents({
  onNavigateCheckout,
}: {
  onNavigateCheckout?: () => void;
}) {
  const items = useCartStore((s) => s.items);
  const couponCode = useCartStore((s) => s.couponCode);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const changeVariant = useCartStore((s) => s.changeVariant);
  const removeItem = useCartStore((s) => s.removeItem);
  const setCouponCode = useCartStore((s) => s.setCouponCode);

  const [expandedVariantIds, setExpandedVariantIds] = React.useState<string[]>(
    [],
  );
  const [couponInput, setCouponInput] = React.useState(couponCode ?? "");

  React.useEffect(() => {
    setCouponInput(couponCode ?? "");
  }, [couponCode]);

  const toggleDetails = (variantId: string) => {
    setExpandedVariantIds((prev) =>
      prev.includes(variantId)
        ? prev.filter((id) => id !== variantId)
        : [...prev, variantId],
    );
  };

  const previewQuery = useCartPreview({
    items: items.map((i) => ({ variantId: i.variantId, qty: i.qty })),
    couponCode,
  });

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-accent">
          ATELIER BAG
        </p>
        <h3 className="mt-2 font-serif text-2xl font-normal text-foreground">
          Your shopping bag is empty
        </h3>
        <p className="mt-2 max-w-xs text-xs text-muted-foreground">
          Explore our 2026 Ready-to-Wear and Made-to-Order pieces or request a
          Custom Fit commission.
        </p>
        <Link
          href="/shop"
          onClick={onNavigateCheckout}
          className="mt-6 inline-flex min-h-[44px] items-center justify-center bg-primary px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary-foreground hover:bg-accent"
        >
          Explore Collection
        </Link>
      </div>
    );
  }

  const data = previewQuery.data;
  const currency = data?.currency ?? "NGN";

  return (
    <div className="flex flex-col space-y-6">
      {data?.hasMixedLeadTimes && (
        <div className="flex items-start gap-2.5 border border-accent/50 bg-surface p-3 text-xs text-foreground">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          <p>
            <strong>Mixed Dispatch Notice:</strong> Your bag combines
            Ready-to-Wear and Made-to-Order pieces. Estimated completion dates
            are shown per garment below.
          </p>
        </div>
      )}

      <ul className="divide-y divide-border">
        {data
          ? data.lines.map((line) => {
              const isExpanded = expandedVariantIds.includes(line.variantId);
              const variantChoices = line.variants ?? [];

              return (
                <li key={line.variantId} className="py-4 space-y-3">
                  <div className="flex gap-4">
                    {line.imageUrl && (
                      <Link
                        href={`/shop/${line.productSlug}`}
                        onClick={onNavigateCheckout}
                        className="shrink-0"
                      >
                        <img
                          src={line.imageUrl}
                          alt={line.productName}
                          className="h-24 w-20 border border-border bg-surface object-cover"
                        />
                      </Link>
                    )}

                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          {line.categoryName && (
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                              {line.categoryName}
                            </p>
                          )}
                          <Link
                            href={`/shop/${line.productSlug}`}
                            onClick={onNavigateCheckout}
                            className="font-serif text-base font-medium text-foreground hover:text-accent"
                          >
                            {line.productName}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            Size: <strong>{line.variantLabel}</strong> •{" "}
                            {line.productType === "made_to_order"
                              ? "Made to Order"
                              : "Ready to Wear"}
                          </p>
                          {line.estimatedReadyDate && (
                            <p className="mt-0.5 text-[11px] text-accent">
                              Ready: {line.estimatedReadyDate}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(line.variantId)}
                          aria-label={`Remove ${line.productName}`}
                          className="cursor-pointer p-1 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Edit Choice Controls: Size Selector + Quantity Stepper + Line Price */}
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          {variantChoices.length > 1 && (
                            <div className="w-[112px]">
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
                            max={line.availableStock ?? 20}
                            onChange={(nextQty) =>
                              updateQuantity(line.variantId, nextQty)
                            }
                          />
                        </div>

                        <Price
                          amountMinor={line.lineTotalMinor}
                          originalAmountMinor={
                            line.hasStrikeThrough
                              ? line.originalUnitPriceMinor * line.qty
                              : null
                          }
                          currency={currency}
                        />
                      </div>

                      {/* Intentional Actions: Toggle Quick Details + View Full Piece */}
                      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-2 text-[11px]">
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
                              <span>Garment Details &amp; Fit</span>
                            </>
                          )}
                        </button>

                        <Link
                          href={`/shop/${line.productSlug}`}
                          onClick={onNavigateCheckout}
                          className="inline-flex items-center gap-1 font-semibold uppercase tracking-[0.14em] text-accent underline underline-offset-4 hover:text-foreground"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View Full Piece</span>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Product Details Panel Inside the Bag */}
                  {isExpanded && (
                    <div className="border border-border bg-surface p-3.5 text-xs space-y-2">
                      {line.description && (
                        <p className="leading-relaxed text-foreground/90">
                          {line.description}
                        </p>
                      )}
                      {line.fabricNotes && (
                        <p className="text-[11px] text-muted-foreground">
                          <strong className="uppercase tracking-wider text-foreground">
                            Fabric:{" "}
                          </strong>
                          {line.fabricNotes}
                        </p>
                      )}
                      {line.fitNotes && (
                        <p className="text-[11px] text-muted-foreground">
                          <strong className="uppercase tracking-wider text-foreground">
                            Fit:{" "}
                          </strong>
                          {line.fitNotes}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2">
                        <span className="text-[11px] text-muted-foreground">
                          Unit Price:{" "}
                          <strong className="text-foreground">
                            {formatMinorCurrency(
                              line.effectiveUnitPriceMinor,
                              currency,
                            )}
                          </strong>
                        </span>
                        <Link
                          href={`/shop/${line.productSlug}`}
                          onClick={onNavigateCheckout}
                          className="inline-flex items-center gap-1 bg-obsidian px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-obsidian-foreground hover:bg-accent hover:text-accent-foreground"
                        >
                          <Eye className="h-3 w-3" />
                          <span>Open Full Product Page</span>
                        </Link>
                      </div>
                    </div>
                  )}
                </li>
              );
            })
          : items.map((item) => (
              <li key={item.variantId} className="py-4">
                <Skeleton className="h-24 w-full" />
              </li>
            ))}
      </ul>

      {/* Coupon Code Form (Non-optimistic server validation per Section 11.8) */}
      <div className="border-t border-border pt-4">
        <label
          htmlFor="cart-coupon-input"
          className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground"
        >
          Privilege or Coupon Code
        </label>
        <div className="mt-2 flex gap-2">
          <Input
            id="cart-coupon-input"
            placeholder="e.g. FADE10"
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
            className="uppercase"
          />
          <Button
            type="button"
            variant="outline"
            disabled={previewQuery.isFetching}
            onClick={() => setCouponCode(couponInput.trim() || null)}
          >
            {previewQuery.isFetching ? "Checking..." : "Apply"}
          </Button>
        </div>

        {couponCode && data?.couponStatus && (
          <div className="mt-2 flex items-center justify-between text-xs">
            <span
              className={
                data.couponStatus.valid
                  ? "font-medium text-success"
                  : "text-destructive"
              }
            >
              {data.couponStatus.message}
            </span>
            <button
              type="button"
              onClick={() => {
                setCouponInput("");
                setCouponCode(null);
              }}
              className="inline-flex cursor-pointer items-center gap-1 text-xs text-muted-foreground underline hover:text-foreground"
            >
              <X className="h-3 w-3" /> Remove
            </button>
          </div>
        )}

        {data?.stackingNote && (
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            {data.stackingNote}
          </p>
        )}
      </div>

      {/* Pricing Summary */}
      {data && (
        <div className="space-y-2 border-t border-border pt-4 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">
              {formatMinorCurrency(data.subtotalMinor, currency)}
            </span>
          </div>

          {data.appliedDiscounts.map((disc) => (
            <div
              key={disc.promotionId}
              className="flex justify-between font-medium text-accent"
            >
              <span className="inline-flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {disc.name} {disc.code ? `(${disc.code})` : ""}
              </span>
              <span>-{formatMinorCurrency(disc.amountMinor, currency)}</span>
            </div>
          ))}

          <div className="flex justify-between border-t border-border pt-3 text-sm font-semibold">
            <span>Estimated Total</span>
            <span>{formatMinorCurrency(data.totalMinor, currency)}</span>
          </div>

          {data.depositRequiredMinor < data.totalMinor && (
            <div className="flex justify-between text-xs text-accent">
              <span>Made-to-Order Deposit Due at Checkout</span>
              <span className="font-semibold">
                {formatMinorCurrency(data.depositRequiredMinor, currency)}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="pt-2">
        {data?.storePaused ? (
          <p className="border border-warning bg-surface p-3 text-center text-xs text-foreground">
            {data.storePausedMessage}
          </p>
        ) : (
          <Link
            href="/checkout"
            onClick={onNavigateCheckout}
            data-testid="proceed-to-checkout-link"
            className="flex min-h-[48px] w-full items-center justify-center bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground hover:bg-accent"
          >
            Proceed to Guest Checkout
          </Link>
        )}
      </div>
    </div>
  );
}

export function CartDrawerContainer() {
  const isOpen = useUiStore((s) => s.isCartDrawerOpen);
  const setOpen = useUiStore((s) => s.setCartDrawerOpen);

  return (
    <SheetDrawer
      open={isOpen}
      onOpenChange={setOpen}
      side="right"
      title="Shopping Bag"
      subtitle="Inspect details, edit sizes, or proceed to reservation"
    >
      <CartBagContents onNavigateCheckout={() => setOpen(false)} />
    </SheetDrawer>
  );
}
