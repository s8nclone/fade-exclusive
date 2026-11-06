import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/server/auth";
import { recordAuditLog } from "@/server/audit";
import { getStore } from "@/server/db/client";
import { sendTransactionalEmail } from "@/server/email";
import { handleRouteError, jsonSuccess } from "@/server/security/http";
import { updateSettingsSchema } from "@/services/settings/settings.schema";

export async function GET() {
  try {
    await requireAdmin();
    const store = getStore();
    return jsonSuccess({
      ...store.settings,
      bankAccounts: [...store.bankAccounts].sort((a, b) => a.sortOrder - b.sortOrder),
    });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const parsed = updateSettingsSchema.parse(body);

    const store = getStore();
    const before = { ...store.settings };

    store.settings = {
      ...store.settings,
      businessName: parsed.businessName,
      tagline: parsed.tagline,
      contactEmail: parsed.contactEmail,
      whatsappNumber: parsed.whatsappNumber,
      address: parsed.address,
      currency: parsed.currency,
      defaultPhoneCountry: parsed.defaultPhoneCountry,
      paymentWindowHours: parsed.paymentWindowHours,
      orderPrefix: parsed.orderPrefix,
      largeDiscountAlertThresholdPercent: parsed.largeDiscountAlertThresholdPercent,
      storePaused: parsed.storePaused,
      storePausedMessage: parsed.storePausedMessage,
      shippingOptions: parsed.shippingOptions,
      updatedAt: new Date().toISOString(),
    };

    recordAuditLog({
      actorId: admin.id,
      actorEmail: admin.email,
      actorRole: admin.role,
      action: "settings.updated",
      entity: "settings",
      entityId: "singleton",
      summary: `Updated store settings (storePaused=${store.settings.storePaused})`,
      beforeJson: before,
      afterJson: store.settings,
    });

    if (before.storePaused !== store.settings.storePaused) {
      void sendTransactionalEmail({
        to: store.settings.contactEmail,
        subject: `[Fadé Exclusive] Store Pause Mode ${store.settings.storePaused ? "ENABLED" : "DISABLED"}`,
        text: `Store pause status was changed to ${store.settings.storePaused} by ${admin.email}.`,
        html: `<p>Store pause status was changed to <strong>${store.settings.storePaused}</strong> by <strong>${admin.email}</strong>.</p>`,
      });
    }

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/checkout");

    return jsonSuccess({
      ...store.settings,
      bankAccounts: [...store.bankAccounts].sort((a, b) => a.sortOrder - b.sortOrder),
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
