"use client";

import * as React from "react";
import { Combobox as ComboboxPrimitive } from "@base-ui-components/react/combobox";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SelectOption } from "./select";

/* ============================================================================
 * SHADCN / BASE-UI COMBOBOX PRIMITIVES
 * ========================================================================== */

const ComboboxRoot = ComboboxPrimitive.Root;
const ComboboxTrigger = ComboboxPrimitive.Trigger;
const ComboboxInput = ComboboxPrimitive.Input;
const ComboboxPortal = ComboboxPrimitive.Portal;
const ComboboxPositioner = ComboboxPrimitive.Positioner;
const ComboboxPopup = ComboboxPrimitive.Popup;
const ComboboxList = ComboboxPrimitive.List;
const ComboboxItem = ComboboxPrimitive.Item;
const ComboboxItemIndicator = ComboboxPrimitive.ItemIndicator;
const ComboboxEmpty = ComboboxPrimitive.Empty;
const ComboboxClear = ComboboxPrimitive.Clear;

export interface ComboboxProps {
  id?: string;
  name?: string;
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

/**
 * Shadcn Combobox component powered by `@base-ui-components/react/combobox`.
 * Provides type-ahead search filtering, keyboard navigation, and accessible ARIA combobox roles.
 */
export function Combobox({
  id,
  name,
  value,
  onValueChange,
  options,
  placeholder = "Search or select an option...",
  emptyMessage = "No matching option found.",
  disabled = false,
  className,
  "aria-label": ariaLabel,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: ComboboxProps) {
  const selectedOption = React.useMemo(
    () => options.find((opt) => opt.value === value) ?? null,
    [options, value],
  );

  return (
    <div className={cn("w-full", className)}>
      <ComboboxRoot<SelectOption | null>
        name={name}
        items={options}
        value={selectedOption}
        onValueChange={(next) => {
          onValueChange(next ? next.value : "");
        }}
        itemToStringLabel={(item) => (item ? item.label : "")}
        itemToStringValue={(item) => (item ? item.value : "")}
        isItemEqualToValue={(a, b) => a?.value === b?.value}
        disabled={disabled}
      >
        <div
          className={cn(
            "relative flex min-h-[44px] w-full items-center border bg-surface-elevated px-3 text-sm text-foreground transition-colors focus-within:border-accent focus-within:ring-1 focus-within:ring-accent",
            ariaInvalid
              ? "border-destructive"
              : "border-border hover:border-foreground/50",
            disabled && "cursor-not-allowed opacity-50",
          )}
        >
          <Search className="mr-2 h-3.5 w-3.5 shrink-0 text-accent" />
          <ComboboxInput
            id={id}
            placeholder={placeholder}
            aria-label={ariaLabel}
            aria-invalid={ariaInvalid}
            aria-describedby={ariaDescribedBy}
            className="w-full bg-transparent py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed"
          />
          {value && (
            <ComboboxClear
              aria-label="Clear selection"
              className="mr-1 inline-flex h-6 w-6 cursor-pointer items-center justify-center text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </ComboboxClear>
          )}
          <ComboboxTrigger
            aria-label="Toggle options"
            className="inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center text-accent hover:text-foreground"
          >
            <ChevronsUpDown className="h-4 w-4" />
          </ComboboxTrigger>
        </div>

        <ComboboxPortal>
          <ComboboxPositioner sideOffset={4} align="start" className="z-50 outline-none">
            <ComboboxPopup className="z-50 max-h-72 w-[var(--anchor-width)] overflow-y-auto border border-accent bg-surface-elevated p-1 text-foreground shadow-xl outline-none">
              <ComboboxEmpty className="px-3.5 py-3 text-center text-xs text-muted-foreground">
                {emptyMessage}
              </ComboboxEmpty>
              <ComboboxList className="divide-y divide-border/50">
                {(item: SelectOption) => (
                  <ComboboxItem
                    key={item.value}
                    value={item}
                    disabled={item.disabled}
                    className="relative flex w-full cursor-pointer select-none items-center justify-between gap-3 px-3.5 py-2.5 text-xs text-foreground outline-none transition-colors data-[highlighted]:bg-surface data-[selected]:bg-obsidian data-[selected]:font-semibold data-[selected]:text-obsidian-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate leading-snug">{item.label}</p>
                      {item.description && (
                        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <ComboboxItemIndicator className="flex shrink-0 items-center text-accent">
                      <Check className="h-3.5 w-3.5" />
                    </ComboboxItemIndicator>
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxPopup>
          </ComboboxPositioner>
        </ComboboxPortal>
      </ComboboxRoot>
    </div>
  );
}

export {
  ComboboxRoot,
  ComboboxTrigger,
  ComboboxInput,
  ComboboxPortal,
  ComboboxPositioner,
  ComboboxPopup,
  ComboboxList,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxEmpty,
  ComboboxClear,
};
