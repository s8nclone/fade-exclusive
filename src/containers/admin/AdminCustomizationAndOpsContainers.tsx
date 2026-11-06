"use client";

import * as React from "react";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Plus,
  RotateCcw,
  ShieldAlert,
  Trash2,
  Upload,
} from "lucide-react";
import {
  useAdminBanners,
  useUpdateBannerMutation,
} from "@/services/banners/banners.hooks";
import {
  useAdminForms,
  useResetFormConfigMutation,
  useUpdateFormConfigMutation,
  useAdminSubmissions,
} from "@/services/forms/forms.hooks";
import type { FormFieldConfig } from "@/services/forms/forms.schema";
import {
  useAdminCustomRequests,
  useConvertCustomRequestMutation,
  useQuoteCustomRequestMutation,
} from "@/services/custom-requests/custom-requests.hooks";
import {
  useAdminCollections,
  useCreateCollectionMutation,
} from "@/services/collections/collections.hooks";
import {
  useAdminContentBundle,
  useUpdateContentPageMutation,
} from "@/services/content/content.hooks";
import {
  useAdminMedia,
  useDeleteMediaMutation,
  useUploadMediaMutation,
} from "@/services/media/media.hooks";
import {
  useAdminSettings,
  useUpdateSettingsMutation,
  useUpsertBankAccountMutation,
} from "@/services/settings/settings.hooks";
import {
  useAdminUsers,
  useCreateAdminUserMutation,
} from "@/services/users/users.hooks";
import { useAdminAuditLogs } from "@/services/audit/audit.hooks";
import { BRAND_COLOR_SWATCHES } from "@/lib/constants";
import { getContrastRatio, meetsWcagAA } from "@/lib/contrast";
import { ColorSwatch } from "@/components/atoms/ColorSwatch";
import { BannerBar } from "@/components/modules/BannerBar";
import {
  DataTable,
  type DataTableColumnDef,
} from "@/components/modules/DataTable";
import { FormRenderer } from "@/components/modules/FormRenderer";
import { Price } from "@/components/atoms/Price";
import { StatusBadge } from "@/components/atoms/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog } from "@/components/ui/dialog";
import { formatDateTime } from "@/lib/format/date";

/* ============================================================================
 * 1. ADMIN BANNERS & SOLID COLOR CUSTOMIZATION (Section 12.1)
 * ========================================================================== */
