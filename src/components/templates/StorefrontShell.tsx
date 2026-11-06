"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShoppingBag } from "lucide-react";
import { Logo } from "@/components/atoms/Logo";
import { SheetDrawer } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export interface StorefrontShellProps {
  currentPath?: string;
  announcementBanner?: React.ReactNode;
  cartCount: number;
  onOpenCartDrawer: () => void;
  cartDrawerSlot?: React.ReactNode;
  storePaused?: boolean;
  storePausedMessage?: string;
  children: React.ReactNode;
}

const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/collections", label: "Lookbooks" },
  { href: "/about", label: "Portfolio & Story" },
  { href: "/custom-fit", label: "Custom Fit" },
  { href: "/press", label: "Press" },
  { href: "/order-lookup", label: "Track Order" },
] as const;

const FOOTER_HOUSE_LINKS = [
  { href: "/about", label: "Brand & Growth Portfolio 2026" },
  { href: "/collections", label: "Lookbooks & Archive" },
  { href: "/custom-fit", label: "Custom Fit & Bespoke" },
  { href: "/press", label: "Press & Editorials" },
] as const;

const FOOTER_SERVICE_LINKS = [
  { href: "/order-lookup", label: "Order Status & Lookup" },
  { href: "/contact", label: "Contact Concierge" },
  { href: "/size-guide", label: "Size & Measurement Guide" },
  { href: "/cart", label: "Shopping Bag" },
] as const;

const FOOTER_POLICY_LINKS = [
  { href: "/policies/shipping", label: "Shipping & Delivery" },
  { href: "/policies/returns", label: "Returns & Fit Adjustments" },
  { href: "/policies/privacy", label: "Privacy & Client Vault" },
  { href: "/policies/terms", label: "Terms of Service" },
] as const;

function isNavLinkActive(href: string, activePath: string): boolean {
  if (!activePath) return false;
  if (href === "/") return activePath === "/";
  if (href === "/order-lookup" && activePath.startsWith("/order/")) {
    return true;
  }
  return activePath === href || activePath.startsWith(`${href}/`);
}

