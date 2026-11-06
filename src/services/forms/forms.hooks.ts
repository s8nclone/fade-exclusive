"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { formsService } from "./forms.service";
import type { UpdateFormConfigInput } from "./forms.types";

export const formKeys = {
  publicBySlug: (slug: string) => ["forms", "public", slug] as const,
  adminForms: ["admin", "forms"] as const,
  adminSubmissions: ["admin", "submissions"] as const,
};

export function usePublicForm(slug: "contact" | "custom-fit" | "checkout-extra") {
  return useQuery({
    queryKey: formKeys.publicBySlug(slug),
    queryFn: () => formsService.getPublicForm(slug),
    staleTime: 30_000,
  });
}

export function useSubmitPublicFormMutation(slug: "contact" | "custom-fit") {
  return useMutation({
    mutationFn: ({
      answers,
      turnstileToken,
    }: {
      answers: Record<string, unknown>;
      turnstileToken?: string;
    }) => formsService.submitPublicForm(slug, answers, turnstileToken),
    onSuccess: (res) => {
      toast.success(res.message);
    },
  });
}

export function useAdminForms() {
  return useQuery({
    queryKey: formKeys.adminForms,
    queryFn: () => formsService.adminListForms(),
  });
}

export function useUpdateFormConfigMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, input }: { slug: string; input: UpdateFormConfigInput }) =>
      formsService.adminUpdateForm(slug, input),
    onSuccess: (updated) => {
      toast.success(`Published Form v${updated.version} for "${updated.title}".`);
      void qc.invalidateQueries({ queryKey: formKeys.adminForms });
      void qc.invalidateQueries({ queryKey: formKeys.publicBySlug(updated.slug) });
    },
  });
}

export function useResetFormConfigMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => formsService.adminResetForm(slug),
    onSuccess: (reset) => {
      toast.success(`Reset "${reset.title}" to factory defaults.`);
      void qc.invalidateQueries({ queryKey: formKeys.adminForms });
      void qc.invalidateQueries({ queryKey: formKeys.publicBySlug(reset.slug) });
    },
  });
}

export function useAdminSubmissions() {
  return useQuery({
    queryKey: formKeys.adminSubmissions,
    queryFn: () => formsService.adminListSubmissions(),
  });
}
