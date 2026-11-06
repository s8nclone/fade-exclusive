"use client";

import * as React from "react";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-[#F4F1EA] p-8 text-center text-[#161412]">
        <h1 className="font-serif text-3xl uppercase">
          Fadé Exclusives — Service Interrupted
        </h1>
        <p className="mt-2 text-sm">
          Please refresh or click below to reload the storefront.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 border border-[#161412] bg-[#161412] px-6 py-3 text-xs font-semibold uppercase tracking-widest text-[#F4F1EA]"
        >
          Reload Storefront
        </button>
      </body>
    </html>
  );
}
