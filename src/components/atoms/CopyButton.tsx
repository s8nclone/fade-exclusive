"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CopyButtonProps {
  value: string;
  label?: string;
  className?: string;
}

export function CopyButton({ value, label = "Copy", className }: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className={cn(
        "group min-h-[34px] gap-1.5 border px-3 py-1 text-[11px] font-semibold tracking-[0.12em] transition-colors",
        copied
          ? "border-success bg-success text-success-foreground hover:border-success hover:bg-success hover:text-success-foreground"
          : "border-accent bg-surface-elevated text-foreground hover:border-accent hover:bg-accent hover:text-accent-foreground",
        className,
      )}
      aria-label={`Copy ${value}`}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 shrink-0 text-success-foreground" />
          <span>Copied</span>
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5 shrink-0 text-accent transition-colors group-hover:text-accent-foreground" />
          <span>{label}</span>
        </>
      )}
    </Button>
  );
}
