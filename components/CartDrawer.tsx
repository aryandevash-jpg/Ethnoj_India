"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { formatINR, useCart } from "@/lib/cart";
import Link from "next/link";
import { toast } from "sonner";

export function CartDrawer() {
  const { items, open, setOpen, remove, setQty, subtotal, clear } = useCart();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-md flex-col bg-cream shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-gold/30 p-5">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-5 w-5 text-maroon" />
                <h2 className="font-display text-xl text-ink">Your Bag</h2>
                <span className="rounded-full bg-maroon px-2 py-0.5 text-xs text-cream">
                  {items.length}
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setOpen(false)}
                className="rounded-full p-2 text-ink/70 transition hover:bg-cream-deep hover:text-maroon"
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.1 }}
                  >
                    <ShoppingBag className="h-16 w-16 text-gold/30" />
                  </motion.div>
                  <p className="mt-4 font-display text-xl text-ink">
                    Your bag is empty
                  </p>
                  <p className="mt-2 text-sm text-ink/60">
                    Add some beautiful pieces to get started.
                  </p>
                  <Link
                    href="/products"
                    onClick={() => setOpen(false)}
                    className="mt-6 rounded-full bg-maroon px-6 py-3 text-sm font-medium text-cream transition hover:bg-maroon-deep"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {items.map((item) => (
                      <motion.div
                        key={`${item.product.id}-${item.size}`}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex gap-4 rounded-xl bg-card p-3 gold-border"
                      >
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="h-24 w-20 rounded-lg object-cover"
                        />
                        <div className="flex flex-1 flex-col justify-between">
                          <div>
                            <h3 className="font-display text-base text-ink">
                              {item.product.name}
                            </h3>
                            <p className="text-xs text-ink/60">
                              Size: {item.size}
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() =>
                                  setQty(
                                    item.product.id,
                                    item.size,
                                    item.qty - 1
                                  )
                                }
                                className="rounded-full border border-gold/40 p-1 text-ink/70 hover:bg-cream-deep"
                              >
                                <Minus className="h-3 w-3" />
                              </motion.button>
                              <span className="w-6 text-center text-sm">
                                {item.qty}
                              </span>
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() =>
                                  setQty(
                                    item.product.id,
                                    item.size,
                                    item.qty + 1
                                  )
                                }
                                className="rounded-full border border-gold/40 p-1 text-ink/70 hover:bg-cream-deep"
                              >
                                <Plus className="h-3 w-3" />
                              </motion.button>
                            </div>
                            <span className="text-sm font-semibold text-maroon">
                              {formatINR(item.product.price * item.qty)}
                            </span>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            remove(item.product.id, item.size);
                            toast("Removed from bag", {
                              description: item.product.name,
                            });
                          }}
                          className="self-start rounded-full p-1 text-ink/40 hover:text-maroon"
                        >
                          <Trash2 className="h-4 w-4" />
                        </motion.button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-gold/30 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-ink/70">Subtotal</span>
                  <span className="font-display text-xl text-maroon">
                    {formatINR(subtotal())}
                  </span>
                </div>
                <p className="mb-4 text-xs text-ink/50">
                  Shipping & taxes calculated at checkout
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      clear();
                      toast("Bag cleared");
                    }}
                    className="flex-1 rounded-full border border-gold/40 py-3 text-sm font-medium text-ink/70 transition hover:bg-cream-deep"
                  >
                    Clear Bag
                  </button>
                  <button
                    onClick={() =>
                      toast(
                        "Razorpay checkout will open here once payments are connected"
                      )
                    }
                    className="flex-1 rounded-full bg-maroon py-3 text-sm font-medium text-cream transition hover:bg-maroon-deep"
                  >
                    Checkout
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
