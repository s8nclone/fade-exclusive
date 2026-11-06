"use client";

import * as React from "react";
import { Dialog as BaseDialog } from "@base-ui-components/react/dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SheetDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  side?: "right" | "left" | "bottom";
  children: React.ReactNode;
  className?: string;
}

export function SheetDrawer({
  open,
  onOpenChange,
  title,
  subtitle,
  side = "right",
  children,
  className,
}: SheetDrawerProps) {
  const positionClasses =
    side === "left"
      ? "inset-y-0 left-0 h-full w-[90vw] max-w-md border-r"
      : side === "bottom"
        ? "inset-x-0 bottom-0 max-h-[88vh] w-full border-t"
        : "inset-y-0 right-0 h-full w-[92vw] max-w-md border-l";

  return (
    <BaseDialog.Root open={open} onOpenChange={onOpenChange}>
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="fixed inset-0 z-50 bg-obsidian/70 transition-opacity" />
        <BaseDialog.Popup
          className={cn(
            "fixed z-50 flex flex-col border-border bg-background shadow-2xl focus:outline-none",
            positionClasses,
            className,
          )}
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <BaseDialog.Title className="font-serif text-lg font-medium tracking-wide text-foreground">
                {title}
              </BaseDialog.Title>
              {subtitle && (
                <BaseDialog.Description className="text-xs text-muted-foreground">
                  {subtitle}
                </BaseDialog.Description>
              )}
            </div>
            <BaseDialog.Close
              aria-label="Close panel"
              className="inline-flex h-10 w-10 items-center justify-center border border-border text-foreground hover:bg-surface cursor-pointer"
            >
              <X className="h-4 w-4" />
            </BaseDialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-luxury p-5">{children}</div>
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}
