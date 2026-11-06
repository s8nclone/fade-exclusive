import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS_LABELS, CUSTOM_REQUEST_STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export interface StatusBadgeProps {
  status: string;
  kind?: "order" | "availability" | "custom_request";
  className?: string;
}

export function StatusBadge({
  status,
  kind = "order",
  className,
}: StatusBadgeProps) {
  if (kind === "availability") {
    switch (status) {
      case "in_stock":
        return (
          <Badge variant="secondary" className={cn(className)}>
            Ready to Ship
          </Badge>
        );
      case "low_stock":
        return (
          <Badge variant="warning" className={cn(className)}>
            Low Stock
          </Badge>
        );
      case "made_to_order":
        return (
          <Badge variant="accent" className={cn(className)}>
            Made to Order
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className={cn("opacity-60", className)}>
            Sold Out
          </Badge>
        );
    }
  }

  if (kind === "custom_request") {
    const label = CUSTOM_REQUEST_STATUS_LABELS[status] ?? status;
    const variant =
      status === "quoted" || status === "accepted"
        ? "accent"
        : status === "delivered" || status === "ready"
          ? "success"
          : status === "declined" || status === "cancelled"
            ? "destructive"
            : "secondary";
    return (
      <Badge variant={variant} className={cn(className)}>
        {label}
      </Badge>
    );
  }

  const label = ORDER_STATUS_LABELS[status] ?? status;
  const variant =
    status === "paid" || status === "delivered" || status === "ready"
      ? "success"
      : status === "payment_submitted" || status === "deposit_paid"
        ? "accent"
        : status === "awaiting_payment" || status === "in_production"
          ? "warning"
          : status === "cancelled" || status === "expired" || status === "refunded"
            ? "destructive"
            : "secondary";

  return (
    <Badge variant={variant} className={cn(className)}>
      {label}
    </Badge>
  );
}
