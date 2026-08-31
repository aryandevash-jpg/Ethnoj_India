import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "./products";

interface WishlistState {
  items: Product[];
  isLoading: boolean;
  add: (product: Product) => void;
  remove: (id: string) => void;
  toggle: (product: Product) => void;
  has: (id: string) => boolean;
  clear: () => void;
  setItems: (items: Product[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      add: (product) =>
        set((s) => {
          if (s.items.find((i) => i.id === product.id)) return s;
          return { items: [...s.items, product] };
        }),
      remove: (id) =>
        set((s) => ({
          items: s.items.filter((i) => i.id !== id),
        })),
      toggle: (product) => {
        const state = get();
        if (state.has(product.id)) {
          state.remove(product.id);
        } else {
          state.add(product);
        }
      },
      has: (id) => get().items.some((i) => i.id === id),
      clear: () => set({ items: [] }),
      setItems: (items) => set({ items }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: "ethnoj-wishlist",
    }
  )
);
