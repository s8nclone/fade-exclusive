import { getStore } from "@/server/db/client";
import { handleRouteError, jsonSuccess } from "@/server/security/http";

export async function GET() {
  try {
    const store = getStore();
    const s = store.settings;
    return jsonSuccess({
      businessName: s.businessName,
      tagline: s.tagline,
      contactEmail: s.contactEmail,
      whatsappNumber: s.whatsappNumber,
      address: s.address,
      currency: s.currency,
      defaultPhoneCountry: s.defaultPhoneCountry,
      paymentWindowHours: s.paymentWindowHours,
      storePaused: s.storePaused,
      storePausedMessage: s.storePausedMessage,
      shippingOptions: s.shippingOptions.filter((opt) => opt.isActive),
      socialLinks: s.socialLinks,
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
