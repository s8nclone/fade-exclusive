"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { ordersService } from "./orders.service";
import type {
  AdminOrderListQuery,
  ConfirmPaymentInput,
  CustomerPaymentSubmittedInput,
  OrderLookupInput,
  UpdateOrderStatusInput,
} from "./orders.types";

export const orderKeys = {
  all: ["orders"] as const,
  byToken: (token: string) => [...orderKeys.all, "token", token] as const,
  receiptByToken: (token: string) => ["receipts", "token", token] as const,
  adminAll: ["admin", "orders"] as const,
  adminList: (q: Partial<AdminOrderListQuery>) =>
    [...orderKeys.adminAll, "list", q] as const,
};

export function usePublicOrder(token: string) {
  return useQuery({
    queryKey: orderKeys.byToken(token),
    queryFn: () => ordersService.getByToken(token),
    staleTime: 10_000,
  });
}

export function usePublicReceipt(token: string) {
  return useQuery({
    queryKey: orderKeys.receiptByToken(token),
    queryFn: () => ordersService.getReceiptByToken(token),
  });
}

export function useOrderLookupMutation() {
  return useMutation({
    mutationFn: (input: OrderLookupInput) => ordersService.lookup(input),
  });
}

export function useMarkPaymentSubmittedMutation(token: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CustomerPaymentSubmittedInput) =>
      ordersService.markPaymentSubmitted(token, input),
    onSuccess: (updated) => {
      toast.success("Atelier notified! We will verify your bank transfer shortly.");
      qc.setQueryData(orderKeys.byToken(token), updated);
    },
  });
}

export function useAdminOrders(q: Partial<AdminOrderListQuery>) {
  return useQuery({
    queryKey: orderKeys.adminList(q),
    queryFn: () => ordersService.adminList(q),
    placeholderData: keepPreviousData,
  });
}

export function useConfirmPaymentMutation() {
  const qc = useQueryClient();
  return useMutation({
    // Confirming payment amounts is never optimistic per Section 8.4
    mutationFn: ({ orderId, input }: { orderId: string; input: ConfirmPaymentInput }) =>
      ordersService.adminConfirmPayment(orderId, input),
    onSuccess: (res) => {
      toast.success(`Payment confirmed! Issued receipt ${res.receiptNumber}.`);
      void qc.invalidateQueries({ queryKey: orderKeys.adminAll });
      void qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });
}

export function useUpdateOrderStatusMutation() {
  const qc = useQueryClient();
  return useMutation({
    // Optimistic status transition with rollback on error per Section 8.4 & 21
    mutationFn: ({ orderId, input }: { orderId: string; input: UpdateOrderStatusInput }) =>
      ordersService.adminUpdateStatus(orderId, input),
    onMutate: async ({ orderId, input }) => {
      await qc.cancelQueries({ queryKey: orderKeys.adminAll });
      const previousLists = qc.getQueriesData({ queryKey: orderKeys.adminAll });

      qc.setQueriesData({ queryKey: orderKeys.adminAll }, (old: unknown) => {
        if (!old || typeof old !== "object" || !("items" in old)) return old;
        const typed = old as { items: Array<{ id: string; status: string }> };
        return {
          ...old,
          items: typed.items.map((o) =>
            o.id === orderId ? { ...o, status: input.toStatus } : o,
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
    onSuccess: (updated) => {
      toast.success(`Order ${updated.orderNumber} updated to ${updated.status}.`);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: orderKeys.adminAll });
      void qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });
}
