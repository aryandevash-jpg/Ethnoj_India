import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "./products";
import type { CouponValidationResult } from "./database.types";

export interface CartItem {
  product: Product;
  size: string;
  qty: number;
}

interface CartState {
  items: CartItem[];
  open: boolean;
  couponCode: string;
  appliedCoupon: CouponValidationResult | null;
  setOpen: (o: boolean) => void;
  add: (product: Product, size: string, qty?: number) => void;
  remove: (id: string, size: string) => void;
  setQty: (id: string, size: string, qty: number) => void;
  clear: () => void;
  setCouponCode: (code: string) => void;
  setAppliedCoupon: (coupon: CouponValidationResult | null) => void;
  clearCoupon: () => void;
  count: () => number;
  subtotal: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      open: false,
      couponCode: "",
      appliedCoupon: null,
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
      clear: () => set({ items: [], couponCode: "", appliedCoupon: null }),
      setCouponCode: (couponCode) => set({ couponCode }),
      setAppliedCoupon: (appliedCoupon) => set({ appliedCoupon }),
      clearCoupon: () => set({ couponCode: "", appliedCoupon: null }),
      count: () => get().items.reduce((n, i) => n + i.qty, 0),
      subtotal: () => get().items.reduce((n, i) => n + i.qty * i.product.price, 0),
    }),
    {
      name: "ethnoj-cart",
      partialize: (state) => ({
        items: state.items,
        couponCode: state.couponCode,
        appliedCoupon: state.appliedCoupon,
      }),
    }
  )
);

export const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