export function StorefrontShell({
  currentPath,
  announcementBanner,
  cartCount,
  onOpenCartDrawer,
  cartDrawerSlot,
  storePaused = false,
  storePausedMessage,
  children,
}: StorefrontShellProps) {
  const pathname = usePathname();
  const activePath = currentPath ?? pathname ?? "";
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const isCustomFitActive = isNavLinkActive("/custom-fit", activePath);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-primary focus:px-4 focus:py-2 focus:text-xs focus:uppercase focus:text-primary-foreground"
      >
        Skip to main content
      </a>

      {announcementBanner}

      {storePaused && (
        <div
          role="status"
          className="border-b border-warning/40 bg-warning px-4 py-2 text-center text-xs font-medium text-warning-foreground"
        >
          {storePausedMessage ||
            "Orders are temporarily paused while our Abuja atelier fulfills current bespoke commissions."}
        </div>
      )}

      <header className="sticky top-0 z-40 border-b border-border bg-background">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="inline-flex h-11 w-11 items-center justify-center border border-border text-foreground lg:hidden cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link
              href="/"
              aria-label="Fadé Exclusive Home"
              aria-current={activePath === "/" ? "page" : undefined}
            >
              <Logo variant="editorial" />
            </Link>
          </div>

          <nav
            aria-label="Primary storefront navigation"
            className="hidden h-full lg:flex lg:items-center lg:gap-8"
          >
            {NAV_LINKS.map((item) => {
              const isActive = isNavLinkActive(item.href, activePath);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "relative inline-flex h-full items-center text-xs uppercase tracking-[0.18em] transition-colors",
                    isActive
                      ? "font-semibold text-accent after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:bg-accent"
                      : "font-medium text-foreground hover:text-accent",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/custom-fit"
              aria-current={isCustomFitActive ? "page" : undefined}
              className={cn(
                "hidden sm:inline-flex min-h-[40px] items-center border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors",
                isCustomFitActive
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-foreground/30 text-foreground hover:border-accent hover:bg-surface",
              )}
            >
              Bespoke Inquiry
            </Link>

            <button
              type="button"
              onClick={onOpenCartDrawer}
              data-testid="open-cart-button"
              aria-label={`Open shopping bag (${cartCount} items)`}
              className={cn(
                "relative inline-flex h-11 items-center gap-2 border px-3.5 text-xs font-semibold uppercase tracking-[0.14em] transition-colors cursor-pointer",
                isNavLinkActive("/cart", activePath) ||
                  isNavLinkActive("/checkout", activePath)
                  ? "border-accent bg-surface text-accent"
                  : "border-border bg-surface-elevated text-foreground hover:border-foreground",
              )}
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Bag</span>
              <span
                data-testid="cart-badge-count"
                className={cn(
                  "inline-flex h-5 min-w-[20px] items-center justify-center px-1 text-[10px] font-bold",
                  cartCount > 0
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {cartCount}
              </span>
            </button>
          </div>
        </div>
      </header>

      <SheetDrawer
        open={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
        side="left"
        title="FADÉ EXCLUSIVES"
        subtitle="African Luxury Fashion House"
      >
        <nav aria-label="Mobile navigation" className="flex flex-col space-y-1.5">
          {NAV_LINKS.map((item) => {
            const isActive = isNavLinkActive(item.href, activePath);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex min-h-[48px] items-center justify-between border-b border-border/60 px-3 text-xs uppercase tracking-[0.2em] transition-colors",
                  isActive
                    ? "border-l-2 border-l-accent bg-surface font-bold text-accent"
                    : "font-semibold text-foreground hover:text-accent",
                )}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span className="h-1.5 w-1.5 bg-accent" aria-hidden="true" />
                )}
              </Link>
            );
          })}
          {(() => {
            const isContactActive = isNavLinkActive("/contact", activePath);
            return (
              <Link
                href="/contact"
                aria-current={isContactActive ? "page" : undefined}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex min-h-[48px] items-center justify-between border-b border-border/60 px-3 text-xs uppercase tracking-[0.2em] transition-colors",
                  isContactActive
                    ? "border-l-2 border-l-accent bg-surface font-bold text-accent"
                    : "font-semibold text-foreground hover:text-accent",
                )}
              >
                <span>Contact Atelier</span>
                {isContactActive && (
                  <span className="h-1.5 w-1.5 bg-accent" aria-hidden="true" />
                )}
              </Link>
            );
          })()}
        </nav>
      </SheetDrawer>

      {cartDrawerSlot}

      <main id="main-content" className="flex-1">
        {children}
      </main>

      <footer className="border-t border-border bg-obsidian text-obsidian-foreground">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
            <div className="space-y-4 md:col-span-1">
              <Link
                href="/"
                aria-current={activePath === "/" ? "page" : undefined}
                className="inline-block"
              >
                <Logo variant="editorial" className="text-obsidian-foreground" />
              </Link>
              <p className="text-xs leading-relaxed text-obsidian-foreground/75">
                African luxury. Contemporary expression. Ready-to-wear, made-to-order,
                and bespoke occasionwear tailored in our Maitama, Abuja atelier.
              </p>
            </div>

            <div>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent">
                The House
              </h2>
              <ul className="mt-4 space-y-2.5 text-xs">
                {FOOTER_HOUSE_LINKS.map((link) => {
                  const isActive = isNavLinkActive(link.href, activePath);
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "inline-flex items-center gap-2 transition-colors",
                          isActive
                            ? "font-semibold text-accent underline decoration-accent decoration-2 underline-offset-4"
                            : "text-obsidian-foreground/80 hover:text-accent",
                        )}
                      >
                        {isActive && (
                          <span
                            className="inline-block h-1.5 w-1.5 bg-accent"
                            aria-hidden="true"
                          />
                        )}
                        <span>{link.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent">
                Client Services
              </h2>
              <ul className="mt-4 space-y-2.5 text-xs">
                {FOOTER_SERVICE_LINKS.map((link) => {
                  const isActive = isNavLinkActive(link.href, activePath);
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "inline-flex items-center gap-2 transition-colors",
                          isActive
                            ? "font-semibold text-accent underline decoration-accent decoration-2 underline-offset-4"
                            : "text-obsidian-foreground/80 hover:text-accent",
                        )}
                      >
                        {isActive && (
                          <span
                            className="inline-block h-1.5 w-1.5 bg-accent"
                            aria-hidden="true"
                          />
                        )}
                        <span>{link.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent">
                Legal &amp; Policies
              </h2>
              <ul className="mt-4 space-y-2.5 text-xs">
                {FOOTER_POLICY_LINKS.map((link) => {
                  const isActive = isNavLinkActive(link.href, activePath);
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "inline-flex items-center gap-2 transition-colors",
                          isActive
                            ? "font-semibold text-accent underline decoration-accent decoration-2 underline-offset-4"
                            : "text-obsidian-foreground/80 hover:text-accent",
                        )}
                      >
                        {isActive && (
                          <span
                            className="inline-block h-1.5 w-1.5 bg-accent"
                            aria-hidden="true"
                          />
                        )}
                        <span>{link.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-obsidian-foreground/15 pt-8 text-[11px] text-obsidian-foreground/60 sm:flex-row">
            <p>
              © {new Date().getFullYear()} Fadé Exclusive Fashion House Ltd. All
              rights reserved.
            </p>
            <p className="uppercase tracking-[0.22em]">
              ABUJA • LONDON • GLOBAL DIASPORA
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
