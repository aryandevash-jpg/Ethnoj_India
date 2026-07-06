import { create } from "zustand";
import type { Product } from "./products";

export interface CartItem {
  product: Product;
  size: string;
  qty: number;
}

interface CartState {
  items: CartItem[];
  open: boolean;
  setOpen: (o: boolean) => void;
  add: (product: Product, size: string, qty?: number) => void;
  remove: (id: string, size: string) => void;
  setQty: (id: string, size: string, qty: number) => void;
  clear: () => void;
  count: () => number;
  subtotal: () => number;
}

export const useCart = create<CartState>((set, get) => ({
  items: [],
  open: false,
  setOpen: (o) => set({ open: o }),
  add: (product, size, qty = 1) =>
    set((s) => {
      const existing = s.items.find(
        (i) => i.product.id === product.id && i.size === size
      );
      if (existing) {
        return {
          items: s.items.map((i) =>
            i === existing ? { ...i, qty: i.qty + qty } : i
          ),
        };
      }
      return { items: [...s.items, { product, size, qty }] };
    }),
  remove: (id, size) =>
    set((s) => ({
      items: s.items.filter((i) => !(i.product.id === id && i.size === size)),
    })),
  setQty: (id, size, qty) =>
    set((s) => ({
      items: s.items.map((i) =>
        i.product.id === id && i.size === size
          ? { ...i, qty: Math.max(1, qty) }
          : i
      ),
    })),
  clear: () => set({ items: [] }),
  count: () => get().items.reduce((n, i) => n + i.qty, 0),
  subtotal: () => get().items.reduce((n, i) => n + i.qty * i.product.price, 0),
}));

export const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
