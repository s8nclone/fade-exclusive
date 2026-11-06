"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  AlertTriangle,
  Clock,
  Tag,
  Scissors,
  TrendingUp,
  ArrowRight,
  Package,
} from "lucide-react";
import {
  useAdminSession,
  useAdminLoginMutation,
  useAdminLogoutMutation,
} from "@/services/auth/auth.hooks";
import { useAdminDashboard } from "@/services/dashboard/dashboard.hooks";
import { AdminShell } from "@/components/templates/AdminShell";
import {
  DataTable,
  type DataTableColumnDef,
} from "@/components/modules/DataTable";
import { Logo } from "@/components/atoms/Logo";
import { Price } from "@/components/atoms/Price";
import { StatusBadge } from "@/components/atoms/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export function AdminProtectedWrapper({
  adminSlug,
  children,
}: {
  adminSlug: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: sessionData, isLoading } = useAdminSession();
  const logoutMutation = useAdminLogoutMutation();

  React.useEffect(() => {
    if (!isLoading && !sessionData?.user) {
      router.replace(`/${adminSlug}/login`);
    }
  }, [isLoading, sessionData, router, adminSlug]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-8">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (!sessionData?.user) {
    return null;
  }

  return (
    <AdminShell
      adminSlug={adminSlug}
      currentPath={pathname}
      user={sessionData.user}
      onLogout={() => {
        logoutMutation.mutate(false, {
          onSuccess: () => router.replace(`/${adminSlug}/login`),
        });
      }}
    >
      {children}
    </AdminShell>
  );
}

export function AdminLoginContainer({ adminSlug }: { adminSlug: string }) {
  const router = useRouter();
  const loginMutation = useAdminLoginMutation();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(
      { email, password },
      {
        onSuccess: () => {
          router.push(`/${adminSlug}/dashboard`);
        },
      },
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-obsidian px-4 py-12 text-obsidian-foreground">
      <div className="w-full max-w-md border border-obsidian-foreground/20 bg-surface p-8 text-foreground sm:p-10 space-y-6">
        <div className="border-b border-border pb-6">
          <Logo variant="editorial" />
          <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.26em] text-accent">
            ATELIER COMMAND CENTER • RESTRICTED ACCESS
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="admin-email"
              className="text-xs font-semibold uppercase tracking-wider"
            >
              Staff Email Address
            </label>
            <Input
              id="admin-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="text-xs font-semibold uppercase tracking-wider"
            >
              Passphrase
            </label>
            <Input
              id="admin-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5"
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full gap-2"
            disabled={loginMutation.isPending}
          >
            <Lock className="h-4 w-4" />
            <span>
              {loginMutation.isPending
                ? "Verifying Argon2id Credentials..."
                : "Sign In to Atelier Admin"}
            </span>
          </Button>
        </form>

        {process.env.NODE_ENV === "development" && (
          <p className="border-t border-border pt-4 text-[11px] text-muted-foreground">
            Development: the owner account is created at server startup from{" "}
            <code className="font-mono text-foreground">OWNER_EMAIL</code> and{" "}
            <code className="font-mono text-foreground">OWNER_PASSWORD</code> in{" "}
            <code className="font-mono text-foreground">.env.local</code>.
          </p>
        )}
      </div>
    </div>
  );
}

