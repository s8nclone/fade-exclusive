"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { contentService } from "./content.service";
import type { UpdateContentPageInput, UpsertPressItemInput } from "./content.types";

export const contentKeys = {
  press: ["content", "press"] as const,
  page: (slug: string) => ["content", "page", slug] as const,
  adminBundle: ["admin", "content"] as const,
};

export function usePublicPress() {
  return useQuery({
    queryKey: contentKeys.press,
    queryFn: () => contentService.listPress(),
  });
}

export function usePublicContentPage(slug: string) {
  return useQuery({
    queryKey: contentKeys.page(slug),
    queryFn: () => contentService.getPage(slug),
  });
}

export function useAdminContentBundle() {
  return useQuery({
    queryKey: contentKeys.adminBundle,
    queryFn: () => contentService.adminGetContentBundle(),
  });
}

export function useUpdateContentPageMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, input }: { slug: string; input: UpdateContentPageInput }) =>
      contentService.adminUpdatePage(slug, input),
    onSuccess: (page) => {
      toast.success(`Updated "${page.title}".`);
      void qc.invalidateQueries({ queryKey: contentKeys.adminBundle });
      void qc.invalidateQueries({ queryKey: contentKeys.page(page.slug) });
    },
  });
}

export function useCreatePressMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpsertPressItemInput) => contentService.adminCreatePress(input),
    onSuccess: (item) => {
      toast.success(`Added press feature from ${item.outlet}.`);
      void qc.invalidateQueries({ queryKey: contentKeys.adminBundle });
      void qc.invalidateQueries({ queryKey: contentKeys.press });
    },
  });
}
