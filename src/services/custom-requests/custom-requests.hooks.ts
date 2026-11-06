"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { customRequestsService } from "./custom-requests.service";

export const customRequestKeys = {
  adminAll: ["admin", "custom-requests"] as const,
};

export function useAdminCustomRequests() {
  return useQuery({
    queryKey: customRequestKeys.adminAll,
    queryFn: () => customRequestsService.adminList(),
  });
}

export function useQuoteCustomRequestMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Parameters<typeof customRequestsService.adminUpdateAndQuote>[1];
    }) => customRequestsService.adminUpdateAndQuote(id, input),
    onSuccess: (updated) => {
      toast.success(`Updated inquiry ${updated.requestNumber} (${updated.status}).`);
      void qc.invalidateQueries({ queryKey: customRequestKeys.adminAll });
      void qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });
}

export function useConvertCustomRequestMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customRequestsService.adminConvertToOrder(id),
    onSuccess: (res) => {
      toast.success(
        `Converted inquiry to Order ${res.orderNumber}! Payment instructions ready.`,
      );
      void qc.invalidateQueries({ queryKey: customRequestKeys.adminAll });
      void qc.invalidateQueries({ queryKey: ["admin", "orders"] });
      void qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });
}
