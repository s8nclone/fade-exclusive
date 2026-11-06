"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Lock, ArrowLeft, Clock } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/stores/cart.store";
import { useCartPreview } from "@/services/cart/cart.hooks";
import { usePublicSettings } from "@/services/settings/settings.hooks";
import { usePublicForm } from "@/services/forms/forms.hooks";
import { usePlaceOrderMutation } from "@/services/checkout/checkout.hooks";
import { Price } from "@/components/atoms/Price";
import { FormRenderer } from "@/components/modules/FormRenderer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/atoms/EmptyState";

export function CheckoutContainer() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const couponCode = useCartStore((s) => s.couponCode);
  const setCouponCode = useCartStore((s) => s.setCouponCode);
  const clearCart = useCartStore((s) => s.clearCart);

  const { data: settings } = usePublicSettings();
  const { data: extraForm } = usePublicForm("checkout-extra");
  const placeOrderMutation = usePlaceOrderMutation();

  const [shippingOptionId, setShippingOptionId] = React.useState<string>("ship-abuja");
  const [customerName, setCustomerName] = React.useState("");
  const [customerEmail, setCustomerEmail] = React.useState("");
  const [customerPhone, setCustomerPhone] = React.useState("");
  const [line1, setLine1] = React.useState("");
  const [line2, setLine2] = React.useState("");
  const [city, setCity] = React.useState("Abuja");
  const [stateRegion, setStateRegion] = React.useState("FCT");
  const [postalCode, setPostalCode] = React.useState("");
  const [country, setCountry] = React.useState("Nigeria");
  const [customerNotes, setCustomerNotes] = React.useState("");
  const [extraValues, setExtraValues] = React.useState<Record<string, unknown>>({});
  const [couponInput, setCouponInput] = React.useState(couponCode ?? "");
  const [idempotencyKey] = React.useState(
    () => `idem_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
  );

  React.useEffect(() => {
    if (settings?.shippingOptions?.[0] && !shippingOptionId) {
      setShippingOptionId(settings.shippingOptions[0].id);
    }
  }, [settings, shippingOptionId]);

  const { data: preview, isLoading: previewLoading } = useCartPreview({
    items: items.map((i) => ({ variantId: i.variantId, qty: i.qty })),
    couponCode: couponCode ?? undefined,
    shippingOptionId,
  });

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          title="Your Shopping Bag is Empty"
          description="Select pieces from the 2026 Fadé Exclusives collection before proceeding to checkout."
          actionLabel="Explore 2026 Pieces"
          actionHref="/shop"
        />
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerEmail || !customerPhone || !line1 || !city || !stateRegion) {
      toast.error("Please complete all required contact and delivery fields.");
      return;
    }

    placeOrderMutation.mutate(
      {
        items: items.map((i) => ({ variantId: i.variantId, qty: i.qty })),
        couponCode: couponCode ?? undefined,
        shippingOptionId,
        customerName,
        customerEmail,
        customerPhone,
        deliveryAddress: {
          line1,
          line2: line2 || undefined,
          city,
          state: stateRegion,
          postalCode: postalCode || undefined,
          country,
        },
        customerNotes: customerNotes || undefined,
        extraFields: extraValues,
        acceptedTerms: true,
        idempotencyKey,
        turnstileToken: "demo-turnstile-token",
      },
      {
        onSuccess: (res) => {
          clearCart();
          toast.success(
            `Order ${res.orderNumber} reserved! Redirecting to payment instructions...`,
          );
          router.push(`/order/${res.accessToken}`);
        },
      },
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-8 sm:py-14">
      <div className="mb-6">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Continue Shopping</span>
        </Link>
        <h1 className="mt-3 font-serif text-3xl font-normal uppercase sm:text-4xl">
          Guest Checkout &amp; Reservation
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          No account creation required. Your stock is reserved for 48 hours while
          you complete your direct bank transfer.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* LEFT COLUMN: GUEST FORM */}
        <div className="lg:col-span-7 space-y-8">
          {/* 1. Contact Info */}
          <section className="border border-border bg-surface-elevated p-6 space-y-4">
            <h2 className="font-serif text-xl font-normal uppercase">
              1. Client Contact Details
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor="chk-name"
                  className="text-xs font-semibold uppercase tracking-wider"
                >
                  Full Name *
                </label>
                <Input
                  id="chk-name"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Chief Tunde Bakare"
                  className="mt-1.5"
                />
              </div>
              <div>
                <label
                  htmlFor="chk-email"
                  className="text-xs font-semibold uppercase tracking-wider"
                >
                  Email Address *
                </label>
                <Input
                  id="chk-email"
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="client@example.com"
                  className="mt-1.5"
                />
              </div>
              <div>
                <label
                  htmlFor="chk-phone"
                  className="text-xs font-semibold uppercase tracking-wider"
                >
                  WhatsApp / Phone Number *
                </label>
                <Input
                  id="chk-phone"
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+234 803 123 4567"
                  className="mt-1.5"
                />
              </div>
            </div>
          </section>

          {/* 2. Delivery Address & Shipping */}
          <section className="border border-border bg-surface-elevated p-6 space-y-4">
            <h2 className="font-serif text-xl font-normal uppercase">
              2. Delivery Destination &amp; Courier
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor="chk-line1"
                  className="text-xs font-semibold uppercase tracking-wider"
                >
                  Street Address *
                </label>
                <Input
                  id="chk-line1"
                  required
                  value={line1}
                  onChange={(e) => setLine1(e.target.value)}
                  placeholder="Plot 1042, Ademola Adetokunbo Crescent, Maitama"
                  className="mt-1.5"
                />
              </div>
              <div className="sm:col-span-2">
                <label
                  htmlFor="chk-line2"
                  className="text-xs font-semibold uppercase tracking-wider"
                >
                  Apartment / Suite / Landmark (Optional)
                </label>
                <Input
                  id="chk-line2"
                  value={line2}
                  onChange={(e) => setLine2(e.target.value)}
                  placeholder="Penthouse B"
                  className="mt-1.5"
                />
              </div>
              <div>
                <label
                  htmlFor="chk-city"
                  className="text-xs font-semibold uppercase tracking-wider"
                >
                  City *
                </label>
                <Input
                  id="chk-city"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <label
                  htmlFor="chk-state"
                  className="text-xs font-semibold uppercase tracking-wider"
                >
                  State / Region *
                </label>
                <Input
                  id="chk-state"
                  required
                  value={stateRegion}
                  onChange={(e) => setStateRegion(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <label
                  htmlFor="chk-postal"
                  className="text-xs font-semibold uppercase tracking-wider"
                >
                  Postal Code
                </label>
                <Input
                  id="chk-postal"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <label
                  htmlFor="chk-country"
                  className="text-xs font-semibold uppercase tracking-wider"
                >
                  Country *
                </label>
                <Input
                  id="chk-country"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>

            {/* Shipping Options */}
            <div className="pt-3 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider">
                Select Delivery Method
              </p>
              <div className="space-y-2">
                {(settings?.shippingOptions ?? []).map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex cursor-pointer items-center justify-between border p-3.5 text-xs ${
                      shippingOptionId === opt.id
                        ? "border-primary bg-surface"
                        : "border-border bg-surface-elevated"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shippingOption"
                        value={opt.id}
                        checked={shippingOptionId === opt.id}
                        onChange={() => setShippingOptionId(opt.id)}
                        className="accent-primary"
                      />
                      <div>
                        <p className="font-semibold text-foreground">{opt.name}</p>
                        <p className="text-muted-foreground">{opt.eta}</p>
                      </div>
                    </div>
                    <Price amountMinor={opt.feeMinor} size="sm" />
                  </label>
                ))}
              </div>
            </div>
          </section>

          {/* 3. Dynamic Checkout Extra Fields (configured via Admin Form Builder) */}
          {extraForm && extraForm.fields.length > 0 && (
            <section className="border border-border bg-surface-elevated p-6 space-y-4">
              <h2 className="font-serif text-xl font-normal uppercase">
                3. {extraForm.title}
              </h2>
              <FormRenderer
                fields={extraForm.fields}
                values={extraValues}
                onChange={(k, v) => setExtraValues((prev) => ({ ...prev, [k]: v }))}
                embedded
              />
            </section>
          )}

          {/* 4. Order Notes */}
          <section className="border border-border bg-surface-elevated p-6 space-y-3">
            <label
              htmlFor="chk-notes"
              className="text-xs font-semibold uppercase tracking-wider"
            >
              Special Tailoring or Delivery Notes (Optional)
            </label>
            <Textarea
              id="chk-notes"
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
              placeholder="Share event dates, monogram requests, or gate delivery instructions..."
            />
          </section>
        </div>

        {/* RIGHT COLUMN: SERVER-AUTHORITATIVE ORDER SUMMARY */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 border border-border bg-surface p-6 space-y-6">
            <h2 className="font-serif text-2xl font-normal uppercase border-b border-border pb-3">
              Order Summary
            </h2>

            <ul className="divide-y divide-border">
              {(preview?.lines ?? []).map((line) => (
                <li key={line.variantId} className="flex justify-between gap-3 py-3 text-xs">
                  <div>
                    <p className="font-serif text-sm font-medium">{line.productName}</p>
                    <p className="text-muted-foreground">
                      Size: {line.variantLabel} × {line.qty}
                    </p>
                    {line.leadTimeDays && (
                      <p className="mt-0.5 text-[11px] text-accent">
                        Made-to-Order ({line.leadTimeDays} days)
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <Price
                      amountMinor={line.lineTotalMinor}
                      originalAmountMinor={
                        line.lineDiscountMinor > 0 ? line.lineSubtotalMinor : null
                      }
                      size="sm"
                    />
                  </div>
                </li>
              ))}
            </ul>

            {/* Coupon Code */}
            <div className="flex gap-2 border-t border-border pt-4">
              <Input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                placeholder="PROMO CODE"
                aria-label="Promo code"
                className="h-10 text-xs uppercase"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCouponCode(couponInput || null)}
              >
                Apply
              </Button>
            </div>
            {preview?.couponStatus &&
              preview.couponStatus.code &&
              !preview.couponStatus.valid && (
                <p className="text-xs text-destructive">
                  {preview.couponStatus.message}
                </p>
              )}

            {/* Totals Breakdown */}
            {preview && (
              <div className="space-y-2 border-t border-border pt-4 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <Price amountMinor={preview.subtotalMinor} size="sm" />
                </div>
                {preview.appliedDiscounts.map((d) => (
                  <div key={d.promotionId} className="flex justify-between text-success">
                    <span>
                      {d.name} {d.code ? `(${d.code})` : ""}
                    </span>
                    <span>
                      -<Price amountMinor={d.amountMinor} size="sm" className="text-success" />
                    </span>
                  </div>
                ))}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <Price amountMinor={preview.shippingEffectiveMinor} size="sm" />
                </div>
                <div className="flex justify-between border-t border-border pt-3 text-sm font-semibold">
                  <span>Order Total</span>
                  <Price amountMinor={preview.totalMinor} size="md" />
                </div>
                {preview.depositRequiredMinor < preview.totalMinor && (
                  <div className="mt-2 border border-accent/40 bg-surface-elevated p-3">
                    <div className="flex justify-between font-semibold text-accent">
                      <span>Minimum Atelier Deposit Due Now</span>
                      <Price amountMinor={preview.depositRequiredMinor} size="sm" />
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Includes 50% deposit on Made-to-Order garments. You may pay the
                      deposit or full amount via bank transfer on the next screen.
                    </p>
                  </div>
                )}
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={
                placeOrderMutation.isPending ||
                previewLoading ||
                Boolean(preview?.storePaused)
              }
            >
              {placeOrderMutation.isPending
                ? "Reserving Stock & Generating Reference..."
                : "Place Order & View Bank Details"}
            </Button>

            <div className="space-y-2 text-[11px] text-muted-foreground">
              <p className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-accent" />
                <span>Stock reserved for 48 hours upon order placement.</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-accent" />
                <span>
                  Direct Bank Transfer + instant WhatsApp receipt notification.
                </span>
              </p>
              <p className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-accent" />
                <span>Official printable receipt issued once verified.</span>
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
