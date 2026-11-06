import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Solid-tone skeleton with simple opacity pulse (Section 20).
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse bg-muted", className)}
      aria-hidden="true"
      {...props}
    />
  );
}
