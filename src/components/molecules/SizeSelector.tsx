"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SizeOptionItem {
  id: string;
  label: string;
  availability: "in_stock" | "low_stock" | "out_of_stock" | "made_to_order";
}

export interface SizeSelectorProps {
  options: SizeOptionItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  className?: string;
}

export function SizeSelector({
  options,
  selectedId,
  onSelect,
  className,
}: SizeSelectorProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Select size or variant"
      className={cn("grid grid-cols-2 gap-2.5 sm:grid-cols-3", className)}
    >
      {options.map((opt) => {
        const isOut = opt.availability === "out_of_stock";
        const isSelected = opt.id === selectedId;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={isOut}
            onClick={() => onSelect(opt.id)}
            className={cn(
              "flex min-h-[48px] flex-col items-center justify-center border px-3 py-2 text-xs font-medium transition-colors cursor-pointer",
              isSelected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-surface-elevated text-foreground hover:border-foreground",
              isOut && "cursor-not-allowed opacity-40 line-through",
            )}
          >
            <span>{opt.label}</span>
            {opt.availability === "low_stock" && (
              <span
                className={cn(
                  "text-[10px]",
                  isSelected ? "text-accent-foreground" : "text-warning",
                )}
              >
                Few Left
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
