import { getSessionUser } from "@/server/auth";
import { enforceRateLimit, getClientIp } from "@/server/rate-limit";
import { ApiError, handleRouteError, jsonSuccess } from "@/server/security/http";
import { createPresignedUploadUrl } from "@/server/storage/r2";
import { requestUploadSignSchema } from "@/services/media/media.schema";

export async function POST(request: Request) {
  try {
    enforceRateLimit({
      keyPrefix: "upload-sign",
      identifier: getClientIp(request),
      limit: 15,
      windowSeconds: 60,
    });

    const body = await request.json();
    const parsed = requestUploadSignSchema.parse(body);

    // Public catalog bucket requires an authenticated admin session
    if (parsed.bucketKind === "public") {
      const admin = await getSessionUser();
      if (!admin) {
        throw new ApiError(
          401,
          "UNAUTHORIZED",
          "Admin authentication required for public catalog uploads.",
        );
      }
    }

    const signed = await createPresignedUploadUrl({
      bucketKind: parsed.bucketKind,
      mimeType: parsed.mimeType,
      sizeBytes: parsed.sizeBytes,
    });

    return jsonSuccess(signed);
  } catch (err) {
    return handleRouteError(err);
  }
}
