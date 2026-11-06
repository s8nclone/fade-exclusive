"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { collectionsService } from "./collections.service";
import type { CollectionListQuery, UpsertCollectionInput } from "./collections.types";

export const collectionKeys = {
  all: ["collections"] as const,
  list: (q: Omit<Partial<CollectionListQuery>, "cursor">) =>
    [...collectionKeys.all, "list", q] as const,
  detail: (slug: string) => [...collectionKeys.all, "detail", slug] as const,
  adminList: ["admin", "collections"] as const,
};

export function useCollectionsInfinite(q: Omit<Partial<CollectionListQuery>, "cursor"> = {}) {
  return useInfiniteQuery({
    queryKey: collectionKeys.list(q),
    queryFn: ({ pageParam }) => collectionsService.list({ ...q, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });
}

export function useCollectionDetail(slug: string) {
  return useQuery({
    queryKey: collectionKeys.detail(slug),
    queryFn: () => collectionsService.detail(slug),
  });
}

export function useAdminCollections() {
  return useQuery({
    queryKey: collectionKeys.adminList,
    queryFn: () => collectionsService.adminList(),
  });
}

export function useCreateCollectionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpsertCollectionInput) => collectionsService.create(input),
    onSuccess: (created) => {
      toast.success(`Created lookbook "${created.title}".`);
      void qc.invalidateQueries({ queryKey: collectionKeys.adminList });
      void qc.invalidateQueries({ queryKey: collectionKeys.all });
    },
  });
}

export function useUpdateCollectionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<UpsertCollectionInput> }) =>
      collectionsService.update(id, input),
    onSuccess: () => {
      toast.success("Collection updated.");
      void qc.invalidateQueries({ queryKey: collectionKeys.adminList });
      void qc.invalidateQueries({ queryKey: collectionKeys.all });
    },
  });
}
