import * as React from "react";
import type { Metadata } from "next";
import { ShopContainer } from "@/containers/shop/ShopContainer";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Shop The 2026 Collection",
  description:
    "Explore Ready-to-Wear and Made-to-Order Agbadas, Senator Sets, Kaftans, and Filas crafted in the Fadé Exclusives Abuja Atelier.",
};

export default function ShopPage() {
  return (
    <React.Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8 space-y-6">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      }
    >
      <ShopContainer />
    </React.Suspense>
  );
}
