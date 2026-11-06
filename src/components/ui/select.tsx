"use client";

import * as React from "react";
import { Select as SelectPrimitive } from "@base-ui-components/react/select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

/* ============================================================================
 * SHADCN / BASE-UI SELECT PRIMITIVES
 * ========================================================================== */

const SelectRoot = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;

const SelectValue = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Value> & {
    placeholder?: string;
  }
>(({ className, placeholder, children, ...props }, ref) => (
  <SelectPrimitive.Value
    ref={ref}
    className={cn("truncate", className)}
    {...props}
  >
    {children ??
      ((val: unknown) => {
        if (val === null || val === undefined || val === "") {
          return (
            <span className="text-muted-foreground">
              {placeholder ?? "Select..."}
            </span>
          );
        }
        return String(val);
      })}
  </SelectPrimitive.Value>
));
SelectValue.displayName = "SelectValue";

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & {
    size?: "default" | "sm" | "compact";
  }
>(({ className, size = "default", children, ...props }, ref) => {
  const sizeClasses =
    size === "compact"
      ? "min-h-[44px] px-3 py-1.5 text-xs font-semibold uppercase tracking-wider"
      : size === "sm"
        ? "min-h-[38px] px-3 py-1.5 text-xs font-medium"
        : "min-h-[44px] px-3.5 py-2 text-sm";

  return (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex w-full cursor-pointer items-center justify-between gap-2.5 border border-border bg-surface-elevated text-left text-foreground transition-colors hover:border-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[popup-open]:border-accent data-[popup-open]:ring-1 data-[popup-open]:ring-accent disabled:cursor-not-allowed disabled:opacity-50",
        sizeClasses,
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon className="flex shrink-0 items-center text-accent">
        <ChevronDown className="h-4 w-4 transition-transform duration-150" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
});
SelectTrigger.displayName = "SelectTrigger";

const SelectScrollUpButton = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpArrow>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpArrow
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center bg-surface py-1 text-accent",
      className,
    )}
    {...props}
  >
    <ChevronUp className="h-3.5 w-3.5" />
  </SelectPrimitive.ScrollUpArrow>
));
SelectScrollUpButton.displayName = "SelectScrollUpButton";

const SelectScrollDownButton = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownArrow>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownArrow
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center bg-surface py-1 text-accent",
      className,
    )}
    {...props}
  >
    <ChevronDown className="h-3.5 w-3.5" />
  </SelectPrimitive.ScrollDownArrow>
));
SelectScrollDownButton.displayName = "SelectScrollDownButton";

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Popup> & {
    align?: "start" | "center" | "end";
    sideOffset?: number;
  }
>(({ className, children, align = "start", sideOffset = 4, ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Positioner
      sideOffset={sideOffset}
      align={align}
      alignItemWithTrigger={false}
      className="z-50 outline-none"
    >
      <SelectPrimitive.Popup
        ref={ref}
        className={cn(
          "z-50 max-h-72 min-w-[var(--anchor-width)] overflow-y-auto border border-accent bg-surface-elevated p-1 text-foreground shadow-xl outline-none",
          className,
        )}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.List className="divide-y divide-border/50">
          {children}
        </SelectPrimitive.List>
        <SelectScrollDownButton />
      </SelectPrimitive.Popup>
    </SelectPrimitive.Positioner>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = "SelectContent";

const SelectLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.GroupLabel>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.GroupLabel
    ref={ref}
    className={cn(
      "px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground",
      className,
    )}
    {...props}
  />
));
SelectLabel.displayName = "SelectLabel";

const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-pointer select-none items-center justify-between gap-3 px-3.5 py-2.5 text-xs text-foreground outline-none transition-colors data-[highlighted]:bg-surface data-[selected]:bg-obsidian data-[selected]:font-semibold data-[selected]:text-obsidian-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    {...props}
  >
    <SelectPrimitive.ItemText className="truncate leading-snug">
      {children}
    </SelectPrimitive.ItemText>
    <SelectPrimitive.ItemIndicator className="flex shrink-0 items-center text-accent">
      <Check className="h-3.5 w-3.5" />
    </SelectPrimitive.ItemIndicator>
  </SelectPrimitive.Item>
));
SelectItem.displayName = "SelectItem";

const SelectSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-border", className)}
    {...props}
  />
));
SelectSeparator.displayName = "SelectSeparator";

/* ============================================================================
 * HIGH-LEVEL SHADCN SELECT WRAPPER FOR OPTIONS ARRAYS
 * ========================================================================== */

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface SelectProps {
  id?: string;
  name?: string;
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  size?: "default" | "sm" | "compact";
  align?: "left" | "right";
  className?: string;
  dropdownClassName?: string;
  searchable?: boolean;
  "aria-label"?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

export function Select({
  id,
  name,
  value,
  onValueChange,
  options,
  placeholder = "Select an option...",
  disabled = false,
  size = "default",
  align = "left",
  className,
  dropdownClassName,
  "aria-label": ariaLabel,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: SelectProps) {
  const itemsMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    for (const opt of options) {
      map[opt.value] = opt.label;
    }
    return map;
  }, [options]);

  const selectedOption = React.useMemo(
    () => options.find((o) => o.value === value),
    [options, value],
  );

  return (
    <div className={cn("w-full", className)}>
      <SelectRoot
        name={name}
        value={value}
        onValueChange={(nextVal) => {
          onValueChange(nextVal === null ? "" : String(nextVal));
        }}
        disabled={disabled}
        items={itemsMap}
        modal={false}
      >
        <SelectTrigger
          id={id}
          size={size}
          aria-label={ariaLabel}
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedBy}
          className={cn(ariaInvalid && "border-destructive")}
        >
          <SelectValue placeholder={placeholder}>
            {() => {
              if (selectedOption) {
                return (
                  <span className="text-foreground">{selectedOption.label}</span>
                );
              }
              return <span className="text-muted-foreground">{placeholder}</span>;
            }}
          </SelectValue>
        </SelectTrigger>

        <SelectContent
          align={align === "right" ? "end" : "start"}
          className={dropdownClassName}
        >
          {options.map((opt) => (
            <SelectItem
              key={opt.value || "__empty__"}
              value={opt.value}
              disabled={opt.disabled}
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectRoot>
    </div>
  );
}

export {
  SelectRoot,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
