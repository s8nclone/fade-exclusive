"use client";

import * as React from "react";
import Link from "next/link";
import { Printer, ShieldCheck } from "lucide-react";
import { usePublicReceipt } from "@/services/orders/orders.hooks";
import { Price } from "@/components/atoms/Price";
import { Logo } from "@/components/atoms/Logo";
import { Button } from "@/components/ui/button";
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
import { formatDateTime } from "@/lib/format/date";

export function ReceiptContainer({ token }: { token: string }) {
  const { data: receipt, isLoading, isError, refetch } = usePublicReceipt(token);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Skeleton className="h-150 w-full" />
      </div>
    );
  }

  if (isError || !receipt) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <ErrorState
          title="Receipt Not Found"
          message="We could not verify this receipt token."
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-8">
      <div className="no-print mb-6 flex items-center justify-between">
        <Link
          href="/shop"
          className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          ← Return to Storefront
        </Link>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.print()}
          className="gap-2"
        >
          <Printer className="h-4 w-4" />
          <span>Print / Save as PDF</span>
        </Button>
      </div>

      {/* PRINTABLE OFFICIAL RECEIPT CARD */}
      <div className="border-2 border-foreground bg-surface-elevated p-8 sm:p-12 space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-6 border-b border-border pb-8">
          <div>
            <Logo variant="full" />
            <p className="mt-3 text-xs text-muted-foreground">
              {receipt.businessAddress}
            </p>
            <p className="text-xs text-muted-foreground">{receipt.businessEmail}</p>
          </div>

          <div className="text-right">
            <span className="inline-flex items-center gap-1.5 bg-success px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-success-foreground">
              <ShieldCheck className="h-3.5 w-3.5" /> Official Payment Receipt
            </span>
            <p className="mt-3 font-mono text-lg font-bold">
              {receipt.receiptNumber}
            </p>
            <p className="text-xs text-muted-foreground">
              Issued: {formatDateTime(receipt.issuedAt)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 border-b border-border pb-6 text-xs">
          <div>
            <p className="uppercase tracking-wider text-muted-foreground">
              Client
            </p>
            <p className="mt-1 font-semibold text-sm">{receipt.customerName}</p>
            <p className="text-muted-foreground">{receipt.customerEmail}</p>
          </div>
          <div>
            <p className="uppercase tracking-wider text-muted-foreground">
              Order &amp; Reference
            </p>
            <p className="mt-1 font-mono font-semibold">{receipt.orderNumber}</p>
            <p className="font-mono text-muted-foreground">
              Ref: {receipt.referenceCode}
            </p>
          </div>
          <div>
            <p className="uppercase tracking-wider text-muted-foreground">
              Payment Classification
            </p>
            <p className="mt-1 font-semibold uppercase">
              {receipt.paymentKind} Payment ({receipt.paymentMethod})
            </p>
            {receipt.bankReference && (
              <p className="text-muted-foreground">
                Bank Ref: {receipt.bankReference}
              </p>
            )}
          </div>
        </div>

        {/* Line Items */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Garment</TableHead>
              <TableHead>Size</TableHead>
              <TableHead className="text-center">Qty</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receipt.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-serif text-sm">
                  {item.productName}
                </TableCell>
                <TableCell>{item.variantLabel}</TableCell>
                <TableCell className="text-center">{item.qty}</TableCell>
                <TableCell className="text-right">
                  <Price
                    amountMinor={item.lineTotalMinor}
                    currency={receipt.currency}
                    size="sm"
                    textClassName="text-foreground"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Totals */}
        <div className="border-t border-border pt-6 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <Price amountMinor={receipt.shippingMinor} size="sm" textClassName="text-foreground" />
          </div>
          <div className="flex justify-between font-semibold">
            <span>Order Total</span>
            <Price amountMinor={receipt.orderTotalMinor} size="sm" textClassName="text-foreground" />
          </div>
          <div className="flex justify-between border-y border-border py-3 text-sm font-bold text-success">
            <span>Amount Confirmed on This Receipt</span>
            <Price
              amountMinor={receipt.amountConfirmedMinor}
              size="md"
              className="text-success"
              textClassName="text-foreground"
            />
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cumulative Paid to Date</span>
            <Price amountMinor={receipt.totalPaidMinor} size="sm" textClassName="text-foreground" />
          </div>
          <div className="flex justify-between font-semibold">
            <span>Remaining Balance</span>
            <Price amountMinor={receipt.balanceRemainingMinor} size="sm" textClassName="text-foreground" />
          </div>
        </div>

        <div className="border-t border-border pt-6 text-center text-[11px] text-muted-foreground">
          <p>
            Thank you for patronage of Fadé Exclusives. Each garment is crafted with
            heritage precision in Abuja, Nigeria.
          </p>
        </div>
      </div>
    </div>
  );
}