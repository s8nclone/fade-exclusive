"use client";

import * as React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { makeQueryClient } from "@/lib/query/client";
import { useCartStore } from "@/stores/cart.store";
import { useUiStore } from "@/stores/ui.store";

let browserQueryClient: ReturnType<typeof makeQueryClient> | undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    return makeQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  React.useEffect(() => {
    void useCartStore.persist.rehydrate();
    void useUiStore.persist.rehydrate();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            backgroundColor: "#161412",
            color: "#F4F1EA",
            border: "1px solid #9E7344",
            borderRadius: "0px",
          },
        }}
      />
    </QueryClientProvider>
  );
}
