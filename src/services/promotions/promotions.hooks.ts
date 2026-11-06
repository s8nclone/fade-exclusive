"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { promotionsService } from "./promotions.service";
import type { PromotionAdminDTO, UpsertPromotionInput } from "./promotions.types";
import { productKeys } from "@/services/products/products.hooks";

export const promotionKeys = {
  adminAll: ["admin", "promotions"] as const,
};

export function useAdminPromotions() {
  return useQuery({
    queryKey: promotionKeys.adminAll,
    queryFn: () => promotionsService.adminList(),
  });
}

export function useCreatePromotionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpsertPromotionInput) => promotionsService.create(input),
    onSuccess: (created) => {
      toast.success(`Created promotion "${created.name}".`);
      void qc.invalidateQueries({ queryKey: promotionKeys.adminAll });
      void qc.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

export function useUpdatePromotionMutation() {
  const qc = useQueryClient();
  return useMutation({
    // Enable/disable toggle is optimistic per Section 8.4 & 11.8
    mutationFn: ({ id, input }: { id: string; input: Partial<UpsertPromotionInput> }) =>
      promotionsService.update(id, input),
    onMutate: async ({ id, input }) => {
      await qc.cancelQueries({ queryKey: promotionKeys.adminAll });
      const prev = qc.getQueryData<PromotionAdminDTO[]>(promotionKeys.adminAll);
      if (prev) {
        qc.setQueryData<PromotionAdminDTO[]>(
          promotionKeys.adminAll,
          prev.map((p) => (p.id === id ? { ...p, ...input } : p)),
        );
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData(promotionKeys.adminAll, ctx.prev);
      }
    },
    onSuccess: () => {
      toast.success("Promotion updated.");
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: promotionKeys.adminAll });
      void qc.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

export function useDuplicatePromotionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => promotionsService.duplicate(id),
    onSuccess: (copy) => {
      toast.success(`Duplicated promotion as "${copy.name}".`);
      void qc.invalidateQueries({ queryKey: promotionKeys.adminAll });
    },
  });
}
