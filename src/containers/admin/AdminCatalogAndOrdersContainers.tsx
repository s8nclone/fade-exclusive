"use client";

import * as React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  MessageCircle,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import {
  useAdminOrders,
  useConfirmPaymentMutation,
  useUpdateOrderStatusMutation,
} from "@/services/orders/orders.hooks";
import type { AdminOrderDTO } from "@/services/orders/orders.types";
import {
  useAdminProducts,
  useArchiveOrDeleteProductMutation,
  useBulkProductActionMutation,
  useCreateProductMutation,
  useDuplicateProductMutation,
  useUpdateProductMutation,
} from "@/services/products/products.hooks";
import {
  useAdminPromotions,
  useCreatePromotionMutation,
  useDuplicatePromotionMutation,
  useUpdatePromotionMutation,
} from "@/services/promotions/promotions.hooks";
import { Price } from "@/components/atoms/Price";
import { StatusBadge } from "@/components/atoms/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import {
  DataTable,
  type DataTableColumnDef,
} from "@/components/modules/DataTable";
import { Textarea } from "@/components/ui/textarea";
import { Dialog } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { formatMoney } from "@/lib/format/money";

/* ============================================================================
 * 1. ADMIN ORDERS & MANUAL BANK TRANSFER CONFIRMATION
 * ========================================================================== */
