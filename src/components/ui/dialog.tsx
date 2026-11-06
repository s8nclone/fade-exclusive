"use client";

import * as React from "react";
import { Dialog as BaseDialog } from "@base-ui-components/react/dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  maxWidthClass?: string;
}

export function ModalDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  maxWidthClass,
}: ModalDialogProps) {
  return (
    <BaseDialog.Root open={open} onOpenChange={onOpenChange}>
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="fixed inset-0 z-50 bg-obsidian/70 transition-opacity" />
        <BaseDialog.Popup
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[94vw] max-w-lg -translate-x-1/2 -translate-y-1/2 border border-border bg-background p-6 shadow-xl focus:outline-none max-h-[90vh] overflow-y-auto",
            maxWidthClass,
            className,
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
            <div>
              <BaseDialog.Title className="font-serif text-xl font-medium text-foreground">
                {title}
              </BaseDialog.Title>
              {description && (
                <BaseDialog.Description className="mt-1 text-xs text-muted-foreground">
                  {description}
                </BaseDialog.Description>
              )}
            </div>
            <BaseDialog.Close
              aria-label="Close dialog"
              className="inline-flex h-9 w-9 items-center justify-center border border-border text-foreground hover:bg-surface cursor-pointer"
            >
              <X className="h-4 w-4" />
            </BaseDialog.Close>
          </div>
          <div className="mt-5">{children}</div>
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}

export { ModalDialog as Dialog };
