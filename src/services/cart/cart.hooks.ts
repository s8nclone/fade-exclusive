"use client";

import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { cartService } from "./cart.service";
import type { CartPreviewRequest } from "./cart.types";

export const cartKeys = {
  all: ["cart"] as const,
  preview: (req: CartPreviewRequest) => [...cartKeys.all, "preview", req] as const,
};

export function useCartPreview(req: CartPreviewRequest) {
  return useQuery({
    queryKey: cartKeys.preview(req),
    queryFn: () => cartService.preview(req),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });
}

export function useValidateCouponMutation() {
  return useMutation({
    mutationFn: (req: CartPreviewRequest) => cartService.preview(req),
  });
}
