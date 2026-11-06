"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { usersService } from "./users.service";
import type { CreateAdminUserInput, UpdateAdminUserInput } from "./users.types";

export const userKeys = {
  adminAll: ["admin", "users"] as const,
};

export function useAdminUsers() {
  return useQuery({
    queryKey: userKeys.adminAll,
    queryFn: () => usersService.list(),
  });
}

export function useCreateAdminUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAdminUserInput) => usersService.create(input),
    onSuccess: (user) => {
      toast.success(`Created ${user.role} account for ${user.email}.`);
      void qc.invalidateQueries({ queryKey: userKeys.adminAll });
    },
  });
}

export function useUpdateAdminUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateAdminUserInput }) =>
      usersService.update(id, input),
    onSuccess: (user) => {
      toast.success(`Updated staff account ${user.email}.`);
      void qc.invalidateQueries({ queryKey: userKeys.adminAll });
    },
  });
}
