import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/server/auth";
import { recordAuditLog } from "@/server/audit";
import { getStore } from "@/server/db/client";
import { ApiError, handleRouteError, jsonSuccess } from "@/server/security/http";
import { updateFormConfigSchema } from "@/services/forms/forms.schema";

export async function PUT(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const admin = await requireAdmin();
    const { slug } = await context.params;
    const body = await request.json();
    const parsed = updateFormConfigSchema.parse(body);

    const store = getStore();
    const form = store.forms.find((f) => f.slug === slug);
    if (!form) {
      throw new ApiError(404, "FORM_NOT_FOUND", "Form not found.");
    }

    // Enforce system field immutability (system fields cannot be deleted or have their key changed)
    const existingSystemKeys = form.fields
      .filter((f) => f.isSystem)
      .map((f) => f.key);
    for (const sysKey of existingSystemKeys) {
      if (!parsed.fields.some((f) => f.key === sysKey)) {
        throw new ApiError(
          400,
          "SYSTEM_FIELD_REMOVED",
          `System field "${sysKey}" cannot be removed. You may edit its label or help text.`,
        );
      }
    }

    const beforeVersion = form.version;
    form.title = parsed.title;
    form.description = parsed.description;
    form.version += 1;
    form.fields = parsed.fields.map((field, idx) => ({
      ...field,
      isSystem: existingSystemKeys.includes(field.key) || field.isSystem,
      sortOrder: idx + 1,
    }));
    form.updatedAt = new Date().toISOString();

    recordAuditLog({
      actorId: admin.id,
      actorEmail: admin.email,
      actorRole: admin.role,
      action: "form.published",
      entity: "form",
      entityId: form.id,
      summary: `Published Form v${form.version} (from v${beforeVersion}) for "${form.slug}"`,
    });

    revalidatePath("/contact");
    revalidatePath("/custom-fit");
    revalidatePath("/checkout");

    return jsonSuccess(form);
  } catch (err) {
    return handleRouteError(err);
  }
}
