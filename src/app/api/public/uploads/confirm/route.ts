import { getStore } from "@/server/db/client";
import { sanitizePlainText } from "@/server/security/crypto";
import { handleRouteError, jsonSuccess } from "@/server/security/http";
import { verifyUploadedObject } from "@/server/storage/r2";
import { confirmUploadSchema } from "@/services/media/media.schema";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = confirmUploadSchema.parse(body);

    const verified = await verifyUploadedObject({
      bucketKind: parsed.bucketKind,
      objectKey: parsed.objectKey,
    });

    const store = getStore();
    const asset = {
      id: `med-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      bucket: parsed.bucketKind,
      objectKey: parsed.objectKey,
      url: parsed.publicUrl,
      mimeType: verified.mimeType || parsed.mimeType,
      sizeBytes: verified.sizeBytes || parsed.sizeBytes,
      altText: sanitizePlainText(parsed.altText),
      createdAt: new Date().toISOString(),
    };

    store.mediaAssets.unshift(asset);

    return jsonSuccess({
      ...asset,
      inUseCount: 0,
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
