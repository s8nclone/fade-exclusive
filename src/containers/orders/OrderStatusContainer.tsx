"use client";

import * as React from "react";
import Link from "next/link";
import {
  MessageCircle,
  CheckCircle2,
  Clock,
  FileText,
  Landmark,
} from "lucide-react";
import {
  usePublicOrder,
  useMarkPaymentSubmittedMutation,
} from "@/services/orders/orders.hooks";
import { Price } from "@/components/atoms/Price";
import { StatusBadge } from "@/components/atoms/StatusBadge";
import { CopyButton } from "@/components/atoms/CopyButton";
import { OrderStatusTimeline } from "@/components/modules/OrderStatusTimeline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorState } from "@/components/atoms/ErrorState";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRemainingWindow } from "@/lib/format/date";

export function OrderStatusContainer({ token }: { token: string }) {
  const { data: order, isLoading, isError, refetch } = usePublicOrder(token);
  const markPaidMutation = useMarkPaymentSubmittedMutation(token);
  const [transferNote, setTransferNote] = React.useState("");

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-8 space-y-6">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <ErrorState
          title="Order Not Found"
          message="This order token is invalid or has expired. Try looking up your order with your Order Number and Email."
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  const windowInfo = formatRemainingWindow(order.paymentDueAt);
  const canNotifyPayment =
    order.status === "awaiting_payment" || order.status === "pending_payment";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8 sm:py-14 space-y-10">
      {/* HEADER SUMMARY BANNER */}
      <div className="border border-border bg-obsidian p-6 text-obsidian-foreground sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-obsidian-foreground/20 pb-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-accent">
              ATELIER ORDER &amp; PAYMENT INSTRUCTIONS
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h1 className="font-serif text-3xl font-normal sm:text-4xl">
                {order.orderNumber}
              </h1>
              <CopyButton value={order.orderNumber} label="Copy Order #" />
              <StatusBadge status={order.status} />
            </div>
          </div>

          {order.latestReceiptToken && (
            <Link
              href={`/receipt/${order.latestReceiptToken}`}
              className="inline-flex min-h-11 items-center gap-2 bg-accent px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-accent-foreground"
            >
              <FileText className="h-4 w-4" />
              <span>View Official Receipt</span>
            </Link>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 text-xs">
          <div>
            <p className="uppercase tracking-wider text-obsidian-foreground/70">
              Payment Reference Code
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <span className="font-mono text-base font-bold text-accent">
                {order.referenceCode}
              </span>
              <CopyButton value={order.referenceCode} label="Copy Ref" />
            </div>
            <p className="mt-1 text-[11px] text-obsidian-foreground/70">
              Include this exact code in your bank transfer narration.
            </p>
          </div>

          <div>
            <p className="uppercase tracking-wider text-obsidian-foreground/70">
              Total / Amount Due
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <Price
                amountMinor={order.amountDueMinor}
                currency={order.currency}
                size="md"
                className="text-obsidian-foreground"
              />
              <CopyButton
                value={String(Math.round(order.amountDueMinor / 100))}
                label="Copy Amount"
              />
            </div>
            {order.depositRequiredMinor < order.totalMinor && (
              <p className="mt-1 text-[11px] text-accent">
                Minimum Deposit:{" "}
                <Price
                  amountMinor={order.depositRequiredMinor}
                  currency={order.currency}
                  size="sm"
                  className="text-accent"
                />
              </p>
            )}
          </div>

          <div>
            <p className="uppercase tracking-wider text-obsidian-foreground/70">
              Reservation Window
            </p>
            <p className="mt-1.5 flex items-center gap-1.5 font-medium">
              <Clock className="h-4 w-4 text-accent" />
              <span>{windowInfo.label}</span>
            </p>
          </div>

          <div>
            <p className="uppercase tracking-wider text-obsidian-foreground/70">
              Client &amp; Destination
            </p>
            <p className="mt-1.5 font-medium">{order.customerName}</p>
            <p className="text-obsidian-foreground/75">{order.deliveryCityState}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* LEFT COLUMN: BANK DETAILS + WHATSAPP RECEIPT CTA */}
        <div className="lg:col-span-7 space-y-8">
          <section className="border border-border bg-surface-elevated p-6 space-y-5">
            <div className="flex items-center gap-2.5 border-b border-border pb-4">
              <Landmark className="h-5 w-5 text-accent" />
              <h2 className="font-serif text-2xl font-normal uppercase">
                Step 1: Direct Bank Transfer Details
              </h2>
            </div>

            <div className="space-y-4">
              {order.bankAccounts.map((bank) => (
                <div
                  key={bank.id}
                  className="border border-border bg-surface p-5 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                      {bank.label}
                    </span>
                    <span className="text-xs font-semibold">{bank.bankName}</span>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Account Name</p>
                      <p className="mt-0.5 font-semibold text-sm">
                        {bank.accountName}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Account Number</p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2">
                        <span className="font-mono text-base font-bold">
                          {bank.accountNumber}
                        </span>
                        <CopyButton
                          value={bank.accountNumber}
                          label="Copy Account #"
                        />
                      </div>
                    </div>
                  </div>
                  {bank.instructions && (
                    <p className="text-xs text-muted-foreground border-t border-border pt-2">
                      {bank.instructions}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* STEP 2: SEND RECEIPT VIA WHATSAPP + NOTIFY ATELIER */}
          <section className="border border-border bg-surface-elevated p-6 space-y-5">
            <div className="flex items-center gap-2.5 border-b border-border pb-4">
              <MessageCircle className="h-5 w-5 text-accent" />
              <h2 className="font-serif text-2xl font-normal uppercase">
                Step 2: Send Payment Receipt on WhatsApp
              </h2>
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground">
              After completing your transfer with narration{" "}
              <strong className="font-mono text-foreground">
                {order.referenceCode}
              </strong>
              , click below to open WhatsApp with your order details pre-filled and
              attach your transfer receipt screenshot.
            </p>

            <div className="flex flex-wrap gap-4">
              <a
                href={order.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground hover:opacity-90"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Send Payment Receipt on WhatsApp</span>
              </a>
            </div>

            {canNotifyPayment && (
              <div className="border-t border-border pt-5 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider">
                  Or Notify Our Concierge Directly Here:
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Input
                    value={transferNote}
                    onChange={(e) => setTransferNote(e.target.value)}
                    placeholder="Optional: Sender bank name or session ID..."
                    className="flex-1 text-xs"
                  />
                  <Button
                    type="button"
                    variant="accent"
                    disabled={markPaidMutation.isPending}
                    onClick={() =>
                      markPaidMutation.mutate({
                        note:
                          transferNote ||
                          "Customer clicked 'I've sent the payment' on order page.",
                      })
                    }
                  >
                    <CheckCircle2 className="mr-1.5 h-4 w-4" />
                    {markPaidMutation.isPending
                      ? "Notifying..."
                      : "I've Sent The Payment"}
                  </Button>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* RIGHT COLUMN: STATUS TIMELINE & ITEMS */}
        <div className="lg:col-span-5 space-y-8">
          <section className="border border-border bg-surface p-6 space-y-4">
            <h2 className="font-serif text-xl font-normal uppercase border-b border-border pb-3">
              Order Progress
            </h2>
            <OrderStatusTimeline
              currentStatus={order.status}
              history={order.history}
            />
          </section>

          <section className="border border-border bg-surface p-6 space-y-4">
            <h2 className="font-serif text-xl font-normal uppercase border-b border-border pb-3">
              Reserved Garments
            </h2>
            <ul className="divide-y divide-border text-xs">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between py-3">
                  <div>
                    <p className="font-serif text-sm font-medium">
                      {item.productName}
                    </p>
                    <p className="text-muted-foreground">
                      Size: {item.variantLabel} × {item.qty}
                    </p>
                  </div>
                  <Price
                    amountMinor={item.lineTotalMinor}
                    currency={order.currency}
                    size="sm"
                    textClassName="text-foreground"
                  />
                </li>
              ))}
            </ul>
            <div className="space-y-1.5 border-t border-border pt-3 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <Price amountMinor={order.subtotalMinor} size="sm" textClassName="text-foreground" />
              </div>
              {order.discountTotalMinor > 0 && (
                <div className="flex justify-between text-success">
                  <span>Discounts</span>
                  <span>
                    -<Price amountMinor={order.discountTotalMinor} size="sm" textClassName="text-foreground" />
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Shipping ({order.shippingOption.name})
                </span>
                <Price amountMinor={order.shippingMinor} size="sm" textClassName="text-foreground" />
              </div>
              <div className="flex justify-between border-t border-border pt-2 font-semibold text-sm">
                <span>Total</span>
                <Price amountMinor={order.totalMinor} size="md" textClassName="text-foreground" />
              </div>
              <div className="flex justify-between text-success">
                <span>Confirmed Paid</span>
                <Price amountMinor={order.amountPaidMinor} size="sm" textClassName="text-foreground" />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}