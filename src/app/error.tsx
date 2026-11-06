"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

export default function ErrorBoundaryPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-16 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.26em] text-destructive">
        UNEXPECTED APPLICATION ERROR
      </p>
      <h1 className="mt-2 font-serif text-3xl font-normal uppercase">
        Something Went Wrong
      </h1>
      <p className="mt-2 max-w-md text-xs text-muted-foreground">
        {error.message || "We encountered an issue loading this view."}
      </p>
      <Button onClick={reset} variant="outline" className="mt-6">
        Try Again
      </Button>
    </div>
  );
}
