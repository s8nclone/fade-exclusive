import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Unable to load content",
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center border border-destructive/40 bg-surface px-6 py-12 text-center",
        className,
      )}
    >
      <AlertTriangle className="h-7 w-7 text-destructive" />
      <h3 className="mt-3 font-serif text-xl font-medium text-foreground">
        {title}
      </h3>
      <p className="mt-1.5 max-w-md text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="mt-5">
          Try Again
        </Button>
      )}
    </div>
  );
}
