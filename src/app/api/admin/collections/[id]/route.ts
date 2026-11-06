import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/server/auth";
import { recordAuditLog } from "@/server/audit";
import { getStore } from "@/server/db/client";
import { mapToCollectionDetailDTO } from "@/server/domain/mappers";
import { ApiError, handleRouteError, jsonSuccess } from "@/server/security/http";
import { upsertCollectionSchema } from "@/services/collections/collections.schema";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdmin();
    const { id } = await context.params;
    const body = await request.json();
    const parsed = upsertCollectionSchema.partial().parse(body);

    const store = getStore();
    const col = store.collections.find((c) => c.id === id);
    if (!col) {
      throw new ApiError(404, "COLLECTION_NOT_FOUND", "Collection not found.");
    }

    if (parsed.title !== undefined) col.title = parsed.title;
    if (parsed.slug !== undefined) col.slug = parsed.slug;
    if (parsed.season !== undefined) col.season = parsed.season;
    if (parsed.story !== undefined) col.story = parsed.story;
    if (parsed.coverUrl !== undefined) col.coverUrl = parsed.coverUrl;
    if (parsed.coverAlt !== undefined) col.coverAlt = parsed.coverAlt;
    if (parsed.status !== undefined) col.status = parsed.status;
    if (parsed.items !== undefined) {
      col.items = parsed.items.map((item, idx) => ({
        id: item.id || `ci-${Date.now()}-${idx}`,
        collectionId: col.id,
        imageUrl: item.imageUrl,
        altText: item.altText,
        caption: item.caption,
        linkedProductId: item.linkedProductId ?? null,
        sortOrder: item.sortOrder ?? idx + 1,
      }));
    }
    col.updatedAt = new Date().toISOString();

    recordAuditLog({
      actorId: admin.id,
      actorEmail: admin.email,
      actorRole: admin.role,
      action: "collection.updated",
      entity: "collection",
      entityId: col.id,
      summary: `Updated collection "${col.title}"`,
    });

    revalidatePath("/collections");
    revalidatePath(`/collections/${col.slug}`);
    revalidatePath("/");

    return jsonSuccess(mapToCollectionDetailDTO(col));
  } catch (err) {
    return handleRouteError(err);
  }
}
