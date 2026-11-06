"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { settingsService } from "./settings.service";
import type { UpdateSettingsInput, UpsertBankAccountInput } from "./settings.types";

export const settingsKeys = {
  public: ["settings", "public"] as const,
  admin: ["admin", "settings"] as const,
};

export function usePublicSettings() {
  return useQuery({
    queryKey: settingsKeys.public,
    queryFn: () => settingsService.getPublic(),
    staleTime: 60_000,
  });
}

export function useAdminSettings() {
  return useQuery({
    queryKey: settingsKeys.admin,
    queryFn: () => settingsService.adminGet(),
  });
}

export function useUpdateSettingsMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateSettingsInput) => settingsService.adminUpdate(input),
    onSuccess: () => {
      toast.success("Store settings saved.");
      void qc.invalidateQueries({ queryKey: settingsKeys.admin });
      void qc.invalidateQueries({ queryKey: settingsKeys.public });
    },
  });
}

export function useUpsertBankAccountMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpsertBankAccountInput) =>
      settingsService.adminUpsertBankAccount(input),
    onSuccess: (bank) => {
      toast.success(`Verified and saved bank account "${bank.label}".`);
      void qc.invalidateQueries({ queryKey: settingsKeys.admin });
    },
  });
}
