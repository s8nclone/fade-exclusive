import { getStore } from "@/server/db/client";
import { ApiError, handleRouteError, jsonSuccess } from "@/server/security/http";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const store = getStore();
    const form = store.forms.find((f) => f.slug === slug);
    if (!form) {
      throw new ApiError(404, "FORM_NOT_FOUND", "Form configuration not found.");
    }
    return jsonSuccess({
      id: form.id,
      slug: form.slug,
      title: form.title,
      description: form.description,
      version: form.version,
      fields: [...form.fields].sort((a, b) => a.sortOrder - b.sortOrder),
      updatedAt: form.updatedAt,
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
