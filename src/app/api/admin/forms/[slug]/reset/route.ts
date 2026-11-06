import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/server/auth";
import { recordAuditLog } from "@/server/audit";
import { getStore } from "@/server/db/client";
import { createInitialSeedStore } from "@/server/db/seed-data";
import { ApiError, handleRouteError, jsonSuccess } from "@/server/security/http";

export async function POST(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const admin = await requireAdmin();
    const { slug } = await context.params;
    const store = getStore();
    const form = store.forms.find((f) => f.slug === slug);
    const defaultForm = createInitialSeedStore().forms.find((f) => f.slug === slug);

    if (!form || !defaultForm) {
      throw new ApiError(404, "FORM_NOT_FOUND", "Form not found.");
    }

    form.title = defaultForm.title;
    form.description = defaultForm.description;
    form.fields = structuredClone(defaultForm.fields);
    form.version += 1;
    form.updatedAt = new Date().toISOString();

    recordAuditLog({
      actorId: admin.id,
      actorEmail: admin.email,
      actorRole: admin.role,
      action: "form.reset_defaults",
      entity: "form",
      entityId: form.id,
      summary: `Reset form "${form.slug}" to factory defaults (v${form.version})`,
    });

    revalidatePath("/contact");
    revalidatePath("/custom-fit");
    revalidatePath("/checkout");

    return jsonSuccess(form);
  } catch (err) {
    return handleRouteError(err);
  }
}
