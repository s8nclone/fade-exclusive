"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { bannersService } from "./banners.service";
import type { BannerDTO, UpsertBannerInput } from "./banners.types";

export const bannerKeys = {
  publicList: ["banners", "public"] as const,
  adminList: ["admin", "banners"] as const,
};

export function usePublicBanners() {
  return useQuery({
    queryKey: bannerKeys.publicList,
    queryFn: () => bannersService.listPublic(),
    staleTime: 30_000,
  });
}

export function useAdminBanners() {
  return useQuery({
    queryKey: bannerKeys.adminList,
    queryFn: () => bannersService.adminList(),
  });
}

export function useCreateBannerMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpsertBannerInput) => bannersService.create(input),
    onSuccess: (created) => {
      toast.success(`Banner "${created.title.slice(0, 32)}..." created.`);
      void qc.invalidateQueries({ queryKey: bannerKeys.adminList });
      void qc.invalidateQueries({ queryKey: bannerKeys.publicList });
    },
  });
}

export function useUpdateBannerMutation() {
  const qc = useQueryClient();
  return useMutation({
    // Banner active toggle and color changes are optimistic per Section 8.4
    mutationFn: ({ id, input }: { id: string; input: Partial<UpsertBannerInput> }) =>
      bannersService.update(id, input),
    onMutate: async ({ id, input }) => {
      await qc.cancelQueries({ queryKey: bannerKeys.adminList });
      const prev = qc.getQueryData<BannerDTO[]>(bannerKeys.adminList);
      if (prev) {
        qc.setQueryData<BannerDTO[]>(
          bannerKeys.adminList,
          prev.map((b) => (b.id === id ? { ...b, ...input } : b)),
        );
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData(bannerKeys.adminList, ctx.prev);
      }
    },
    onSuccess: () => {
      toast.success("Banner updated.");
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: bannerKeys.adminList });
      void qc.invalidateQueries({ queryKey: bannerKeys.publicList });
    },
  });
}

export function useDeleteBannerMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bannersService.remove(id),
    onSuccess: () => {
      toast.success("Banner deleted.");
      void qc.invalidateQueries({ queryKey: bannerKeys.adminList });
      void qc.invalidateQueries({ queryKey: bannerKeys.publicList });
    },
  });
}
