import { getStore } from "@/server/db/client";
import {
  enforceRateLimit,
  getClientIp,
  verifyTurnstileToken,
} from "@/server/rate-limit";
import { generateOrderNumber, sanitizePlainText } from "@/server/security/crypto";
import { ApiError, handleRouteError, jsonSuccess } from "@/server/security/http";
import { buildDynamicFormZodSchema } from "@/services/forms/forms.schema";

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    enforceRateLimit({
      keyPrefix: "public-form-submit",
      identifier: getClientIp(request),
      limit: 10,
      windowSeconds: 60,
    });

    const { slug } = await context.params;
    const store = getStore();
    const form = store.forms.find((f) => f.slug === slug);
    if (!form) {
      throw new ApiError(404, "FORM_NOT_FOUND", "Form not found.");
    }

    const body = (await request.json()) as {
      answers?: Record<string, unknown>;
      turnstileToken?: string;
    };

    const turnstileOk = await verifyTurnstileToken(body.turnstileToken);
    if (!turnstileOk) {
      throw new ApiError(400, "BOT_CHECK_FAILED", "Security verification failed.");
    }

    const dynamicSchema = buildDynamicFormZodSchema(form.fields);
    const validatedAnswers = dynamicSchema.parse(body.answers ?? {});

    const nowIso = new Date().toISOString();
    const submissionId = `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    const customerName = String(
      validatedAnswers.fullName ?? validatedAnswers.customerName ?? "Guest Client",
    );
    const customerEmail = String(
      validatedAnswers.email ?? validatedAnswers.customerEmail ?? "",
    );
    const customerPhone = String(
      validatedAnswers.phone ?? validatedAnswers.customerPhone ?? "",
    );

    store.formSubmissions.unshift({
      id: submissionId,
      formId: form.id,
      formSlug: form.slug,
      formVersion: form.version,
      schemaSnapshot: structuredClone(form.fields),
      answers: validatedAnswers,
      customerName: sanitizePlainText(customerName),
      customerEmail: sanitizePlainText(customerEmail),
      customerPhone: sanitizePlainText(customerPhone),
      status: "new",
      createdAt: nowIso,
    });

    if (form.slug === "custom-fit") {
      const requestNumber = generateOrderNumber("CF");
      const measurements: Record<string, { value: number; unit: "cm" | "in" }> = {};

      for (const field of form.fields) {
        if (field.type === "measurement") {
          const val = validatedAnswers[field.key] as
            | { value?: number; unit?: "cm" | "in" }
            | undefined;
          if (val && typeof val.value === "number") {
            measurements[field.key] = {
              value: val.value,
              unit: val.unit === "in" ? "in" : "cm",
            };
          }
        }
      }

      const refImg = validatedAnswers.referenceImageUrl
        ? [String(validatedAnswers.referenceImageUrl)]
        : [];

      store.customRequests.unshift({
        id: `cr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        requestNumber,
        submissionId,
        customerName: sanitizePlainText(customerName),
        customerEmail: sanitizePlainText(customerEmail),
        customerPhone: sanitizePlainText(customerPhone),
        occasion: sanitizePlainText(String(validatedAnswers.occasion ?? "Bespoke Commission")),
        eventDate: validatedAnswers.eventDate ? String(validatedAnswers.eventDate) : null,
        budgetRange: validatedAnswers.budgetRange
          ? String(validatedAnswers.budgetRange)
          : null,
        styleNotes: sanitizePlainText(String(validatedAnswers.styleNotes ?? "")),
        measurements,
        referenceImageUrls: refImg,
        preferredContact: String(validatedAnswers.preferredContact ?? "WhatsApp"),
        status: "new",
        quoteMinor: null,
        depositMinor: null,
        currency: store.settings.currency,
        estimatedCompletion: null,
        adminNotes: null,
        convertedOrderId: null,
        formVersionSnapshot: structuredClone(form.fields),
        createdAt: nowIso,
        updatedAt: nowIso,
      });

      return jsonSuccess(
        {
          submissionId,
          customRequestNumber: requestNumber,
          message: `Thank you! Your Custom Fit inquiry (${requestNumber}) has been received by our Abuja Atelier.`,
        },
        { status: 201 },
      );
    }

    return jsonSuccess(
      {
        submissionId,
        message:
          "Thank you for contacting Fadé Exclusive. Our client concierge will respond shortly.",
      },
      { status: 201 },
    );
  } catch (err) {
    return handleRouteError(err);
  }
}
