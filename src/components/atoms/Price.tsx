import * as React from "react";
import { formatMinorCurrency } from "@/lib/format/money";
import { cn } from "@/lib/utils";

export interface PriceProps {
  amountMinor: number;
  originalAmountMinor?: number | null;
  currency?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  textClassName?: string;
}

export function Price({
  amountMinor,
  originalAmountMinor,
  currency = "NGN",
  size = "md",
  className,
  textClassName,
}: PriceProps) {
  const hasSale =
    originalAmountMinor !== null &&
    originalAmountMinor !== undefined &&
    originalAmountMinor > amountMinor;

  const textClasses =
    size === "lg"
      ? "text-xl md:text-2xl font-medium"
      : size === "sm"
        ? "text-xs font-medium"
        : "text-sm font-medium";

  return (
    <span className={cn("inline-flex flex-wrap items-baseline gap-2", className)}>
      <span className={cn(textClasses, hasSale ? "text-accent font-semibold" : "text-obsidian-foreground", textClassName)}>
        {formatMinorCurrency(amountMinor, currency)}
      </span>
      {hasSale && (
        <span className="text-xs text-muted-foreground line-through">
          {formatMinorCurrency(originalAmountMinor, currency)}
        </span>
      )}
    </span>
  );
}
