"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { checkoutService } from "./checkout.service";
import type { CheckoutRequestInput } from "./checkout.types";
import { productKeys } from "@/services/products/products.hooks";

export function usePlaceOrderMutation() {
  const qc = useQueryClient();
  return useMutation({
    // Placing an order is never optimistic per Section 8.4 — always wait for server
    mutationFn: (input: CheckoutRequestInput) => checkoutService.placeOrder(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}
