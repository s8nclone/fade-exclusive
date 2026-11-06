"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ColorSwatchProps {
  hex: string;
  label: string;
  selected?: boolean;
  onSelect: (hex: string) => void;
  className?: string;
}

export function ColorSwatch({
  hex,
  label,
  selected = false,
  onSelect,
  className,
}: ColorSwatchProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(hex)}
      title={`${label} (${hex})`}
      aria-label={`Select color ${label} (${hex})`}
      aria-pressed={selected}
      style={{ backgroundColor: hex }}
      className={cn(
        "relative inline-flex h-9 w-9 items-center justify-center border border-border transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer",
        selected && "ring-2 ring-accent ring-offset-2",
        className,
      )}
    >
      {selected && (
        <Check
          className={cn(
            "h-4 w-4",
            hex.toUpperCase() === "#F4F1EA" ||
              hex.toUpperCase() === "#EAE4D8" ||
              hex.toUpperCase() === "#FAF8F4"
              ? "text-obsidian"
              : "text-obsidian-foreground",
          )}
        />
      )}
    </button>
  );
}
