"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { mediaService } from "./media.service";
import type { ConfirmUploadInput, RequestUploadSignInput } from "./media.types";

export const mediaKeys = {
  adminAll: ["admin", "media"] as const,
};

export function useAdminMedia() {
  return useQuery({
    queryKey: mediaKeys.adminAll,
    queryFn: () => mediaService.adminList(),
  });
}

export function useUploadMediaMutation() {
  const qc = useQueryClient();
  return useMutation({
    // Uploading media is never optimistic per Section 8.4 — waits for R2 sign + confirm
    mutationFn: async (input: RequestUploadSignInput) => {
      const signed = await mediaService.signUpload(input);
      const confirmPayload: ConfirmUploadInput = {
        bucketKind: input.bucketKind,
        objectKey: signed.objectKey,
        publicUrl: signed.publicUrl,
        mimeType: input.mimeType,
        sizeBytes: input.sizeBytes,
        altText: input.altText,
      };
      return mediaService.confirmUpload(confirmPayload);
    },
    onSuccess: (asset) => {
      toast.success(`Uploaded asset "${asset.altText}".`);
      void qc.invalidateQueries({ queryKey: mediaKeys.adminAll });
    },
  });
}

export function useDeleteMediaMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mediaService.adminDeleteAsset(id),
    onSuccess: () => {
      toast.success("Media asset removed.");
      void qc.invalidateQueries({ queryKey: mediaKeys.adminAll });
    },
  });
}