export function AdminOrdersContainer() {
  const [statusFilter, setStatusFilter] = React.useState<string>("");
  const [search, setSearch] = React.useState("");
  const { data, isLoading } = useAdminOrders({
    status: statusFilter || undefined,
    q: search || undefined,
  });

  const confirmMutation = useConfirmPaymentMutation();
  const statusMutation = useUpdateOrderStatusMutation();

  const [confirmingOrder, setConfirmingOrder] =
    React.useState<AdminOrderDTO | null>(null);
  const [paymentKind, setPaymentKind] = React.useState<
    "full" | "deposit" | "balance"
  >("full");
  const [amountMajor, setAmountMajor] = React.useState<number>(0);
  const [bankRef, setBankRef] = React.useState("");
  const [paymentNote, setPaymentNote] = React.useState("");

  const orders = data?.items ?? [];

  const openConfirmModal = (order: AdminOrderDTO) => {
    setConfirmingOrder(order);
    const hasDepositOption = order.depositRequiredMinor < order.totalMinor;
    if (order.amountPaidMinor === 0 && hasDepositOption) {
      setPaymentKind("deposit");
      setAmountMajor(Math.round(order.depositRequiredMinor / 100));
    } else if (order.amountPaidMinor > 0) {
      setPaymentKind("balance");
      setAmountMajor(Math.round(order.amountDueMinor / 100));
    } else {
      setPaymentKind("full");
      setAmountMajor(Math.round(order.amountDueMinor / 100));
    }
    setBankRef("");
    setPaymentNote("");
  };

  const handleExportCsv = () => {
    const headers = [
      "OrderNumber",
      "ReferenceCode",
      "Status",
      "CustomerName",
      "CustomerEmail",
      "TotalNGN",
      "PaidNGN",
    ];
    const rows = orders.map((o) => [
      o.orderNumber,
      o.referenceCode,
      o.status,
      `"${o.customerName}"`,
      o.customerEmail,
      Math.round(o.totalMinor / 100),
      Math.round(o.amountPaidMinor / 100),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fade-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-accent">
            PAYMENT VERIFICATION &amp; FULFILLMENT
          </p>
          <h1 className="mt-1 font-serif text-3xl font-normal uppercase">
            Orders &amp; Bank Transfers
          </h1>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCsv} className="gap-2">
          <Download className="h-4 w-4" />
          <span>Export CSV</span>
        </Button>
      </div>

      {/* ANTI-FRAUD REMINDER BANNER (Section 10.6 & 14) */}
      <div className="border-l-4 border-warning bg-surface p-4 text-xs">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-warning shrink-0" />
          <div>
            <p className="font-semibold uppercase tracking-wider text-foreground">
              Anti-Fraud Verification Protocol
            </p>
            <p className="mt-1 text-muted-foreground">
              Always verify funds in your actual bank app (GTBank / Zenith Bank)
              before clicking <strong>Confirm Payment</strong>. WhatsApp screenshots
              alone are not proof of cleared settlement.
            </p>
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {[
            { value: "", label: "All" },
            { value: "awaiting_payment", label: "Pending Transfer" },
            { value: "payment_submitted", label: "Receipt Submitted" },
            { value: "paid", label: "Paid" },
            { value: "in_production", label: "In Production" },
            { value: "shipped", label: "Shipped" },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={`min-h-[38px] border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider ${
                statusFilter === tab.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-surface-elevated text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search FADE-2026, FD-XXXXXX, name..."
            className="pl-9 text-xs"
          />
        </div>
      </div>

      {/* ORDERS LIST */}
      <div className="space-y-4">
        {isLoading ? (
          <p className="text-xs text-muted-foreground">Loading orders...</p>
        ) : (
          orders.map((order) => {
            const latestReceipt = order.receipts[0];
            return (
              <div
                key={order.id}
                className="border border-border bg-surface-elevated p-5 space-y-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono text-base font-bold">
                        {order.orderNumber}
                      </span>
                      <span className="border border-accent/40 bg-surface px-2.5 py-0.5 font-mono text-xs font-bold text-accent">
                        Ref: {order.referenceCode}
                      </span>
                      <StatusBadge status={order.status} />
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      Client:{" "}
                      <strong className="text-foreground">{order.customerName}</strong>{" "}
                      ({order.customerEmail} • {order.customerPhone})
                    </p>
                  </div>

                  <div className="text-right">
                    <Price amountMinor={order.totalMinor} size="md" />
                    <p className="text-xs text-muted-foreground">
                      Paid: {formatMoney(order.amountPaidMinor)} | Due:{" "}
                      {formatMoney(order.amountDueMinor)}
                    </p>
                  </div>
                </div>

                {/* Items & Actions */}
                <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    {order.items.map((item) => (
                      <p key={item.id}>
                        • {item.productName} ({item.variantLabel}) × {item.qty}
                      </p>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {order.amountDueMinor > 0 &&
                      order.status !== "cancelled" &&
                      order.status !== "expired" && (
                        <Button
                          size="sm"
                          variant="accent"
                          onClick={() => openConfirmModal(order)}
                        >
                          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                          Confirm Payment
                        </Button>
                      )}

                    {order.allowedNextStatuses.length > 0 && (
                      <Select
                        aria-label={`Transition status for ${order.orderNumber}`}
                        size="sm"
                        searchable={false}
                        className="w-[180px]"
                        placeholder="Advance Status..."
                        value=""
                        onValueChange={(next) => {
                          if (!next) return;
                          statusMutation.mutate({
                            orderId: order.id,
                            input: {
                              toStatus: next as never,
                              note: `Transitioned to ${next} by staff`,
                            },
                          });
                        }}
                        options={order.allowedNextStatuses.map((st) => ({
                          value: st,
                          label: `→ ${st.replace(/_/g, " ").toUpperCase()}`,
                        }))}
                      />
                    )}

                    {latestReceipt && (
                      <>
                        <a
                          href={`/receipt/${latestReceipt.token}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-[36px] items-center gap-1 border border-border bg-surface px-3 text-xs font-medium hover:bg-muted"
                        >
                          <span>Receipt</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                        <a
                          href={latestReceipt.whatsappShareUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-[36px] items-center gap-1 border border-border bg-surface px-3 text-xs font-medium hover:bg-muted"
                        >
                          <MessageCircle className="h-3.5 w-3.5 text-success" />
                          <span>Share Receipt on WhatsApp</span>
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CONFIRM PAYMENT MODAL */}
      <Dialog
        open={Boolean(confirmingOrder)}
        onOpenChange={(open: boolean) => !open && setConfirmingOrder(null)}
        title={`Confirm Bank Transfer — ${confirmingOrder?.orderNumber ?? ""}`}
        description={`Verify that narration "${confirmingOrder?.referenceCode ?? ""}" has settled in your bank account before issuing an official receipt.`}
      >
        {confirmingOrder && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              confirmMutation.mutate(
                {
                  orderId: confirmingOrder.id,
                  input: {
                    kind: paymentKind,
                    amountMinor: Math.round(amountMajor * 100),
                    bankReference: bankRef || undefined,
                    notes: paymentNote || undefined,
                  },
                },
                {
                  onSuccess: () => setConfirmingOrder(null),
                },
              );
            }}
            className="space-y-4 text-xs"
          >
            <div>
              <label className="font-semibold uppercase tracking-wider">
                Payment Type
              </label>
              <Select
                aria-label="Payment Type"
                searchable={false}
                className="mt-1.5"
                value={paymentKind}
                onValueChange={(val) => {
                  const k = val as "full" | "deposit" | "balance";
                  setPaymentKind(k);
                  if (k === "deposit") {
                    setAmountMajor(
                      Math.round(confirmingOrder.depositRequiredMinor / 100),
                    );
                  } else {
                    setAmountMajor(Math.round(confirmingOrder.amountDueMinor / 100));
                  }
                }}
                options={[
                  { value: "full", label: "Full Settlement" },
                  { value: "deposit", label: "Atelier Deposit (50%)" },
                  { value: "balance", label: "Remaining Balance" },
                ]}
              />
            </div>

            <div>
              <label className="font-semibold uppercase tracking-wider">
                Amount Received (NGN Major Units) *
              </label>
              <Input
                type="number"
                required
                min={1}
                value={amountMajor}
                onChange={(e) => setAmountMajor(Number(e.target.value))}
                className="mt-1.5 font-mono"
              />
            </div>

            <div>
              <label className="font-semibold uppercase tracking-wider">
                Bank Session ID / Reference
              </label>
              <Input
                value={bankRef}
                onChange={(e) => setBankRef(e.target.value)}
                placeholder="e.g. GTB-NIP-9928172"
                className="mt-1.5"
              />
            </div>

            <div>
              <label className="font-semibold uppercase tracking-wider">
                Internal Verification Note
              </label>
              <Textarea
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                placeholder="Confirmed in GTBank corporate app..."
                className="mt-1.5"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirmingOrder(null)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={confirmMutation.isPending}>
                {confirmMutation.isPending
                  ? "Issuing Receipt & Sending Email..."
                  : "Confirm & Issue Official Receipt"}
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </div>
  );
}

/* ============================================================================
 * 2. ADMIN PRODUCTS CRUD, DUPLICATE, ARCHIVE/DELETE & BULK ACTIONS
 * ========================================================================== */
export function AdminProductsContainer() {
  const { data, isLoading } = useAdminProducts({ limit: 50 });
  const createMutation = useCreateProductMutation();
  const updateMutation = useUpdateProductMutation();
  const duplicateMutation = useDuplicateProductMutation();
  const archiveDeleteMutation = useArchiveOrDeleteProductMutation();
  const bulkMutation = useBulkProductActionMutation();

  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [newName, setNewName] = React.useState("");
  const [newSlug, setNewSlug] = React.useState("");
  const [newPriceMajor, setNewPriceMajor] = React.useState(380000);
  const [newType, setNewType] = React.useState<"ready_to_wear" | "made_to_order">(
    "ready_to_wear",
  );
  const [newCategoryId, setNewCategoryId] = React.useState("cat-modern-set");
  const [newDesc, setNewDesc] = React.useState(
    "Hand-finished in our Maitama, Abuja Atelier from heavyweight luxury textiles.",
  );

  const products = React.useMemo(() => data?.items ?? [], [data?.items]);

  const toggleSelect = React.useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }, []);

  const allSelected =
    products.length > 0 && products.every((p) => selectedIds.includes(p.id));

  const productColumns = React.useMemo<
    DataTableColumnDef<(typeof products)[number]>[]
  >(
    () => [
      {
        id: "select",
        enableSorting: false,
        header: () => (
          <input
            type="checkbox"
            checked={allSelected}
            onChange={() =>
              setSelectedIds(allSelected ? [] : products.map((p) => p.id))
            }
            aria-label="Select all pieces"
            className="h-4 w-4 accent-primary"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={selectedIds.includes(row.original.id)}
            onChange={() => toggleSelect(row.original.id)}
            aria-label={`Select ${row.original.name}`}
            className="h-4 w-4 accent-primary"
          />
        ),
      },
      {
        id: "piece",
        accessorFn: (prod) => `${prod.name} ${prod.categoryName ?? ""}`,
        header: "Piece",
        cell: ({ row }) => (
          <div>
            <p className="font-serif text-sm font-medium">{row.original.name}</p>
            <p className="text-muted-foreground">{row.original.categoryName}</p>
          </div>
        ),
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => (
          <span className="uppercase">{row.original.type.replace(/_/g, " ")}</span>
        ),
      },
      {
        accessorKey: "priceMinor",
        header: "Price",
        cell: ({ row }) => (
          <Price amountMinor={row.original.priceMinor} size="sm" />
        ),
      },
      {
        accessorKey: "totalStockOnHand",
        header: "Stock",
        cell: ({ row }) => (
          <span className="font-mono">{row.original.totalStockOnHand}</span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: "actions",
        enableSorting: false,
        header: () => <span className="block text-right">Actions</span>,
        cell: ({ row }) => {
          const prod = row.original;
          return (
            <div className="flex items-center justify-end gap-1.5">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  updateMutation.mutate({
                    id: prod.id,
                    input: {
                      status: prod.status === "published" ? "draft" : "published",
                    },
                  })
                }
              >
                {prod.status === "published" ? "Unpublish" : "Publish"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => duplicateMutation.mutate(prod.id)}
                title="Duplicate Piece"
                aria-label={`Duplicate ${prod.name}`}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  archiveDeleteMutation.mutate({
                    id: prod.id,
                    permanent: !prod.hasOrders,
                  })
                }
                title={
                  prod.hasOrders
                    ? "Archive (Has Historical Orders)"
                    : "Delete or Archive"
                }
                aria-label={`Archive or delete ${prod.name}`}
              >
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </div>
          );
        },
      },
    ],
    [
      allSelected,
      products,
      selectedIds,
      toggleSelect,
      updateMutation,
      duplicateMutation,
      archiveDeleteMutation,
    ],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-accent">
            CATALOG &amp; INVENTORY
          </p>
          <h1 className="mt-1 font-serif text-3xl font-normal uppercase">
            Products &amp; Stock
          </h1>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          <span>Add New Piece</span>
        </Button>
      </div>

      {/* BULK ACTIONS */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border border-accent bg-surface p-3.5 text-xs">
          <span className="font-semibold">
            {selectedIds.length} piece(s) selected
          </span>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                bulkMutation.mutate(
                  { productIds: selectedIds, action: "publish" },
                  { onSuccess: () => setSelectedIds([]) },
                )
              }
            >
              Publish Selected
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                bulkMutation.mutate(
                  { productIds: selectedIds, action: "archive" },
                  { onSuccess: () => setSelectedIds([]) },
                )
              }
            >
              Archive Selected
            </Button>
          </div>
        </div>
      )}

      {/* PRODUCTS TABLE (Shadcn Table + TanStack Table) */}
      <DataTable
        columns={productColumns}
        data={products}
        isLoading={isLoading}
        emptyMessage="No pieces in the catalog yet."
        searchable
        searchPlaceholder="Search pieces, categories, status..."
        paginated
        defaultPageSize={10}
      />

      {/* CREATE PRODUCT MODAL */}
      <Dialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Add New Garment to Catalog"
        maxWidthClass="max-w-xl"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const slug =
              newSlug ||
              newName
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");
            createMutation.mutate(
              {
                name: newName,
                slug,
                type: newType,
                categoryId: newCategoryId,
                description: newDesc,
                priceMinor: Math.round(newPriceMajor * 100),
                compareAtPriceMinor: null,
                leadTimeDays: newType === "made_to_order" ? 14 : null,
                depositPercent: newType === "made_to_order" ? 50 : null,
                fabricNotes: "100% Hand-selected luxury textile",
                careNotes: "Specialist dry clean only",
                fitNotes: "True to Fadé architectural fit",
                status: "published",
                isFeatured: true,
                seoTitle: newName,
                seoDescription: newDesc,
                images: [
                  {
                    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=85",
                    altText: newName,
                    sortOrder: 1,
                  },
                ],
                variants: [
                  {
                    label: "M",
                    sku: `FD-${slug.slice(0, 6).toUpperCase()}-M`,
                    priceOverrideMinor: null,
                    stockOnHand: 5,
                    lowStockThreshold: 2,
                    sortOrder: 1,
                  },
                  {
                    label: "L",
                    sku: `FD-${slug.slice(0, 6).toUpperCase()}-L`,
                    priceOverrideMinor: null,
                    stockOnHand: 5,
                    lowStockThreshold: 2,
                    sortOrder: 2,
                  },
                ],
              },
              {
                onSuccess: () => {
                  setCreateOpen(false);
                  setNewName("");
                  setNewSlug("");
                },
              },
            );
          }}
          className="space-y-4 text-xs"
        >
          <div>
            <label className="font-semibold uppercase tracking-wider">
              Garment Title *
            </label>
            <Input
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. The Sovereign Bronze Kaftan"
              className="mt-1.5"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold uppercase tracking-wider">
                Fulfillment Type
              </label>
              <Select
                aria-label="Fulfillment Type"
                searchable={false}
                className="mt-1.5"
                value={newType}
                onValueChange={(val) =>
                  setNewType(val as "ready_to_wear" | "made_to_order")
                }
                options={[
                  { value: "ready_to_wear", label: "Ready-to-Wear" },
                  {
                    value: "made_to_order",
                    label: "Made-to-Order (50% Deposit)",
                  },
                ]}
              />
            </div>
            <div>
              <label className="font-semibold uppercase tracking-wider">
                Category
              </label>
              <Combobox
                id="new-product-category"
                className="mt-1.5"
                value={newCategoryId}
                onValueChange={(val) => setNewCategoryId(val)}
                placeholder="Search categories..."
                emptyMessage="No matching category."
                options={[
                  { value: "cat-agbada", label: "The Agbada" },
                  { value: "cat-modern-set", label: "The Modern Set" },
                  { value: "cat-kaftan", label: "The Kaftan" },
                  { value: "cat-fila", label: "The Fila" },
                  { value: "cat-contemporary", label: "Contemporary" },
                ]}
              />
            </div>
          </div>

          <div>
            <label className="font-semibold uppercase tracking-wider">
              Price (NGN Major Units) *
            </label>
            <Input
              type="number"
              required
              min={1000}
              value={newPriceMajor}
              onChange={(e) => setNewPriceMajor(Number(e.target.value))}
              className="mt-1.5 font-mono"
            />
          </div>

          <div>
            <label className="font-semibold uppercase tracking-wider">
              Editorial Description *
            </label>
            <Textarea
              required
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Publish Piece"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

