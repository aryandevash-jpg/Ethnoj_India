"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, Trash2, Ticket, Loader2, Check, Truck } from "lucide-react";
import { formatINR, useCart } from "@/lib/cart";
import { validateCoupon } from "@/hooks/use-coupons";
import Link from "next/link";
import { toast } from "sonner";
import type { CouponValidationResult } from "@/lib/database.types";

const SHIPPING_FEE = 99;
const FREE_SHIPPING_THRESHOLD = 1499;

export function CartDrawer() {
  const { items, open, setOpen, remove, setQty, subtotal, clear } = useCart();
  
  const [couponCode, setCouponCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResult | null>(null);
  
  const cartSubtotal = subtotal();
  const baseShipping = cartSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const hasFreeShipping = appliedCoupon?.valid && appliedCoupon.free_shipping;
  const shippingFee = hasFreeShipping ? 0 : baseShipping;
  const discount = appliedCoupon?.valid ? (appliedCoupon.calculated_discount || 0) : 0;
  const total = cartSubtotal - discount + shippingFee;
  
  useEffect(() => {
    if (appliedCoupon?.valid && cartSubtotal > 0) {
      revalidateCoupon();
    }
  }, [cartSubtotal]);

  const revalidateCoupon = async () => {
    if (!appliedCoupon?.valid) return;
    const result = await validateCoupon(couponCode, cartSubtotal);
    if (!result.valid) {
      setAppliedCoupon(null);
      setCouponCode("");
      toast.error(result.message);
    } else {
      setAppliedCoupon(result);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    setIsValidating(true);
    const result = await validateCoupon(couponCode.trim(), cartSubtotal);
    setIsValidating(false);

    if (result.valid) {
      setAppliedCoupon(result);
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast("Coupon removed");
  };

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
              <div className="border-t border-gold/30 p-5 space-y-4">
                {/* Coupon Section */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-ink/70">
                    <Ticket className="h-4 w-4" />
                    Have a coupon?
                  </label>
                  {appliedCoupon?.valid ? (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between rounded-lg bg-emerald/10 px-3 py-2 border border-emerald/30"
                    >
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald" />
                        <span className="text-sm font-medium text-emerald">
                          {couponCode.toUpperCase()}
                        </span>
                        {appliedCoupon.free_shipping ? (
                          <span className="text-xs text-emerald/80">
                            Free Shipping!
                          </span>
                        ) : (
                          <span className="text-xs text-emerald/80">
                            -{formatINR(discount)}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-emerald/70 hover:text-emerald"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </motion.div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter code"
                        className="flex-1 h-10 rounded-lg border border-gold/30 bg-card px-3 text-sm uppercase placeholder:normal-case focus:border-maroon focus:ring-2 focus:ring-maroon/20 outline-none"
                        onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                      />
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleApplyCoupon}
                        disabled={isValidating || !couponCode.trim()}
                        className="px-4 h-10 rounded-lg bg-cream-deep text-sm font-medium text-ink hover:bg-gold/20 transition disabled:opacity-50"
                      >
                        {isValidating ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Apply"
                        )}
                      </motion.button>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 pt-2 border-t border-gold/20">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink/70">Subtotal</span>
                    <span className="text-ink">{formatINR(cartSubtotal)}</span>
                  </div>
                  
                  {discount > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-emerald">Coupon Discount</span>
                      <span className="text-emerald">-{formatINR(discount)}</span>
                    </motion.div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink/70 flex items-center gap-1">
                      Shipping
                      {hasFreeShipping && (
                        <Truck className="h-3.5 w-3.5 text-emerald" />
                      )}
                    </span>
                    {shippingFee === 0 ? (
                      <span className="text-emerald">Free</span>
                    ) : (
                      <span className="text-ink">{formatINR(shippingFee)}</span>
                    )}
                  </div>
                  
                  {baseShipping > 0 && !hasFreeShipping && cartSubtotal < FREE_SHIPPING_THRESHOLD && (
                    <p className="text-xs text-ink/50">
                      Add {formatINR(FREE_SHIPPING_THRESHOLD - cartSubtotal)} more for free shipping
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between pt-2 border-t border-gold/20">
                    <span className="font-medium text-ink">Total</span>
                    <span className="font-display text-xl text-maroon">
                      {formatINR(total)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      clear();
                      setAppliedCoupon(null);
                      setCouponCode("");
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
