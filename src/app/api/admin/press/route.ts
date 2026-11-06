import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/server/auth";
import { recordAuditLog } from "@/server/audit";
import { getStore } from "@/server/db/client";
import { sanitizePlainText } from "@/server/security/crypto";
import { handleRouteError, jsonSuccess } from "@/server/security/http";
import { upsertPressItemSchema } from "@/services/content/content.schema";

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const parsed = upsertPressItemSchema.parse(body);

    const store = getStore();
    const newItem = {
      id: `press-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      outlet: sanitizePlainText(parsed.outlet),
      title: sanitizePlainText(parsed.title),
      excerpt: sanitizePlainText(parsed.excerpt),
      url: parsed.url,
      publishedDate: parsed.publishedDate,
      coverUrl: parsed.coverUrl,
      coverAlt: sanitizePlainText(parsed.coverAlt),
      isFeatured: parsed.isFeatured,
      sortOrder: store.pressItems.length + 1,
    };

    store.pressItems.unshift(newItem);

    recordAuditLog({
      actorId: admin.id,
      actorEmail: admin.email,
      actorRole: admin.role,
      action: "press.created",
      entity: "press_item",
      entityId: newItem.id,
      summary: `Added press feature "${newItem.title}" (${newItem.outlet})`,
    });

    revalidatePath("/press");
    revalidatePath("/");

    return jsonSuccess(newItem, { status: 201 });
  } catch (err) {
    return handleRouteError(err);
  }
}
