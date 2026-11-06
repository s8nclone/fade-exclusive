import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface UiStoreState {
  isCartDrawerOpen: boolean;
  isMobileMenuOpen: boolean;
  isShopFilterOpen: boolean;
  dismissedBannerKeys: string[];
  setCartDrawerOpen: (open: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  setShopFilterOpen: (open: boolean) => void;
  dismissBanner: (bannerKey: string) => void;
}

export const useUiStore = create<UiStoreState>()(
  persist(
    (set) => ({
      isCartDrawerOpen: false,
      isMobileMenuOpen: false,
      isShopFilterOpen: false,
      dismissedBannerKeys: [],
      setCartDrawerOpen: (open) => set({ isCartDrawerOpen: open }),
      setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
      setShopFilterOpen: (open) => set({ isShopFilterOpen: open }),
      dismissBanner: (bannerKey) =>
        set((state) => ({
          dismissedBannerKeys: state.dismissedBannerKeys.includes(bannerKey)
            ? state.dismissedBannerKeys
            : [...state.dismissedBannerKeys, bannerKey],
        })),
    }),
    {
      name: "fade-exclusive-ui-v1",
      version: 1,
      skipHydration: true,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        dismissedBannerKeys: state.dismissedBannerKeys,
      }),
    },
  ),
);

export { useUiStore as useUIStore };