export function AdminDashboardContainer({ adminSlug }: { adminSlug: string }) {
  const { data: summary, isLoading } = useAdminDashboard();
  const base = `/${adminSlug}`;

  if (isLoading || !summary) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-accent">
            MAITAMA, ABUJA ATELIER OPERATIONS
          </p>
          <h1 className="mt-1 font-serif text-3xl font-normal uppercase">
            Executive Dashboard
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`${base}/orders`}
            className="inline-flex min-h-[40px] items-center gap-1.5 bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-wider text-primary-foreground"
          >
            <span>
              Verify Transfers (
              {summary.counts.awaitingPayment + summary.counts.paymentSubmitted})
            </span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href={`${base}/products`}
            className="inline-flex min-h-[40px] items-center gap-1.5 border border-border bg-surface-elevated px-4 py-2 text-xs font-semibold uppercase tracking-wider"
          >
            <Package className="h-3.5 w-3.5" />
            <span>Manage Products</span>
          </Link>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="border border-border bg-surface-elevated p-5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="uppercase tracking-wider">
              Awaiting Transfer Verification
            </span>
            <Clock className="h-4 w-4 text-accent" />
          </div>
          <p className="mt-3 font-serif text-4xl font-semibold">
            {summary.counts.awaitingPayment + summary.counts.paymentSubmitted}
          </p>
          <Link
            href={`${base}/orders`}
            className="mt-2 inline-block text-xs font-semibold uppercase tracking-wider text-accent underline"
          >
            Review Pending Orders →
          </Link>
        </div>

        <div className="border border-border bg-surface-elevated p-5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="uppercase tracking-wider">
              Confirmed Revenue
            </span>
            <TrendingUp className="h-4 w-4 text-success" />
          </div>
          <div className="mt-3">
            <Price
              amountMinor={summary.counts.totalRevenueConfirmedMinor}
              currency={summary.currency}
              size="lg"
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Verified bank transfers &amp; deposits
          </p>
        </div>

        <div className="border border-border bg-surface-elevated p-5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="uppercase tracking-wider">
              New Custom Fit Commissions
            </span>
            <Scissors className="h-4 w-4 text-accent" />
          </div>
          <p className="mt-3 font-serif text-4xl font-semibold">
            {summary.counts.newCustomRequests}
          </p>
          <Link
            href={`${base}/submissions`}
            className="mt-2 inline-block text-xs font-semibold uppercase tracking-wider text-accent underline"
          >
            Quote &amp; Convert Commissions →
          </Link>
        </div>

        <div className="border border-border bg-surface-elevated p-5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="uppercase tracking-wider">Low Stock Alerts</span>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </div>
          <p className="mt-3 font-serif text-4xl font-semibold">
            {summary.counts.lowStockVariants}
          </p>
          <Link
            href={`${base}/products`}
            className="mt-2 inline-block text-xs font-semibold uppercase tracking-wider text-accent underline"
          >
            Inspect Variant Inventory →
          </Link>
        </div>

        <div className="border border-border bg-surface-elevated p-5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="uppercase tracking-wider">In Production</span>
            <Tag className="h-4 w-4 text-accent" />
          </div>
          <p className="mt-3 font-serif text-4xl font-semibold">
            {summary.counts.inProduction}
          </p>
          <Link
            href={`${base}/orders`}
            className="mt-2 inline-block text-xs font-semibold uppercase tracking-wider text-accent underline"
          >
            Track Atelier Tailoring →
          </Link>
        </div>

        <div className="border border-border bg-surface-elevated p-5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="uppercase tracking-wider">Ready for Dispatch</span>
            <Clock className="h-4 w-4 text-success" />
          </div>
          <p className="mt-3 font-serif text-4xl font-semibold">
            {summary.counts.readyForDispatch}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Awaiting courier pickup
          </p>
        </div>
      </div>

      {/* RECENT ORDERS TABLE */}
      <div className="border border-border bg-surface-elevated p-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="font-serif text-xl uppercase">Recent Orders</h2>
          <Link
            href={`${base}/orders`}
            className="text-xs font-semibold uppercase tracking-wider underline"
          >
            View All Orders
          </Link>
        </div>

        <div className="mt-4">
          <DataTable
            columns={
              [
                {
                  accessorKey: "orderNumber",
                  header: "Order #",
                  cell: ({ row }) => (
                    <span className="font-mono font-semibold">
                      {row.original.orderNumber}
                    </span>
                  ),
                },
                {
                  accessorKey: "referenceCode",
                  header: "Ref Code",
                  cell: ({ row }) => (
                    <span className="font-mono text-accent">
                      {row.original.referenceCode}
                    </span>
                  ),
                },
                {
                  accessorKey: "customerName",
                  header: "Client",
                },
                {
                  accessorKey: "status",
                  header: "Status",
                  cell: ({ row }) => (
                    <StatusBadge status={row.original.status} />
                  ),
                },
                {
                  accessorKey: "totalMinor",
                  header: "Total",
                  cell: ({ row }) => (
                    <div className="text-right">
                      <Price
                        amountMinor={row.original.totalMinor}
                        currency={summary.currency}
                        size="sm"
                      />
                    </div>
                  ),
                },
              ] satisfies DataTableColumnDef<
                (typeof summary.recentOrders)[number]
              >[]
            }
            data={summary.recentOrders}
            emptyMessage="No recent orders found."
          />
        </div>
      </div>
    </div>
  );
}
