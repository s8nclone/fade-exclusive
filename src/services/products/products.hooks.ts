"use client";

import {
  keepPreviousData,
  queryOptions,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { productsService } from "./products.service";
import type {
  AdminProductListQuery,
  BulkProductActionInput,
  ProductListQuery,
  UpsertProductInput,
} from "./products.types";

export const productKeys = {
  all: ["products"] as const,
  list: (q: Omit<Partial<ProductListQuery>, "cursor">) =>
    [...productKeys.all, "list", q] as const,
  detail: (slug: string) => [...productKeys.all, "detail", slug] as const,
  adminAll: ["admin", "products"] as const,
  adminList: (q: Partial<AdminProductListQuery>) =>
    [...productKeys.adminAll, "list", q] as const,
};

export const productDetailQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: productKeys.detail(slug),
    queryFn: () => productsService.detail(slug),
    staleTime: 60_000,
  });

export function useProductsInfinite(q: Omit<Partial<ProductListQuery>, "cursor">) {
  return useInfiniteQuery({
    queryKey: productKeys.list(q),
    queryFn: ({ pageParam }) =>
      productsService.list({ ...q, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    staleTime: 60_000,
  });
}

export function useProductDetail(slug: string) {
  return useQuery(productDetailQueryOptions(slug));
}

export function useAdminProducts(q: Partial<AdminProductListQuery>) {
  return useQuery({
    queryKey: productKeys.adminList(q),
    queryFn: () => productsService.adminList(q),
    placeholderData: keepPreviousData,
  });
}

export function useCreateProductMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpsertProductInput) => productsService.create(input),
    onSuccess: (created) => {
      toast.success(`Created "${created.name}".`);
      void qc.invalidateQueries({ queryKey: productKeys.adminAll });
      void qc.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

export function useUpdateProductMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<UpsertProductInput> }) =>
      productsService.update(id, input),
    onMutate: async ({ id, input }) => {
      await qc.cancelQueries({ queryKey: productKeys.adminAll });
      const previousLists = qc.getQueriesData({ queryKey: productKeys.adminAll });
      qc.setQueriesData({ queryKey: productKeys.adminAll }, (old: unknown) => {
        if (!old || typeof old !== "object" || !("items" in old)) return old;
        const typed = old as { items: Array<{ id: string }> };
        return {
          ...old,
          items: typed.items.map((item) =>
            item.id === id ? { ...item, ...input } : item,
          ),
        };
      });
      return { previousLists };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousLists) {
        for (const [key, data] of context.previousLists) {
          qc.setQueryData(key, data);
        }
      }
    },
    onSuccess: () => {
      toast.success("Product updated.");
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: productKeys.adminAll });
      void qc.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

export function useDuplicateProductMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productsService.duplicate(id),
    onSuccess: (copy) => {
      toast.success(`Duplicated as "${copy.name}".`);
      void qc.invalidateQueries({ queryKey: productKeys.adminAll });
    },
  });
}

export function useArchiveOrDeleteProductMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, permanent }: { id: string; permanent?: boolean }) =>
      productsService.archiveOrDelete(id, permanent),
    onSuccess: (res) => {
      toast.success(
        res.mode === "deleted"
          ? "Product permanently deleted."
          : "Product archived and hidden from storefront.",
      );
      void qc.invalidateQueries({ queryKey: productKeys.adminAll });
      void qc.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

export function useBulkProductActionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: BulkProductActionInput) => productsService.bulkAction(input),
    onSuccess: (res) => {
      toast.success(`Updated ${res.updatedCount} product(s).`);
      void qc.invalidateQueries({ queryKey: productKeys.adminAll });
      void qc.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}
