"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useOrderLookupMutation } from "@/services/orders/orders.hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function OrderLookupContainer() {
  const router = useRouter();
  const lookupMutation = useOrderLookupMutation();
  const [orderNumber, setOrderNumber] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [notFoundMsg, setNotFoundMsg] = React.useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNotFoundMsg(null);
    lookupMutation.mutate(
      { orderNumber: orderNumber.trim().toUpperCase(), email: email.trim() },
      {
        onSuccess: (res) => {
          if (res.accessToken) {
            router.push(`/order/${res.accessToken}`);
          } else {
            setNotFoundMsg(
              "No matching order was found for that Order Number and Email.",
            );
          }
        },
        onError: () => {
          setNotFoundMsg(
            "No matching order was found for that Order Number and Email.",
          );
        },
      },
    );
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-8">
      <div className="border border-border bg-surface-elevated p-8 space-y-6">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-accent">
            GUEST ORDER TRACKING
          </p>
          <h1 className="mt-2 font-serif text-3xl font-normal uppercase">
            Track Your Order
          </h1>
          <p className="mt-2 text-xs text-muted-foreground">
            Enter your Order Number (e.g.,{" "}
            <strong className="font-mono text-foreground">FADE-2026-0001</strong>)
            and the email address used during checkout.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="lookup-order"
              className="text-xs font-semibold uppercase tracking-wider"
            >
              Order Number *
            </label>
            <Input
              id="lookup-order"
              required
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="FADE-2026-0001"
              className="mt-1.5 font-mono uppercase"
            />
          </div>

          <div>
            <label
              htmlFor="lookup-email"
              className="text-xs font-semibold uppercase tracking-wider"
            >
              Email Address *
            </label>
            <Input
              id="lookup-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tunde.bakare@example.com"
              className="mt-1.5"
            />
          </div>

          {notFoundMsg && (
            <p role="alert" className="text-xs font-medium text-destructive">
              {notFoundMsg}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full gap-2"
            disabled={lookupMutation.isPending}
          >
            <Search className="h-4 w-4" />
            <span>
              {lookupMutation.isPending ? "Locating Order..." : "View Order Status"}
            </span>
          </Button>
        </form>
      </div>
    </div>
  );
}