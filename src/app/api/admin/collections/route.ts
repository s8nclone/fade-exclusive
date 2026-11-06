import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/server/auth";
import { recordAuditLog } from "@/server/audit";
import { getStore } from "@/server/db/client";
import type { SeedCollection } from "@/server/db/seed-data";
import { mapToCollectionDetailDTO } from "@/server/domain/mappers";
import { ApiError, handleRouteError, jsonSuccess } from "@/server/security/http";
import { upsertCollectionSchema } from "@/services/collections/collections.schema";

export async function GET() {
  try {
    await requireAdmin();
    const store = getStore();
    return jsonSuccess(store.collections.map(mapToCollectionDetailDTO));
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const parsed = upsertCollectionSchema.parse(body);

    const store = getStore();
    if (store.collections.some((c) => c.slug === parsed.slug)) {
      throw new ApiError(409, "DUPLICATE_SLUG", "Collection slug already exists.");
    }

    const nowIso = new Date().toISOString();
    const colId = `col-${Date.now()}`;
    const newCol: SeedCollection = {
      id: colId,
      title: parsed.title,
      slug: parsed.slug,
      season: parsed.season,
      story: parsed.story,
      coverUrl: parsed.coverUrl,
      coverAlt: parsed.coverAlt,
      status: parsed.status,
      sortOrder: store.collections.length + 1,
      items: parsed.items.map((item, idx) => ({
        id: item.id || `ci-${Date.now()}-${idx}`,
        collectionId: colId,
        imageUrl: item.imageUrl,
        altText: item.altText,
        caption: item.caption,
        linkedProductId: item.linkedProductId ?? null,
        sortOrder: item.sortOrder ?? idx + 1,
      })),
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    store.collections.unshift(newCol);

    recordAuditLog({
      actorId: admin.id,
      actorEmail: admin.email,
      actorRole: admin.role,
      action: "collection.created",
      entity: "collection",
      entityId: newCol.id,
      summary: `Created collection "${newCol.title}"`,
    });

    revalidatePath("/collections");
    revalidatePath("/");

    return jsonSuccess(mapToCollectionDetailDTO(newCol), { status: 201 });
  } catch (err) {
    return handleRouteError(err);
  }
}
