"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { BannerBar } from "@/components/modules/BannerBar";
import { StorefrontShell } from "@/components/templates/StorefrontShell";
import { CartDrawerContainer } from "@/containers/cart/CartDrawerContainer";
import { usePublicBanners } from "@/services/banners/banners.hooks";
import { usePublicSettings } from "@/services/settings/settings.hooks";
import { useCartStore } from "@/stores/cart.store";
import { useUiStore } from "@/stores/ui.store";

export function StorefrontShellContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const cartItems = useCartStore((s) => s.items);
  const hasHydrated = useCartStore((s) => s.hasHydrated);
  const setCartDrawerOpen = useUiStore((s) => s.setCartDrawerOpen);
  const dismissedKeys = useUiStore((s) => s.dismissedBannerKeys);
  const dismissBanner = useUiStore((s) => s.dismissBanner);

  const bannersQuery = usePublicBanners();
  const settingsQuery = usePublicSettings();

  const cartCount = hasHydrated
    ? cartItems.reduce((sum, item) => sum + item.qty, 0)
    : 0;

  const announcementBanner = (bannersQuery.data ?? []).find((b) => {
    if (b.type !== "announcement_bar") return false;
    const key = `${b.id}:v${b.version}`;
    return !dismissedKeys.includes(key);
  });

  return (
    <StorefrontShell
      currentPath={pathname}
      cartCount={cartCount}
      onOpenCartDrawer={() => setCartDrawerOpen(true)}
      cartDrawerSlot={<CartDrawerContainer />}
      storePaused={settingsQuery.data?.storePaused}
      storePausedMessage={settingsQuery.data?.storePausedMessage}
      announcementBanner={
        announcementBanner ? (
          <BannerBar banner={announcementBanner} onDismiss={dismissBanner} />
        ) : undefined
      }
    >
      {children}
    </StorefrontShell>
  );
}
