import { getStore } from "@/server/db/client";
import { mapToCollectionDetailDTO } from "@/server/domain/mappers";
import { ApiError, handleRouteError, jsonSuccess } from "@/server/security/http";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const store = getStore();
    const col = store.collections.find(
      (c) => c.slug === slug && c.status === "published",
    );
    if (!col) {
      throw new ApiError(404, "COLLECTION_NOT_FOUND", "Collection not found.");
    }
    return jsonSuccess(mapToCollectionDetailDTO(col));
  } catch (err) {
    return handleRouteError(err);
  }
}
