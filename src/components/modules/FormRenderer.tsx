"use client";

import * as React from "react";
import { Upload, Check, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export interface DynamicRenderField {
  key: string;
  label: string;
  type:
    | "text"
    | "textarea"
    | "number"
    | "email"
    | "phone"
    | "select"
    | "radio"
    | "checkbox"
    | "checkbox_group"
    | "date"
    | "measurement"
    | "image";
  placeholder?: string;
  helpText?: string;
  helpImageUrl?: string;
  required: boolean;
  options?: string[];
  min?: number;
  max?: number;
  width: "full" | "half";
  sortOrder: number;
  isVisible: boolean;
  isSystem: boolean;
}

export interface FormRendererProps {
  fields: DynamicRenderField[];
  values: Record<string, unknown>;
  fieldErrors?: Record<string, string[]>;
  onChange: (key: string, value: unknown) => void;
  onSubmit?: (e: React.FormEvent) => void;
  onUploadPrivateImage?: (file: File, fieldKey: string) => Promise<string>;
  submitLabel?: string;
  isSubmitting?: boolean;
  embedded?: boolean;
  className?: string;
}

/**
 * Computes effective column widths for a list of fields so that an unpaired
 * "half" field never leaves an awkward empty half-row gap.
 */
function computeBalancedColSpans(fields: DynamicRenderField[]): Map<string, "full" | "half"> {
  const result = new Map<string, "full" | "half">();
  let pendingHalfKey: string | null = null;

  for (const field of fields) {
    if (field.width === "half") {
      if (pendingHalfKey === null) {
        pendingHalfKey = field.key;
      } else {
        result.set(pendingHalfKey, "half");
        result.set(field.key, "half");
        pendingHalfKey = null;
      }
    } else {
      if (pendingHalfKey !== null) {
        // Promote an unpaired half field before a full-width field to full width
        result.set(pendingHalfKey, "full");
        pendingHalfKey = null;
      }
      result.set(field.key, "full");
    }
  }

  if (pendingHalfKey !== null) {
    result.set(pendingHalfKey, "full");
  }

  return result;
}

export function FormRenderer({
  fields,
  values,
  fieldErrors = {},
  onChange,
  onSubmit,
  onUploadPrivateImage,
  submitLabel = "Submit Inquiry",
  isSubmitting = false,
  embedded = false,
  className,
}: FormRendererProps) {
  const [uploadingKey, setUploadingKey] = React.useState<string | null>(null);
  const visibleFields = [...fields]
    .filter((f) => f.isVisible)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const hasMeasurements = visibleFields.some((f) => f.type === "measurement");

  const renderControl = (field: DynamicRenderField, fieldId: string, errMsg?: string) => {
    if (
      field.type === "text" ||
      field.type === "email" ||
      field.type === "phone" ||
      field.type === "date" ||
      field.type === "number"
    ) {
      return (
        <Input
          id={fieldId}
          type={
            field.type === "phone"
              ? "tel"
              : field.type === "number"
                ? "number"
                : field.type === "date"
                  ? "date"
                  : field.type === "email"
                    ? "email"
                    : "text"
          }
          placeholder={field.placeholder}
          min={field.min}
          max={field.max}
          value={String(values[field.key] ?? "")}
          onChange={(e) =>
            onChange(
              field.key,
              field.type === "number" ? Number(e.target.value) : e.target.value,
            )
          }
          aria-invalid={Boolean(errMsg)}
          aria-describedby={errMsg ? `${fieldId}-err` : undefined}
        />
      );
    }

    if (field.type === "textarea") {
      return (
        <Textarea
          id={fieldId}
          placeholder={field.placeholder}
          value={String(values[field.key] ?? "")}
          onChange={(e) => onChange(field.key, e.target.value)}
          aria-invalid={Boolean(errMsg)}
          aria-describedby={errMsg ? `${fieldId}-err` : undefined}
          className="min-h-[120px]"
        />
      );
    }

    if (field.type === "select") {
      const opts = (field.options ?? []).map((opt) => ({
        value: opt,
        label: opt,
      }));
      if (opts.length >= 5) {
        return (
          <Combobox
            id={fieldId}
            value={String(values[field.key] ?? "")}
            onValueChange={(val) => onChange(field.key, val)}
            placeholder={`Search or select ${field.label}...`}
            options={opts}
            aria-label={field.label}
            aria-invalid={Boolean(errMsg)}
            aria-describedby={errMsg ? `${fieldId}-err` : undefined}
          />
        );
      }
      return (
        <Select
          id={fieldId}
          value={String(values[field.key] ?? "")}
          onValueChange={(val) => onChange(field.key, val)}
          placeholder={`Select ${field.label}...`}
          options={opts}
          aria-label={field.label}
          aria-invalid={Boolean(errMsg)}
          aria-describedby={errMsg ? `${fieldId}-err` : undefined}
        />
      );
    }

    if (field.type === "radio") {
      return (
        <div className="flex flex-wrap gap-3">
          {(field.options ?? []).map((opt) => {
            const checked = values[field.key] === opt;
            return (
              <label
                key={opt}
                className={cn(
                  "inline-flex min-h-[44px] cursor-pointer items-center gap-2 border px-4 py-2 text-xs font-medium",
                  checked
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-surface-elevated text-foreground",
                )}
              >
                <input
                  type="radio"
                  name={field.key}
                  value={opt}
                  checked={checked}
                  onChange={() => onChange(field.key, opt)}
                  className="sr-only"
                />
                <span>{opt}</span>
              </label>
            );
          })}
        </div>
      );
    }

    if (field.type === "checkbox") {
      return (
        <label className="inline-flex min-h-[44px] cursor-pointer items-center gap-2.5 text-sm text-foreground">
          <input
            id={fieldId}
            type="checkbox"
            checked={Boolean(values[field.key])}
            onChange={(e) => onChange(field.key, e.target.checked)}
            className="h-4 w-4 accent-primary"
          />
          <span>{field.placeholder || field.label}</span>
        </label>
      );
    }

    if (field.type === "checkbox_group") {
      return (
        <div className="flex flex-wrap gap-3">
          {(field.options ?? []).map((opt) => {
            const currentArr = Array.isArray(values[field.key])
              ? (values[field.key] as string[])
              : [];
            const isChecked = currentArr.includes(opt);
            return (
              <label
                key={opt}
                className="inline-flex min-h-[42px] cursor-pointer items-center gap-2 border border-border bg-surface-elevated px-3.5 py-2 text-xs"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onChange(field.key, [...currentArr, opt]);
                    } else {
                      onChange(
                        field.key,
                        currentArr.filter((item) => item !== opt),
                      );
                    }
                  }}
                  className="h-4 w-4 accent-primary"
                />
                <span>{opt}</span>
              </label>
            );
          })}
        </div>
      );
    }

    if (field.type === "measurement") {
      return (
        <div className="flex items-center gap-2">
          <Input
            id={fieldId}
            type="number"
            step="0.5"
            min={field.min}
            max={field.max}
            placeholder={field.placeholder || "e.g. 42"}
            value={
              typeof values[field.key] === "object" && values[field.key] !== null
                ? String((values[field.key] as { value?: number }).value ?? "")
                : ""
            }
            onChange={(e) => {
              const prevUnit =
                typeof values[field.key] === "object" && values[field.key] !== null
                  ? ((values[field.key] as { unit?: "cm" | "in" }).unit ?? "cm")
                  : "cm";
              onChange(field.key, {
                value: e.target.value ? Number(e.target.value) : undefined,
                unit: prevUnit,
              });
            }}
            className="flex-1 bg-background"
          />
          <Select
            aria-label={`${field.label} unit`}
            size="compact"
            searchable={false}
            align="right"
            className="w-[82px] shrink-0"
            value={
              typeof values[field.key] === "object" && values[field.key] !== null
                ? ((values[field.key] as { unit?: "cm" | "in" }).unit ?? "cm")
                : "cm"
            }
            onValueChange={(nextUnit) => {
              const prevVal =
                typeof values[field.key] === "object" && values[field.key] !== null
                  ? (values[field.key] as { value?: number }).value
                  : undefined;
              onChange(field.key, {
                value: prevVal,
                unit: nextUnit === "in" ? "in" : "cm",
              });
            }}
            options={[
              { value: "cm", label: "CM" },
              { value: "in", label: "IN" },
            ]}
          />
        </div>
      );
    }

    if (field.type === "image") {
      return (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <label
              htmlFor={fieldId}
              className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 border border-border bg-surface px-4 py-2 text-xs font-medium uppercase tracking-wider text-foreground hover:bg-muted"
            >
              <Upload className="h-4 w-4 text-accent" />
              <span>
                {uploadingKey === field.key
                  ? "Encrypting & Uploading..."
                  : values[field.key]
                    ? "Replace Reference Image"
                    : "Upload Reference Image"}
              </span>
            </label>
            <input
              id={fieldId}
              type="file"
              accept="image/webp,image/jpeg,image/png"
              className="sr-only"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (onUploadPrivateImage) {
                  setUploadingKey(field.key);
                  try {
                    const url = await onUploadPrivateImage(file, field.key);
                    onChange(field.key, url);
                  } finally {
                    setUploadingKey(null);
                  }
                } else {
                  onChange(
                    field.key,
                    `/brand/logo-mark.jpg?file=${encodeURIComponent(file.name)}`,
                  );
                }
              }}
            />
            {Boolean(values[field.key]) && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
                <Check className="h-4 w-4" /> Attached to Private Vault
              </span>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  /**
   * Renders a group of standard (non-measurement) fields with:
   * - Label at the top
   * - Input directly below the label (`mt-1.5`) so sibling inputs on the same row align horizontally
   * - `helpText` caption underneath the input (`mt-1.5`) so varying description lengths never push inputs out of alignment
   */
  const renderStandardFieldGrid = (groupFields: DynamicRenderField[]) => {
    const colSpanMap = computeBalancedColSpans(groupFields);

    return (
      <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
        {groupFields.map((field) => {
          const errList = fieldErrors[field.key];
          const errMsg = errList?.[0];
          const effectiveWidth = colSpanMap.get(field.key) ?? field.width;
          const colSpan =
            effectiveWidth === "half" ? "sm:col-span-1" : "sm:col-span-2";
          const fieldId = `dyn-field-${field.key}`;

          return (
            <div key={field.key} className={cn("flex flex-col", colSpan)}>
              <label
                htmlFor={fieldId}
                className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground leading-snug"
              >
                {field.label}
                {field.required && <span className="ml-1 text-accent">*</span>}
              </label>

              <div className="mt-2">{renderControl(field, fieldId, errMsg)}</div>

              {field.helpText && (
                <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                  {field.helpText}
                </p>
              )}

              {errMsg && (
                <p
                  id={`${fieldId}-err`}
                  role="alert"
                  className="mt-1.5 text-xs font-medium text-destructive"
                >
                  {errMsg}
                </p>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  /**
   * Renders measurement fields inside equal-height Atelier Measurement Cards
   * where the title + fitting instruction sit at the top and the input bar is
   * anchored at the bottom (`mt-auto pt-3`) for 100% horizontal alignment.
   */
  const renderMeasurementCardGrid = (measurementFields: DynamicRenderField[]) => {
    const colSpanMap = computeBalancedColSpans(measurementFields);

    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 items-stretch">
        {measurementFields.map((field) => {
          const errList = fieldErrors[field.key];
          const errMsg = errList?.[0];
          const effectiveWidth = colSpanMap.get(field.key) ?? field.width;
          const colSpan =
            effectiveWidth === "half" ? "sm:col-span-1" : "sm:col-span-2";
          const fieldId = `dyn-field-${field.key}`;

          return (
            <div
              key={field.key}
              className={cn(
                "flex h-full flex-col justify-between border border-border bg-surface p-4",
                colSpan,
              )}
            >
              <div>
                <label
                  htmlFor={fieldId}
                  className="block text-xs font-semibold uppercase tracking-[0.14em] text-foreground leading-snug"
                >
                  {field.label}
                  {field.required && <span className="ml-1 text-accent">*</span>}
                </label>

                {field.helpText && (
                  <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                    {field.helpText}
                  </p>
                )}
              </div>

              <div className="mt-auto pt-3">
                {renderControl(field, fieldId, errMsg)}

                {errMsg && (
                  <p
                    id={`${fieldId}-err`}
                    role="alert"
                    className="mt-1.5 text-xs font-medium text-destructive"
                  >
                    {errMsg}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  let bodyContent: React.ReactNode;

  if (hasMeasurements) {
    const firstMeasIdx = visibleFields.findIndex((f) => f.type === "measurement");
    let lastMeasIdx = firstMeasIdx;
    visibleFields.forEach((f, idx) => {
      if (f.type === "measurement") lastMeasIdx = idx;
    });

    const leadingFields = visibleFields.slice(0, firstMeasIdx);
    const middleSlice = visibleFields.slice(firstMeasIdx, lastMeasIdx + 1);
    const measurementFields = middleSlice.filter((f) => f.type === "measurement");
    const nonMeasurementMiddle = middleSlice.filter(
      (f) => f.type !== "measurement",
    );
    const trailingFields = [
      ...nonMeasurementMiddle,
      ...visibleFields.slice(lastMeasIdx + 1),
    ];

    bodyContent = (
      <div className={cn("space-y-8", className)}>
        {leadingFields.length > 0 && (
          <div className="space-y-4">
            <div className="border-b border-border pb-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
                01 — Client &amp; Occasion Details
              </p>
            </div>
            {renderStandardFieldGrid(leadingFields)}
          </div>
        )}

        {measurementFields.length > 0 && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
              <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
                <Ruler className="h-3.5 w-3.5" />
                <span>02 — Body Proportions &amp; Measurements</span>
              </p>
              <span className="text-[11px] text-muted-foreground">
                Select <strong>cm</strong> or <strong>in</strong> per measurement
              </span>
            </div>
            {renderMeasurementCardGrid(measurementFields)}
          </div>
        )}

        {trailingFields.length > 0 && (
          <div className="space-y-4">
            <div className="border-b border-border pb-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
                03 — Styling Notes &amp; Reference Vault
              </p>
            </div>
            {renderStandardFieldGrid(trailingFields)}
          </div>
        )}

        {!embedded && (
          <div className="border-t border-border pt-4">
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? "Submitting to Atelier..." : submitLabel}
            </Button>
          </div>
        )}
      </div>
    );
  } else {
    bodyContent = (
      <div className={cn("space-y-6", className)}>
        {renderStandardFieldGrid(visibleFields)}

        {!embedded && (
          <div className="pt-2">
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? "Submitting to Atelier..." : submitLabel}
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (embedded) {
    return bodyContent;
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      {bodyContent}
    </form>
  );
}
