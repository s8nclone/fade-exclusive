"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authService } from "./auth.service";
import type { AdminLoginInput } from "./auth.types";

export const authKeys = {
  session: ["auth", "session"] as const,
};

export function useAdminSession() {
  return useQuery({
    queryKey: authKeys.session,
    queryFn: () => authService.me(),
    staleTime: 60_000,
  });
}

export function useAdminLoginMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AdminLoginInput) => authService.login(input),
    onSuccess: (res) => {
      toast.success(`Welcome back, ${res.user.name}.`);
      qc.setQueryData(authKeys.session, { user: res.user });
    },
  });
}

export function useAdminLogoutMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (allDevices?: boolean) => authService.logout(allDevices),
    onSuccess: () => {
      qc.setQueryData(authKeys.session, { user: null });
      toast.success("Signed out securely.");
    },
  });
}
