"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, LogOut, ExternalLink } from "lucide-react";
import { Logo } from "@/components/atoms/Logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SheetDrawer } from "@/components/ui/sheet";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export interface AdminNavItem {
  href: string;
  label: string;
  ownerOnly?: boolean;
}

export interface AdminShellProps {
  adminSlug: string;
  currentPath: string;
  user: {
    name: string;
    email: string;
    role: "owner" | "manager";
  };
  onLogout: () => void;
  children: React.ReactNode;
}

export function AdminShell({
  adminSlug,
  currentPath,
  user,
  onLogout,
  children,
}: AdminShellProps) {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const base = `/${adminSlug}`;

  const navItems: AdminNavItem[] = [
    { href: `${base}/dashboard`, label: "Dashboard" },
    { href: `${base}/orders`, label: "Orders & Payments" },
    { href: `${base}/products`, label: "Products & Stock" },
    { href: `${base}/promotions`, label: "Promotions & Coupons" },
    { href: `${base}/submissions`, label: "Custom Fit & Inquiries" },
    { href: `${base}/banners`, label: "Banners & Colors" },
    { href: `${base}/forms`, label: "Form Builder" },
    { href: `${base}/collections`, label: "Lookbooks" },
    { href: `${base}/content`, label: "Pages & Press" },
    { href: `${base}/media`, label: "Media Library" },
    { href: `${base}/settings`, label: "Settings & Banks" },
    { href: `${base}/users`, label: "Staff Users", ownerOnly: true },
    { href: `${base}/audit`, label: "Audit Log" },
  ];

  const visibleItems = navItems.filter(
    (item) => !item.ownerOnly || user.role === "owner",
  );

  return (
    <SidebarProvider>
      {/* Desktop Fixed Sidebar */}
      <Sidebar aria-label="Atelier Admin Navigation">
        <SidebarHeader>
          <Link href={`${base}/dashboard`} className="focus:outline-none">
            <Logo variant="editorial" />
          </Link>
          <Badge variant={user.role === "owner" ? "accent" : "secondary"}>
            {user.role}
          </Badge>
        </SidebarHeader>

        {/* Scrollable Navigation Items */}
        <SidebarContent aria-label="Admin navigation">
          <SidebarMenu>
            {visibleItems.map((item) => {
              const isActive =
                currentPath === item.href || currentPath.startsWith(`${item.href}/`);
              return (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href} className="w-full focus:outline-none">
                    <SidebarMenuButton
                      isActive={isActive}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {item.label}
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>

        {/* Pinned Desktop Footer */}
        <SidebarFooter>
          <div className="text-xs">
            <p className="font-semibold text-foreground truncate">{user.name}</p>
            <p className="text-muted-foreground truncate">{user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="inline-flex min-h-[38px] flex-1 items-center justify-center gap-1.5 border border-border bg-surface-elevated px-3 text-[11px] font-semibold uppercase tracking-wider text-foreground hover:bg-muted"
            >
              <span>Store</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              aria-label="Sign out of admin"
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* Main Content Area (Scrolls independently) */}
      <SidebarInset>
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface px-4 lg:hidden">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open admin menu"
              className="inline-flex h-11 w-11 items-center justify-center border border-border bg-surface-elevated text-foreground cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link href={`${base}/dashboard`}>
              <Logo variant="editorial" />
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={user.role === "owner" ? "accent" : "secondary"}>
              {user.role}
            </Badge>
            <Button variant="outline" size="sm" onClick={onLogout} aria-label="Sign out">
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        <SheetDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          side="left"
          title="Atelier Admin"
          subtitle={`${user.name} (${user.role})`}
        >
          <nav className="flex flex-col space-y-1.5">
            {visibleItems.map((item) => {
              const isActive =
                currentPath === item.href || currentPath.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setDrawerOpen(false)}
                  className={cn(
                    "flex min-h-[46px] items-center px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.14em]",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-surface",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </SheetDrawer>

        {/* Independent Scroll Container for Admin Main Views */}
        <main className="flex-1 overflow-y-auto scrollbar-luxury p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
