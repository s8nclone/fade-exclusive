import type { z } from "zod";
import type {
  confirmUploadSchema,
  requestUploadSignSchema,
} from "./media.schema";

export type RequestUploadSignInput = z.infer<typeof requestUploadSignSchema>;
export type ConfirmUploadInput = z.infer<typeof confirmUploadSchema>;

export interface MediaAssetDTO {
  id: string;
  bucket: "public" | "private";
  objectKey: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  altText: string;
  inUseCount: number;
  createdAt: string;
}

export interface SignedUploadOfferDTO {
  uploadUrl: string;
  objectKey: string;
  publicUrl: string;
  expiresInSeconds: number;
  mode: "r2" | "local_simulated";
}
