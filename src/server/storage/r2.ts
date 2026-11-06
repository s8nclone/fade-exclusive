import "server-only";
import crypto from "crypto";
import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getEnv } from "@/lib/env";
import { ApiError } from "@/server/security/http";

export const ALLOWED_UPLOAD_MIME_TYPES = [
  "image/webp",
  "image/jpeg",
  "image/png",
] as const;

export type AllowedUploadMime = (typeof ALLOWED_UPLOAD_MIME_TYPES)[number];

export const MAX_UPLOAD_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB

function getS3Client(): S3Client | null {
  const env = getEnv();
  if (
    !env.R2_ACCOUNT_ID ||
    env.R2_ACCOUNT_ID === "demo-r2-account" ||
    !env.R2_ACCESS_KEY_ID ||
    env.R2_ACCESS_KEY_ID === "demo-r2-key"
  ) {
    return null;
  }
  return new S3Client({
    region: "auto",
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
  });
}

export function generateRandomObjectKey(
  bucketKind: "public" | "private",
  mimeType: AllowedUploadMime,
): string {
  const ext =
    mimeType === "image/webp" ? "webp" : mimeType === "image/png" ? "png" : "jpg";
  const dateFolder = new Date().toISOString().slice(0, 10);
  const randomId = crypto.randomBytes(16).toString("hex");
  return `${bucketKind}/${dateFolder}/${randomId}.${ext}`;
}

export async function createPresignedUploadUrl(params: {
  bucketKind: "public" | "private";
  mimeType: string;
  sizeBytes: number;
}): Promise<{
  uploadUrl: string;
  objectKey: string;
  publicUrl: string;
  expiresInSeconds: number;
  mode: "r2" | "local_simulated";
}> {
  if (!ALLOWED_UPLOAD_MIME_TYPES.includes(params.mimeType as AllowedUploadMime)) {
    throw new ApiError(
      400,
      "UNSUPPORTED_MEDIA_TYPE",
      "Only WebP, JPEG, and PNG images are permitted.",
    );
  }
  if (params.sizeBytes <= 0 || params.sizeBytes > MAX_UPLOAD_SIZE_BYTES) {
    throw new ApiError(
      400,
      "FILE_TOO_LARGE",
      "Image size must be between 1 byte and 8 MB.",
    );
  }

  const env = getEnv();
  const objectKey = generateRandomObjectKey(
    params.bucketKind,
    params.mimeType as AllowedUploadMime,
  );
  const bucketName =
    params.bucketKind === "public" ? env.R2_PUBLIC_BUCKET : env.R2_PRIVATE_BUCKET;
  const s3 = getS3Client();

  if (!s3) {
    // Local / CI preview fallback when R2 credentials are not configured
    const simulatedPublicUrl =
      params.bucketKind === "public"
        ? `/brand/logo-full.jpg?key=${encodeURIComponent(objectKey)}`
        : `/brand/logo-mark.jpg?privateKey=${encodeURIComponent(objectKey)}`;
    return {
      uploadUrl: `/api/public/uploads/confirm?simulatedKey=${encodeURIComponent(objectKey)}`,
      objectKey,
      publicUrl: simulatedPublicUrl,
      expiresInSeconds: 300,
      mode: "local_simulated",
    };
  }

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: objectKey,
    ContentType: params.mimeType,
    ContentLength: params.sizeBytes,
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
  const publicUrl =
    params.bucketKind === "public"
      ? `${env.R2_PUBLIC_BASE_URL.replace(/\/$/, "")}/${objectKey}`
      : `r2-private://${objectKey}`;

  return {
    uploadUrl,
    objectKey,
    publicUrl,
    expiresInSeconds: 300,
    mode: "r2",
  };
}

export async function createPrivateAssetSignedReadUrl(objectKey: string): Promise<string> {
  const s3 = getS3Client();
  const env = getEnv();
  if (!s3) {
    return `/brand/logo-mark.jpg?privateKey=${encodeURIComponent(objectKey)}`;
  }
  const command = new GetObjectCommand({
    Bucket: env.R2_PRIVATE_BUCKET,
    Key: objectKey,
  });
  return getSignedUrl(s3, command, { expiresIn: 600 });
}

export async function verifyUploadedObject(params: {
  bucketKind: "public" | "private";
  objectKey: string;
}): Promise<{ sizeBytes: number; mimeType: string }> {
  const s3 = getS3Client();
  const env = getEnv();
  if (!s3) {
    return { sizeBytes: 124_000, mimeType: "image/webp" };
  }
  const bucketName =
    params.bucketKind === "public" ? env.R2_PUBLIC_BUCKET : env.R2_PRIVATE_BUCKET;
  const head = await s3.send(
    new HeadObjectCommand({
      Bucket: bucketName,
      Key: params.objectKey,
    }),
  );
  return {
    sizeBytes: head.ContentLength ?? 0,
    mimeType: head.ContentType ?? "image/webp",
  };
}