/* ============================================================================
 * 3. ADMIN PROMOTIONS, SALES & COUPONS ENGINE (Section 11)
 * ========================================================================== */
export function AdminPromotionsContainer() {
  const { data: promotions = [], isLoading } = useAdminPromotions();
  const createMutation = useCreatePromotionMutation();
  const updateMutation = useUpdatePromotionMutation();
  const duplicateMutation = useDuplicatePromotionMutation();

  const [createOpen, setCreateOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [mode, setMode] = React.useState<"coupon" | "automatic">("coupon");
  const [code, setCode] = React.useState("");
  const [type, setType] = React.useState<"percentage" | "fixed_amount">(
    "percentage",
  );
  const [value, setValue] = React.useState(15);
  const [badgeLabel, setBadgeLabel] = React.useState("15% OFF");

  const plainLanguageSummary =
    type === "percentage"
      ? `${mode === "coupon" ? `Code ${code || "CODE"}: ` : "Auto Sale: "}${value}% off all eligible pieces.`
      : `${mode === "coupon" ? `Code ${code || "CODE"}: ` : "Auto Sale: "}${formatMoney(value * 100)} off eligible orders.`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-accent">
            UNIFIED PRICING &amp; CAMPAIGNS
          </p>
          <h1 className="mt-1 font-serif text-3xl font-normal uppercase">
            Promotions, Sales &amp; Coupons
          </h1>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          <span>Create Promotion</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <p className="text-xs text-muted-foreground">Loading promotions...</p>
        ) : (
          promotions.map((promo) => (
            <div
              key={promo.id}
              className="flex flex-wrap items-center justify-between gap-4 border border-border bg-surface-elevated p-5"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3 className="font-serif text-lg font-medium">{promo.name}</h3>
                  {promo.code && (
                    <span className="border border-accent bg-surface px-2.5 py-0.5 font-mono text-xs font-bold text-accent">
                      {promo.code}
                    </span>
                  )}
                  <StatusBadge status={promo.computedStatus} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {promo.discountType === "percentage"
                    ? `${promo.value}% off (${promo.scope})`
                    : `${formatMoney(promo.value)} off (${promo.scope})`}{" "}
                  • Redeemed: <strong>{promo.redemptionsCount}</strong>
                  {promo.usageLimitTotal ? ` / ${promo.usageLimitTotal}` : ""}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  checked={promo.isActive}
                  onCheckedChange={(checked) =>
                    updateMutation.mutate({
                      id: promo.id,
                      input: { isActive: checked },
                    })
                  }
                  aria-label={`Toggle promotion ${promo.name}`}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => duplicateMutation.mutate(promo.id)}
                >
                  <Copy className="mr-1.5 h-3.5 w-3.5" />
                  Duplicate
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Create Promotion or Coupon"
        description={plainLanguageSummary}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate(
              {
                name,
                kind: mode,
                code: mode === "coupon" ? code.toUpperCase() : null,
                discountType: type,
                value: type === "fixed_amount" ? Math.round(value * 100) : value,
                scope: "order",
                targetIds: [],
                eligibleProductTypes: ["ready_to_wear", "made_to_order"],
                minOrderMinor: null,
                maxDiscountMinor: null,
                usageLimitTotal: null,
                usageLimitPerCustomer: null,
                stackable: false,
                excludeDiscountedItems: false,
                startsAt: new Date(Date.now() - 60_000).toISOString(),
                endsAt: null,
                isActive: true,
              },
              {
                onSuccess: () => {
                  setCreateOpen(false);
                  setName("");
                  setCode("");
                },
              },
            );
          }}
          className="space-y-4 text-xs"
        >
          <div>
            <label className="font-semibold uppercase tracking-wider">
              Campaign Name *
            </label>
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Abuja Fashion Gala VIP 15%"
              className="mt-1.5"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold uppercase tracking-wider">
                Trigger Mode
              </label>
              <Select
                aria-label="Trigger Mode"
                searchable={false}
                className="mt-1.5"
                value={mode}
                onValueChange={(val) => setMode(val as "coupon" | "automatic")}
                options={[
                  { value: "coupon", label: "Coupon Code" },
                  { value: "automatic", label: "Automatic Campaign" },
                ]}
              />
            </div>
            {mode === "coupon" && (
              <div>
                <label className="font-semibold uppercase tracking-wider">
                  Coupon Code *
                </label>
                <Input
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="ABUJAVIP15"
                  className="mt-1.5 font-mono uppercase"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold uppercase tracking-wider">
                Discount Type
              </label>
              <Select
                aria-label="Discount Type"
                searchable={false}
                className="mt-1.5"
                value={type}
                onValueChange={(val) =>
                  setType(val as "percentage" | "fixed_amount")
                }
                options={[
                  { value: "percentage", label: "Percentage (%)" },
                  { value: "fixed_amount", label: "Fixed Amount (NGN)" },
                ]}
              />
            </div>
            <div>
              <label className="font-semibold uppercase tracking-wider">
                {type === "percentage" ? "Percentage (1-90)" : "Amount (NGN)"}
              </label>
              <Input
                type="number"
                required
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                className="mt-1.5 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold uppercase tracking-wider">
              Product Card Badge Label
            </label>
            <Input
              value={badgeLabel}
              onChange={(e) => setBadgeLabel(e.target.value)}
              placeholder="15% OFF"
              className="mt-1.5"
            />
          </div>

          <div className="border border-border bg-surface p-3 text-xs">
            <p className="font-semibold uppercase tracking-wider text-accent">
              Plain-Language Rule Summary
            </p>
            <p className="mt-1">{plainLanguageSummary}</p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              Save Promotion
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
