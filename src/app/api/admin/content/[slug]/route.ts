import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/server/auth";
import { recordAuditLog } from "@/server/audit";
import { getStore } from "@/server/db/client";
import { sanitizePlainText } from "@/server/security/crypto";
import { ApiError, handleRouteError, jsonSuccess } from "@/server/security/http";
import { updateContentPageSchema } from "@/services/content/content.schema";

export async function PUT(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const admin = await requireAdmin();
    const { slug } = await context.params;
    const body = await request.json();
    const parsed = updateContentPageSchema.parse(body);

    const store = getStore();
    const page = store.contentPages.find((p) => p.slug === slug);
    if (!page) {
      throw new ApiError(404, "PAGE_NOT_FOUND", "Content page not found.");
    }

    page.title = sanitizePlainText(parsed.title);
    page.subtitle = sanitizePlainText(parsed.subtitle);
    page.bodyMarkdown = parsed.bodyMarkdown.replace(
      /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
      "",
    );
    page.updatedAt = new Date().toISOString();

    recordAuditLog({
      actorId: admin.id,
      actorEmail: admin.email,
      actorRole: admin.role,
      action: "content_page.updated",
      entity: "content_page",
      entityId: page.id,
      summary: `Updated policy/content page "${page.title}" (${page.slug})`,
    });

    revalidatePath(`/policies/${page.slug}`);

    return jsonSuccess(page);
  } catch (err) {
    return handleRouteError(err);
  }
}
