"use client";

import * as React from "react";
import {
  CheckCircle2,
  Scissors,
  ShieldCheck,
  Sparkles,
  MapPin,
  Mail,
  MessageCircle,
} from "lucide-react";
import {
  usePublicForm,
  useSubmitPublicFormMutation,
} from "@/services/forms/forms.hooks";
import { buildDynamicFormZodSchema } from "@/services/forms/forms.schema";
import { mediaService } from "@/services/media/media.service";
import { FormRenderer } from "@/components/modules/FormRenderer";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

function DynamicFormSection({
  slug,
  defaultValues = {},
}: {
  slug: "contact" | "custom-fit";
  defaultValues?: Record<string, unknown>;
}) {
  const { data: formConfig, isLoading } = usePublicForm(slug);
  const submitMutation = useSubmitPublicFormMutation(slug);

  const [values, setValues] = React.useState<Record<string, unknown>>(defaultValues);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({});
  const [submittedRef, setSubmittedRef] = React.useState<{
    referenceNumber: string;
    message: string;
  } | null>(null);

  if (isLoading || !formConfig) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (submittedRef) {
    return (
      <div className="border border-border bg-surface p-8 text-center space-y-4">
        <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
          REFERENCE: {submittedRef.referenceNumber}
        </p>
        <h3 className="font-serif text-2xl font-normal">
          Inquiry Received by the Atelier
        </h3>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">
          {submittedRef.message}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSubmittedRef(null);
            setValues({});
          }}
        >
          Submit Another Request
        </Button>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const dynamicSchema = buildDynamicFormZodSchema(formConfig.fields);
    const parsed = dynamicSchema.safeParse(values);

    if (!parsed.success) {
      const errs: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        errs[key] = [...(errs[key] ?? []), issue.message];
      }
      setFieldErrors(errs);
      return;
    }

    submitMutation.mutate(
      { answers: parsed.data, turnstileToken: "demo-turnstile-ok" },
      {
        onSuccess: (res) => {
          setSubmittedRef({
            referenceNumber: res.customRequestNumber ?? res.submissionId,
            message: res.message,
          });
        },
      },
    );
  };

  return (
    <div>
      {formConfig.description && (
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
          {formConfig.description}
        </p>
      )}
      <FormRenderer
        fields={formConfig.fields}
        values={values}
        fieldErrors={fieldErrors}
        onChange={(key, val) =>
          setValues((prev) => ({
            ...prev,
            [key]: val,
          }))
        }
        onUploadPrivateImage={async (file) => {
          const mimeType =
            file.type === "image/png" || file.type === "image/webp"
              ? file.type
              : "image/jpeg";
          const signed = await mediaService.signUpload({
            mimeType,
            sizeBytes: file.size || 10240,
            bucketKind: "private",
            altText: file.name,
          });
          await mediaService.confirmUpload({
            bucketKind: "private",
            objectKey: signed.objectKey,
            publicUrl: signed.publicUrl,
            mimeType,
            sizeBytes: file.size || 10240,
            altText: file.name,
          });
          return signed.publicUrl;
        }}
        onSubmit={handleSubmit}
        isSubmitting={submitMutation.isPending}
        submitLabel={
          slug === "custom-fit"
            ? "Submit Bespoke Commission Request"
            : "Send Message to Atelier"
        }
      />
    </div>
  );
}

export function CustomFitContainer() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8 sm:py-16">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-accent">
            ATELIER BESPOKE SERVICE
          </p>
          <h1 className="font-serif text-4xl font-normal uppercase sm:text-5xl">
            Custom Fit &amp; Bespoke Commissions
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Whether commissioning a ceremonial three-piece Agbada, a custom Senator
            tunic set, or an occasion silhouette tailored to your exact proportions,
            our Master Tailor reviews every measurement personally.
          </p>

          <div className="space-y-4 border-t border-border pt-6">
            <div className="flex items-start gap-3">
              <Scissors className="mt-0.5 h-4 w-4 text-accent shrink-0" />
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider">
                  1. Submit Your Proportions &amp; Occasion
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Provide your measurements in cm or inches and select your preferred
                  garment archetype.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-4 w-4 text-accent shrink-0" />
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider">
                  2. Receive Your Tailored Quote &amp; Deposit Link
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Within 24 hours, our concierge sends a formal quote and converts
                  your commission into a tracked Atelier Order.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 text-accent shrink-0" />
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider">
                  3. Hand-Crafted in Abuja &amp; Delivered Worldwide
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Track every milestone from fabric cutting to hand-embroidery and
                  DHL Express dispatch.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 border border-border bg-surface-elevated p-6 sm:p-10">
          <h2 className="mb-2 font-serif text-2xl font-normal uppercase">
            Bespoke Commission Form
          </h2>
          <DynamicFormSection slug="custom-fit" />
        </div>
      </div>
    </div>
  );
}

export function ContactContainer() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5 space-y-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-accent">
            CLIENT CONCIERGE &amp; SHOWROOM
          </p>
          <h1 className="font-serif text-4xl font-normal uppercase sm:text-5xl">
            Contact The Atelier
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            For private fitting appointments in Maitama, Abuja, international
            stockist inquiries, press loans, or order assistance.
          </p>

          <div className="space-y-4 border-t border-border pt-6 text-xs">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 text-accent" />
              <div>
                <p className="font-semibold uppercase tracking-wider">
                  Abuja Flagship Atelier
                </p>
                <p className="mt-1 text-muted-foreground">
                  Plot 1042, Ademola Adetokunbo Crescent, Maitama, Abuja, Nigeria
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 text-accent" />
              <div>
                <p className="font-semibold uppercase tracking-wider">
                  Direct Concierge Email
                </p>
                <p className="mt-1 text-muted-foreground">
                  atelier@fadeexclusive.com
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MessageCircle className="mt-0.5 h-4 w-4 text-accent" />
              <div>
                <p className="font-semibold uppercase tracking-wider">
                  WhatsApp Concierge
                </p>
                <p className="mt-1 text-muted-foreground">+234 809 000 3233</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 border border-border bg-surface-elevated p-6 sm:p-10">
          <h2 className="mb-4 font-serif text-2xl font-normal uppercase">
            Send an Inquiry
          </h2>
          <DynamicFormSection slug="contact" />
        </div>
      </div>
    </div>
  );
}
