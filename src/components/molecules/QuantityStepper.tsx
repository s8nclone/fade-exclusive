"use client";

import * as React from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface QuantityStepperProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (nextValue: number) => void;
  disabled?: boolean;
  className?: string;
}

export function QuantityStepper({
  value,
  min = 1,
  max = 20,
  onChange,
  disabled = false,
  className,
}: QuantityStepperProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center border border-border bg-surface-elevated",
        className,
      )}
    >
      <button
        type="button"
        disabled={disabled || value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        aria-label="Decrease quantity"
        className="inline-flex h-11 w-11 items-center justify-center text-foreground hover:bg-surface disabled:opacity-40 cursor-pointer"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span
        aria-live="polite"
        className="min-w-[40px] px-2 text-center text-sm font-medium text-foreground"
      >
        {value}
      </span>
      <button
        type="button"
        disabled={disabled || value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        aria-label="Increase quantity"
        className="inline-flex h-11 w-11 items-center justify-center text-foreground hover:bg-surface disabled:opacity-40 cursor-pointer"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
