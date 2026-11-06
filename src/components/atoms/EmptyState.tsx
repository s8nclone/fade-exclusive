import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  eyebrow?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  className?: string;
}

export function EmptyState({
  eyebrow = "ATELIER ARCHIVE",
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center border border-border bg-surface/50 px-6 py-16 text-center",
        className,
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-accent">
        {eyebrow}
      </p>
      <h3 className="mt-2 font-serif text-2xl font-normal text-foreground">
        {title}
      </h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-6">
          {actionLabel}
        </Button>
      )}
      {actionLabel && actionHref && !onAction && (
        <a
          href={actionHref}
          className="mt-6 inline-flex min-h-[44px] items-center justify-center bg-primary px-6 py-2.5 text-xs font-medium uppercase tracking-[0.14em] text-primary-foreground hover:bg-accent"
        >
          {actionLabel}
        </a>
      )}
    </div>
  );
}