export function AdminBannersContainer() {
  const { data: banners = [], isLoading } = useAdminBanners();
  const updateMutation = useUpdateBannerMutation();
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const activeBanner =
    banners.find((b) => b.id === selectedId) ?? banners[0] ?? null;

  const [title, setTitle] = React.useState("");
  const [subtitle, setSubtitle] = React.useState("");
  const [ctaLabel, setCtaLabel] = React.useState("");
  const [ctaUrl, setCtaUrl] = React.useState("");
  const [backgroundColor, setBackgroundColor] = React.useState("#161412");
  const [textColor, setTextColor] = React.useState("#F4F1EA");
  const [buttonBgColor, setButtonBgColor] = React.useState("#9E7344");
  const [buttonTextColor, setButtonTextColor] = React.useState("#161412");

  React.useEffect(() => {
    if (activeBanner) {
      setTitle(activeBanner.title);
      setSubtitle(activeBanner.subtitle ?? "");
      setCtaLabel(activeBanner.ctaLabel ?? "");
      setCtaUrl(activeBanner.ctaUrl ?? "");
      setBackgroundColor(activeBanner.backgroundColor);
      setTextColor(activeBanner.textColor);
      setButtonBgColor(activeBanner.buttonBgColor);
      setButtonTextColor(activeBanner.buttonTextColor);
    }
  }, [activeBanner]);

  const ratio = getContrastRatio(backgroundColor, textColor);
  const contrastValid = meetsWcagAA(backgroundColor, textColor);

  if (isLoading) {
    return <p className="text-xs text-muted-foreground">Loading banners...</p>;
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-border pb-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-accent">
          SOLID COLOR CUSTOMIZATION &amp; WCAG 2.2 AA GUARDRAILS
        </p>
        <h1 className="mt-1 font-serif text-3xl font-normal uppercase">
          Banners &amp; Solid Color Palette
        </h1>
      </div>

      {/* BANNER SELECTOR */}
      <div className="flex flex-wrap gap-3">
        {banners.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => setSelectedId(b.id)}
            className={`min-h-[42px] border px-4 py-2 text-xs font-semibold uppercase tracking-wider ${
              activeBanner?.id === b.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-surface-elevated text-foreground"
            }`}
          >
            {b.type.replace(/_/g, " ")} ({b.isActive ? "Active" : "Off"})
          </button>
        ))}
      </div>

      {activeBanner && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* EDITOR */}
          <div className="lg:col-span-6 border border-border bg-surface-elevated p-6 space-y-5 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="font-serif text-xl uppercase">
                Configure {activeBanner.type.replace(/_/g, " ")}
              </h2>
              <Switch
                checked={activeBanner.isActive}
                onCheckedChange={(checked) =>
                  updateMutation.mutate({
                    id: activeBanner.id,
                    input: { isActive: checked },
                  })
                }
                aria-label="Toggle banner active status"
              />
            </div>

            <div>
              <label className="font-semibold uppercase tracking-wider">
                Headline Copy *
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1.5"
              />
            </div>

            <div>
              <label className="font-semibold uppercase tracking-wider">
                Subtitle Copy
              </label>
              <Input
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="mt-1.5"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold uppercase tracking-wider">
                  CTA Button Label
                </label>
                <Input
                  value={ctaLabel}
                  onChange={(e) => setCtaLabel(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <label className="font-semibold uppercase tracking-wider">
                  CTA Link URL
                </label>
                <Input
                  value={ctaUrl}
                  onChange={(e) => setCtaUrl(e.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>

            {/* SOLID SWATCH PICKERS */}
            <div className="space-y-3 border-t border-border pt-4">
              <p className="font-semibold uppercase tracking-wider">
                Background Solid Color ({backgroundColor})
              </p>
              <div className="flex flex-wrap gap-2">
                {BRAND_COLOR_SWATCHES.map((sw) => (
                  <ColorSwatch
                    key={sw.hex}
                    hex={sw.hex}
                    label={sw.label}
                    selected={backgroundColor.toUpperCase() === sw.hex.toUpperCase()}
                    onSelect={(hex) => setBackgroundColor(hex)}
                  />
                ))}
              </div>
              <Input
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                placeholder="#161412"
                className="font-mono uppercase"
              />
            </div>

            <div className="space-y-3 border-t border-border pt-4">
              <p className="font-semibold uppercase tracking-wider">
                Foreground Text Solid Color ({textColor})
              </p>
              <div className="flex flex-wrap gap-2">
                {BRAND_COLOR_SWATCHES.map((sw) => (
                  <ColorSwatch
                    key={sw.hex}
                    hex={sw.hex}
                    label={sw.label}
                    selected={textColor.toUpperCase() === sw.hex.toUpperCase()}
                    onSelect={(hex) => setTextColor(hex)}
                  />
                ))}
              </div>
              <Input
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                placeholder="#F4F1EA"
                className="font-mono uppercase"
              />
            </div>

            {/* CONTRAST CHECK INDICATOR */}
            <div
              className={`border p-3.5 ${
                contrastValid
                  ? "border-success/40 bg-surface text-foreground"
                  : "border-destructive bg-surface text-destructive"
              }`}
            >
              <p className="font-semibold uppercase tracking-wider">
                WCAG 2.2 AA Contrast Ratio: {ratio.toFixed(2)}:1{" "}
                {contrastValid ? "✓ Passes (≥ 4.5:1)" : "✗ Fails (< 4.5:1)"}
              </p>
            </div>

            <Button
              disabled={!contrastValid || updateMutation.isPending}
              onClick={() =>
                updateMutation.mutate({
                  id: activeBanner.id,
                  input: {
                    title,
                    subtitle: subtitle || null,
                    ctaLabel: ctaLabel || null,
                    ctaUrl: ctaUrl || null,
                    backgroundColor,
                    textColor,
                    buttonBgColor,
                    buttonTextColor,
                  },
                })
              }
              className="w-full"
            >
              Save Solid Banner Configuration
            </Button>
          </div>

          {/* LIVE DESKTOP & MOBILE PREVIEW */}
          <div className="lg:col-span-6 space-y-6">
            <div className="border border-border bg-surface p-6 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Live Desktop Preview
              </p>
              <BannerBar
                banner={{
                  id: "preview-desktop",
                  type: activeBanner.type,
                  title,
                  subtitle,
                  ctaLabel,
                  ctaUrl,
                  backgroundColor,
                  textColor,
                  buttonBgColor,
                  buttonTextColor,
                  dismissible: false,
                  version: activeBanner.version,
                }}
              />
            </div>

            <div className="border border-border bg-surface p-6 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Live Mobile (375px) Preview
              </p>
              <div className="mx-auto max-w-[375px] border border-border">
                <BannerBar
                  banner={{
                    id: "preview-mobile",
                    type: activeBanner.type,
                    title,
                    subtitle,
                    ctaLabel,
                    ctaUrl,
                    backgroundColor,
                    textColor,
                    buttonBgColor,
                    buttonTextColor,
                    dismissible: false,
                    version: activeBanner.version,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================================
 * 2. ADMIN FORM BUILDER (Section 12.2)
 * ========================================================================== */
export function AdminFormsContainer() {
  const { data: forms = [], isLoading } = useAdminForms();
  const updateMutation = useUpdateFormConfigMutation();
  const resetMutation = useResetFormConfigMutation();

  const [selectedSlug, setSelectedSlug] = React.useState<string>("custom-fit");
  const activeForm = forms.find((f) => f.slug === selectedSlug) ?? forms[0];

  const [fields, setFields] = React.useState<FormFieldConfig[]>([]);
  const [newLabel, setNewLabel] = React.useState("");
  const [newType, setNewType] =
    React.useState<FormFieldConfig["type"]>("text");

  React.useEffect(() => {
    if (activeForm) {
      setFields([...activeForm.fields].sort((a, b) => a.sortOrder - b.sortOrder));
    }
  }, [activeForm]);

  if (isLoading || !activeForm) {
    return <p className="text-xs text-muted-foreground">Loading form builder...</p>;
  }

  const moveField = (idx: number, dir: -1 | 1) => {
    const next = [...fields];
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= next.length) return;
    const temp = next[idx]!;
    next[idx] = next[targetIdx]!;
    next[targetIdx] = temp;
    setFields(next.map((f, i) => ({ ...f, sortOrder: i + 1 })));
  };

  const addCustomField = () => {
    if (!newLabel.trim()) return;
    const key = newLabel
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "");
    setFields((prev) => [
      ...prev,
      {
        key: `${key}_${prev.length + 1}`,
        label: newLabel.trim(),
        type: newType,
        required: false,
        width: "full",
        sortOrder: prev.length + 1,
        isVisible: true,
        isSystem: false,
      },
    ]);
    setNewLabel("");
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-accent">
            VERSIONED SCHEMA CUSTOMIZATION
          </p>
          <h1 className="mt-1 font-serif text-3xl font-normal uppercase">
            Dynamic Form Builder
          </h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => resetMutation.mutate(activeForm.slug)}
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Reset to Defaults
          </Button>
          <Button
            size="sm"
            onClick={() =>
              updateMutation.mutate({
                slug: activeForm.slug,
                input: {
                  title: activeForm.title,
                  description: activeForm.description,
                  fields,
                },
              })
            }
          >
            Publish Form Version (v{activeForm.version + 1})
          </Button>
        </div>
      </div>

      {/* FORM TABS */}
      <div className="flex flex-wrap gap-2">
        {forms.map((f) => (
          <button
            key={f.slug}
            type="button"
            onClick={() => setSelectedSlug(f.slug)}
            className={`min-h-[42px] border px-4 py-2 text-xs font-semibold uppercase tracking-wider ${
              activeForm.slug === f.slug
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-surface-elevated"
            }`}
          >
            {f.title} (v{f.version})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* LEFT: FIELD LIST & ADD FIELD */}
        <div className="lg:col-span-6 space-y-4">
          {fields.map((field, idx) => (
            <div
              key={field.key}
              className="flex items-center justify-between gap-3 border border-border bg-surface-elevated p-4 text-xs"
            >
              <div>
                <p className="font-semibold">
                  {field.label}{" "}
                  <span className="font-mono text-[11px] text-muted-foreground">
                    [{field.type}]
                  </span>
                </p>
                {field.isSystem && (
                  <span className="text-[10px] uppercase tracking-wider text-accent">
                    Protected System Field
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={field.required}
                    disabled={field.isSystem}
                    onChange={(e) =>
                      setFields((prev) =>
                        prev.map((item, i) =>
                          i === idx ? { ...item, required: e.target.checked } : item,
                        ),
                      )
                    }
                  />
                  <span>Req</span>
                </label>
                <button
                  type="button"
                  onClick={() => moveField(idx, -1)}
                  className="border border-border p-1.5 hover:bg-muted"
                  aria-label="Move field up"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveField(idx, 1)}
                  className="border border-border p-1.5 hover:bg-muted"
                  aria-label="Move field down"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                {!field.isSystem && (
                  <button
                    type="button"
                    onClick={() =>
                      setFields((prev) => prev.filter((_, i) => i !== idx))
                    }
                    className="border border-border p-1.5 text-destructive hover:bg-muted"
                    aria-label="Remove field"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* ADD CUSTOM FIELD */}
          <div className="border border-border bg-surface p-4 space-y-3 text-xs">
            <p className="font-semibold uppercase tracking-wider">
              Add Custom Field
            </p>
            <div className="flex flex-wrap gap-2">
              <Input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="e.g. Agbada Cap Circumference"
                className="flex-1"
              />
              <Select
                aria-label="New field type"
                searchable={false}
                className="w-[210px]"
                value={newType}
                onValueChange={(val) =>
                  setNewType(val as FormFieldConfig["type"])
                }
                options={[
                  { value: "text", label: "Text" },
                  { value: "textarea", label: "Textarea" },
                  { value: "measurement", label: "Measurement (cm/in)" },
                  { value: "date", label: "Date" },
                ]}
              />
              <Button type="button" onClick={addCustomField}>
                <Plus className="mr-1 h-4 w-4" /> Add
              </Button>
            </div>
          </div>
        </div>

        {/* RIGHT: LIVE PREVIEW */}
        <div className="lg:col-span-6 border border-border bg-surface p-6">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-accent">
            Live Storefront Form Preview
          </p>
          <FormRenderer
            fields={fields}
            values={{}}
            onChange={() => {}}
            submitLabel="Preview Submit Button"
          />
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * 3. ADMIN SUBMISSIONS & CUSTOM FIT QUOTING / CONVERT TO ORDER (Section 9.3)
 * ========================================================================== */
export function AdminSubmissionsContainer() {
  const { data: customRequests = [] } = useAdminCustomRequests();
  const { data: submissions = [] } = useAdminSubmissions();
  const quoteMutation = useQuoteCustomRequestMutation();
  const convertMutation = useConvertCustomRequestMutation();

  const [quoteAmounts, setQuoteAmounts] = React.useState<Record<string, number>>(
    {},
  );
  const [depositAmounts, setDepositAmounts] = React.useState<
    Record<string, number>
  >({});

  return (
    <div className="space-y-10">
      <div className="border-b border-border pb-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-accent">
          BESPOKE COMMISSIONS &amp; CONCIERGE INBOX
        </p>
        <h1 className="mt-1 font-serif text-3xl font-normal uppercase">
          Custom Fit Commissions &amp; Form Inquiries
        </h1>
      </div>

      {/* CUSTOM FIT REQUESTS */}
      <div className="space-y-4">
        <h2 className="font-serif text-2xl uppercase">
          Custom Fit Requests ({customRequests.length})
        </h2>
        {customRequests.map((req) => (
          <div
            key={req.id}
            className="border border-border bg-surface-elevated p-6 space-y-4 text-xs"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-3">
              <div>
                <span className="font-mono text-base font-bold">
                  {req.requestNumber}
                </span>
                <span className="ml-3">
                  <StatusBadge status={req.status} />
                </span>
                <p className="mt-1 text-muted-foreground">
                  {req.customerName} ({req.customerEmail} • {req.customerPhone})
                </p>
              </div>
              {req.quoteMinor && (
                <div className="text-right">
                  <p className="uppercase text-muted-foreground">Quoted Total</p>
                  <Price amountMinor={req.quoteMinor} size="md" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="bg-surface p-3.5">
                <p className="font-semibold uppercase tracking-wider text-accent">
                  Submitted Measurements &amp; Preferences
                </p>
                <pre className="mt-2 whitespace-pre-wrap font-mono text-[11px]">
                  {JSON.stringify(req.measurements, null, 2)}
                </pre>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold uppercase">
                      Quote Total (NGN)
                    </label>
                    <Input
                      type="number"
                      value={
                        quoteAmounts[req.id] ??
                        (req.quoteMinor
                          ? Math.round(req.quoteMinor / 100)
                          : 850000)
                      }
                      onChange={(e) =>
                        setQuoteAmounts((prev) => ({
                          ...prev,
                          [req.id]: Number(e.target.value),
                        }))
                      }
                      className="mt-1 font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-semibold uppercase">
                      Deposit Due (NGN)
                    </label>
                    <Input
                      type="number"
                      value={
                        depositAmounts[req.id] ??
                        (req.depositMinor
                          ? Math.round(req.depositMinor / 100)
                          : 425000)
                      }
                      onChange={(e) =>
                        setDepositAmounts((prev) => ({
                          ...prev,
                          [req.id]: Number(e.target.value),
                        }))
                      }
                      className="mt-1 font-mono"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const q = quoteAmounts[req.id] ?? 850000;
                      const d = depositAmounts[req.id] ?? 425000;
                      quoteMutation.mutate({
                        id: req.id,
                        input: {
                          status: "quoted",
                          quoteMinor: q * 100,
                          depositMinor: d * 100,
                          adminNotes: "Quoted via Atelier Admin",
                        },
                      });
                    }}
                  >
                    Save Quote
                  </Button>

                  {!req.convertedOrderId && (
                    <Button
                      size="sm"
                      variant="accent"
                      onClick={() => convertMutation.mutate(req.id)}
                      disabled={convertMutation.isPending}
                    >
                      <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                      Convert to Tracked Order
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* GENERAL SUBMISSIONS */}
      <div className="space-y-4">
        <h2 className="font-serif text-2xl uppercase">
          Contact &amp; General Submissions ({submissions.length})
        </h2>
        <div className="divide-y divide-border border border-border bg-surface-elevated">
          {submissions.map((sub) => (
            <div key={sub.id} className="p-4 text-xs">
              <div className="flex justify-between">
                <strong>
                  {sub.customerName ?? "Guest"} ({sub.customerEmail})
                </strong>
                <span className="text-muted-foreground">
                  Form: {sub.formSlug} (v{sub.formVersion}) •{" "}
                  {formatDateTime(sub.createdAt)}
                </span>
              </div>
              <pre className="mt-2 whitespace-pre-wrap font-mono text-[11px] text-muted-foreground">
                {JSON.stringify(sub.answers, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * 4. ADMIN COLLECTIONS, CONTENT, MEDIA, SETTINGS, USERS & AUDIT
 * ========================================================================== */
export function AdminCollectionsContainer() {
  const { data: collections = [] } = useAdminCollections();
  const createMutation = useCreateCollectionMutation();
  const [title, setTitle] = React.useState("");
  const [season, setSeason] = React.useState("Resort 2026");

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-5">
        <h1 className="font-serif text-3xl uppercase">Lookbooks &amp; Collections</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5 border border-border bg-surface-elevated p-5 space-y-4 text-xs">
          <h2 className="font-serif text-xl uppercase">New Lookbook</h2>
          <Input
            placeholder="Collection Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            placeholder="Season (e.g. Autumn / Winter 2026)"
            value={season}
            onChange={(e) => setSeason(e.target.value)}
          />
          <Button
            onClick={() => {
              if (!title) return;
              createMutation.mutate({
                title,
                slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                season,
                story:
                  "Crafted in our Abuja Atelier with heritage textiles and modern tailoring.",
                coverUrl:
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=85",
                coverAlt: title,
                status: "published",
                items: [
                  {
                    imageUrl:
                      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=85",
                    altText: title,
                    caption: "Look 01 — Maitama Atelier",
                    linkedProductId: "prod-agbada-sovereign",
                    sortOrder: 1,
                  },
                ],
              });
              setTitle("");
            }}
          >
            Publish Lookbook
          </Button>
        </div>

        <div className="lg:col-span-7 space-y-3">
          {collections.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between border border-border bg-surface-elevated p-4 text-xs"
            >
              <div>
                <p className="font-serif text-base font-medium">{c.title}</p>
                <p className="text-muted-foreground">{c.season}</p>
              </div>
              <StatusBadge status={c.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AdminContentContainer() {
  const { data } = useAdminContentBundle();
  const updatePageMutation = useUpdateContentPageMutation();
  const pages = data?.pages ?? [];
  const [selectedSlug, setSelectedSlug] = React.useState("about");
  const activePage = pages.find((p) => p.slug === selectedSlug) ?? pages[0];
  const [body, setBody] = React.useState("");

  React.useEffect(() => {
    if (activePage) {
      setBody(activePage.bodyMarkdown);
    }
  }, [activePage]);

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-5">
        <h1 className="font-serif text-3xl uppercase">
          Editorial Pages &amp; Policies
        </h1>
      </div>

      <div className="flex flex-wrap gap-2">
        {pages.map((p) => (
          <button
            key={p.slug}
            type="button"
            onClick={() => setSelectedSlug(p.slug)}
            className={`border px-4 py-2 text-xs font-semibold uppercase ${
              activePage?.slug === p.slug
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-surface-elevated"
            }`}
          >
            {p.title}
          </button>
        ))}
      </div>

      {activePage && (
        <div className="border border-border bg-surface-elevated p-6 space-y-4">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="min-h-[260px] font-mono text-xs"
          />
          <Button
            onClick={() =>
              updatePageMutation.mutate({
                slug: activePage.slug,
                input: {
                  title: activePage.title,
                  subtitle: activePage.subtitle,
                  bodyMarkdown: body,
                },
              })
            }
          >
            Save Content Page
          </Button>
        </div>
      )}
    </div>
  );
}

export function AdminMediaContainer() {
  const { data: assets = [] } = useAdminMedia();
  const uploadMutation = useUploadMediaMutation();
  const deleteMutation = useDeleteMediaMutation();
  const [altText, setAltText] = React.useState("");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
        <h1 className="font-serif text-3xl uppercase">Cloudflare R2 Media Library</h1>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Alt text for new upload..."
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            className="text-xs"
          />
          <Button
            size="sm"
            onClick={() =>
              uploadMutation.mutate({
                mimeType: "image/webp",
                sizeBytes: 245000,
                bucketKind: "public",
                altText: altText || "Fadé Exclusives Editorial Image",
              })
            }
          >
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            Sign &amp; Upload Asset
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {assets.map((asset) => (
          <div
            key={asset.id}
            className="border border-border bg-surface-elevated p-3 space-y-2 text-xs"
          >
            <div className="aspect-square overflow-hidden bg-surface">
              <img
                src={asset.url}
                alt={asset.altText}
                className="h-full w-full object-cover"
              />
            </div>
            <p className="truncate font-medium">{asset.altText}</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => deleteMutation.mutate(asset.id)}
              className="w-full"
            >
              Delete
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminSettingsContainer() {
  const { data: settings } = useAdminSettings();
  const updateSettingsMutation = useUpdateSettingsMutation();
  const upsertBankMutation = useUpsertBankAccountMutation();

  const [whatsapp, setWhatsapp] = React.useState("");
  const [hours, setHours] = React.useState(48);
  const [bankOpen, setBankOpen] = React.useState(false);
  const [bankLabel, setBankLabel] = React.useState("Corporate NGN Account");
  const [bankName, setBankName] = React.useState("Guaranty Trust Bank (GTBank)");
  const [accountName, setAccountName] = React.useState("FADE EXCLUSIVES ATELIER LTD");
  const [accountNumber, setAccountNumber] = React.useState("0123456789");
  const [currentPassword, setCurrentPassword] = React.useState("");

  React.useEffect(() => {
    if (settings) {
      setWhatsapp(settings.whatsappNumber);
      setHours(settings.paymentWindowHours);
    }
  }, [settings]);

  if (!settings) return null;

  return (
    <div className="space-y-8">
      <div className="border-b border-border pb-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-accent">
          STORE CONFIGURATION &amp; OWNER BANK ACCOUNTS
        </p>
        <h1 className="mt-1 font-serif text-3xl uppercase">
          Settings &amp; Settlement Bank Accounts
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-6 border border-border bg-surface-elevated p-6 space-y-4 text-xs">
          <h2 className="font-serif text-xl uppercase">Storefront &amp; WhatsApp</h2>
          <div>
            <label className="font-semibold uppercase">
              WhatsApp Concierge Number (E.164)
            </label>
            <Input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="mt-1.5 font-mono"
            />
          </div>
          <div>
            <label className="font-semibold uppercase">
              Reservation Window (Hours)
            </label>
            <Input
              type="number"
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              className="mt-1.5"
            />
          </div>
          <Button
            onClick={() =>
              updateSettingsMutation.mutate({
                ...settings,
                whatsappNumber: whatsapp,
                paymentWindowHours: hours,
              })
            }
          >
            Save Store Settings
          </Button>
        </div>

        {/* OWNER-ONLY BANK ACCOUNTS WITH PASSWORD RE-ENTRY */}
        <div className="lg:col-span-6 border border-border bg-surface-elevated p-6 space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl uppercase">
              Settlement Bank Accounts
            </h2>
            <Button size="sm" onClick={() => setBankOpen(true)}>
              Add / Edit Bank (Owner Only)
            </Button>
          </div>
          <div className="space-y-3">
            {settings.bankAccounts.map((b) => (
              <div key={b.id} className="border border-border bg-surface p-4">
                <p className="font-semibold text-accent">{b.label}</p>
                <p className="mt-1">
                  {b.bankName} •{" "}
                  <strong className="font-mono">{b.accountNumber}</strong>
                </p>
                <p className="text-muted-foreground">{b.accountName}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Dialog
        open={bankOpen}
        onOpenChange={setBankOpen}
        title="Modify Settlement Bank Account (Owner Re-Authentication)"
        description="Per Section 14.3, modifying bank account details requires Owner role and current password re-entry."
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            upsertBankMutation.mutate(
              {
                label: bankLabel,
                bankName,
                accountName,
                accountNumber,
                instructions:
                  "Include your Order Reference Code in transfer narration.",
                isActive: true,
                currentPassword,
              },
              {
                onSuccess: () => {
                  setBankOpen(false);
                  setCurrentPassword("");
                },
              },
            );
          }}
          className="space-y-4 text-xs"
        >
          <Input
            placeholder="Account Label"
            value={bankLabel}
            onChange={(e) => setBankLabel(e.target.value)}
            required
          />
          <Input
            placeholder="Bank Name"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            required
          />
          <Input
            placeholder="Account Name"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            required
          />
          <Input
            placeholder="Account Number"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            required
          />
          <div className="border border-warning/40 bg-surface p-3">
            <label className="flex items-center gap-1.5 font-semibold uppercase text-warning">
              <ShieldAlert className="h-4 w-4" />
              <span>Re-enter Owner Password to Confirm *</span>
            </label>
            <Input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Your current owner password"
              className="mt-1.5"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setBankOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={upsertBankMutation.isPending}>
              Verify &amp; Save Bank Account
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

export function AdminUsersContainer() {
  const { data: users = [] } = useAdminUsers();
  const createMutation = useCreateAdminUserMutation();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-5">
        <h1 className="font-serif text-3xl uppercase">
          Staff Accounts (Owner Only)
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-5 border border-border bg-surface-elevated p-5 space-y-3 text-xs">
          <h2 className="font-serif text-xl uppercase">Invite Staff Member</h2>
          <Input
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            placeholder="Initial Password (min 12 chars)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            onClick={() =>
              createMutation.mutate({
                name,
                email,
                role: "manager",
                password,
              })
            }
          >
            Create Manager Account
          </Button>
        </div>

        <div className="lg:col-span-7 space-y-3">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between border border-border bg-surface-elevated p-4 text-xs"
            >
              <div>
                <p className="font-semibold">{u.name}</p>
                <p className="text-muted-foreground">{u.email}</p>
              </div>
              <StatusBadge status={u.isActive ? "active" : "archived"} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AdminAuditContainer() {
  const { data, isLoading } = useAdminAuditLogs({ limit: 50 });
  const logs = data?.items ?? [];

  const columns: DataTableColumnDef<(typeof logs)[number]>[] = [
    {
      accessorKey: "createdAt",
      header: "Timestamp",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {formatDateTime(row.original.createdAt)}
        </span>
      ),
    },
    {
      accessorKey: "actorEmail",
      header: "Actor",
      cell: ({ row }) => (
        <span>
          {row.original.actorEmail} ({row.original.actorRole})
        </span>
      ),
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <span className="font-mono font-semibold text-accent">
          {row.original.action}
        </span>
      ),
    },
    {
      accessorKey: "entity",
      header: "Entity",
      cell: ({ row }) => (
        <span className="font-mono">
          {row.original.entity}:{row.original.entityId}
        </span>
      ),
    },
    {
      accessorKey: "summary",
      header: "Summary",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.summary}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-accent">
          IMMUTABLE SECURITY &amp; OPERATIONS TRAIL
        </p>
        <h1 className="mt-1 font-serif text-3xl uppercase">Admin Audit Log</h1>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        isLoading={isLoading}
        searchable
        searchPlaceholder="Filter audit trail by actor, action, or entity..."
        paginated
        defaultPageSize={10}
      />
    </div>
  );
}
