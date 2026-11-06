import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartStoredItem {
  variantId: string;
  productId: string;
  qty: number;
  // Minimal display hints only; authoritative prices & stock always come from server
  productNameHint?: string;
  productSlugHint?: string;
  variantLabelHint?: string;
  imageUrlHint?: string;
}

interface CartStoreState {
  items: CartStoredItem[];
  favoriteProductIds: string[];
  couponCode: string | null;
  hasHydrated: boolean;
  setHasHydrated: (hydrated: boolean) => void;
  addItem: (item: CartStoredItem) => void;
  updateQuantity: (variantId: string, qty: number) => void;
  changeVariant: (
    oldVariantId: string,
    newVariantId: string,
    newVariantLabelHint?: string,
  ) => void;
  removeItem: (variantId: string) => void;
  toggleFavorite: (productId: string) => boolean;
  setCouponCode: (code: string | null) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStoreState>()(
  persist(
    (set, get) => ({
      items: [],
      favoriteProductIds: [],
      couponCode: null,
      hasHydrated: false,
      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),
      addItem: (incoming) =>
        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) => i.variantId === incoming.variantId,
          );
          if (existingIndex >= 0) {
            const updated = [...state.items];
            const existing = updated[existingIndex];
            if (existing) {
              updated[existingIndex] = {
                ...existing,
                qty: Math.min(20, existing.qty + incoming.qty),
                productNameHint:
                  incoming.productNameHint ?? existing.productNameHint,
                productSlugHint:
                  incoming.productSlugHint ?? existing.productSlugHint,
                variantLabelHint:
                  incoming.variantLabelHint ?? existing.variantLabelHint,
                imageUrlHint: incoming.imageUrlHint ?? existing.imageUrlHint,
              };
            }
            return { items: updated };
          }
          return {
            items: [
              ...state.items,
              {
                ...incoming,
                qty: Math.min(20, Math.max(1, incoming.qty)),
              },
            ],
          };
        }),
      updateQuantity: (variantId, qty) =>
        set((state) => {
          if (qty <= 0) {
            return {
              items: state.items.filter((i) => i.variantId !== variantId),
            };
          }
          return {
            items: state.items.map((i) =>
              i.variantId === variantId
                ? { ...i, qty: Math.min(20, qty) }
                : i,
            ),
          };
        }),
      changeVariant: (oldVariantId, newVariantId, newVariantLabelHint) =>
        set((state) => {
          if (oldVariantId === newVariantId) return state;
          const oldItem = state.items.find((i) => i.variantId === oldVariantId);
          if (!oldItem) return state;

          const existingTarget = state.items.find(
            (i) => i.variantId === newVariantId,
          );
          if (existingTarget) {
            // Merge into existing target variant
            return {
              items: state.items
                .filter((i) => i.variantId !== oldVariantId)
                .map((i) =>
                  i.variantId === newVariantId
                    ? {
                        ...i,
                        qty: Math.min(20, i.qty + oldItem.qty),
                        variantLabelHint:
                          newVariantLabelHint ?? i.variantLabelHint,
                      }
                    : i,
                ),
            };
          }

          return {
            items: state.items.map((i) =>
              i.variantId === oldVariantId
                ? {
                    ...i,
                    variantId: newVariantId,
                    variantLabelHint:
                      newVariantLabelHint ?? i.variantLabelHint,
                  }
                : i,
            ),
          };
        }),
      removeItem: (variantId) =>
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        })),
      toggleFavorite: (productId) => {
        const current = get().favoriteProductIds;
        const exists = current.includes(productId);
        const next = exists
          ? current.filter((id) => id !== productId)
          : [...current, productId];
        set({ favoriteProductIds: next });
        return !exists;
      },
      setCouponCode: (code) =>
        set({ couponCode: code ? code.trim().toUpperCase() : null }),
      clearCart: () => set({ items: [], couponCode: null }),
    }),
    {
      name: "fade-exclusive-cart-v1",
      version: 1,
      skipHydration: true,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        favoriteProductIds: state.favoriteProductIds,
        couponCode: state.couponCode,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
