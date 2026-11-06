import * as React from "react";
import { cn } from "@/lib/utils";

export interface LogoProps {
  variant?: "full" | "mark" | "editorial";
  className?: string;
  markClassName?: string;
}

/**
 * Fadé Exclusive Monogram Mark & Editorial Logotype Atom.
 * Matches the uploaded geometric F/É monogram mark 1:1 and inherits currentColor.
 */
export function Logo({
  variant = "full",
  className,
  markClassName,
}: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-3 select-none", className)}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 240 280"
        fill="currentColor"
        role="img"
        aria-label="Fadé Exclusive Monogram"
        className={cn("h-8 w-auto shrink-0", markClassName)}
      >
        <path d="M 30 56 H 90 V 84 H 60 V 148 H 112 V 176 H 60 V 260 H 30 Z" />
        <path d="M 102 56 H 146 L 178 24 H 214 L 154 84 H 102 Z" />
        <path d="M 192 56 H 210 V 260 H 72 V 232 H 180 V 176 H 128 V 148 H 180 V 84 H 170 Z" />
      </svg>
      {variant === "full" && (
        <span className="font-serif text-xl font-medium tracking-tight">
          Fadé Exclusive
        </span>
      )}
      {variant === "editorial" && (
        <span className="flex flex-col leading-none">
          <span className="font-serif text-xl font-normal tracking-[0.08em]">
            FADÉ
          </span>
          <span className="mt-0.5 font-sans text-[9px] font-medium tracking-[0.34em] uppercase opacity-80">
            EXCLUSIVES
          </span>
        </span>
      )}
    </span>
  );
}
