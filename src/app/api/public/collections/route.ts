import { getStore } from "@/server/db/client";
import { mapToCollectionCardDTO } from "@/server/domain/mappers";
import { handleRouteError, jsonSuccess } from "@/server/security/http";
import { collectionListQuerySchema } from "@/services/collections/collections.schema";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const parsed = collectionListQuerySchema.parse({
      cursor: url.searchParams.get("cursor") ?? undefined,
      limit: url.searchParams.get("limit") ?? 12,
    });

    const store = getStore();
    const published = store.collections
      .filter((c) => c.status === "published")
      .sort((a, b) => a.sortOrder - b.sortOrder);

    let startIndex = 0;
    if (parsed.cursor) {
      const idx = published.findIndex((c) => c.id === parsed.cursor);
      if (idx >= 0) startIndex = idx + 1;
    }

    const slice = published.slice(startIndex, startIndex + parsed.limit);
    const hasMore = startIndex + parsed.limit < published.length;
    const nextCursor = hasMore ? (slice[slice.length - 1]?.id ?? null) : null;

    return jsonSuccess({
      items: slice.map(mapToCollectionCardDTO),
      nextCursor,
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
