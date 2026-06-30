import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { formatINR, useCart } from "@/lib/cart";

export function CartDrawer() {
  const { items, open, setOpen, remove, setQty, subtotal } = useCart();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <motion.aside
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 200, damping: 28 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-cream shadow-warm"
          >
            <div className="flex items-center justify-between border-b border-gold/30 px-5 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-gold">Your bag</p>
                <h2 className="font-display text-2xl text-ink">{items.length} item{items.length !== 1 && "s"}</h2>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-cream-deep">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <ShoppingBag className="mb-4 h-10 w-10 text-gold" />
                  <p className="font-display text-xl text-ink">Your bag is empty</p>
                  <p className="mt-2 text-sm text-ink/60">Begin your edit.</p>
                  <Link
                    to="/products" onClick={() => setOpen(false)}
                    className="mt-6 rounded-full bg-maroon px-6 py-2.5 text-sm text-cream"
                  >Explore</Link>
                </div>
              ) : (
                <ul className="space-y-4">
                  <AnimatePresence initial={false}>
                    {items.map((i) => (
                      <motion.li
                        key={i.product.id + i.size}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0, x: 30 }}
                        transition={{ duration: 0.3 }}
                        className="flex gap-3 border-b border-gold/15 pb-4"
                      >
                        <img src={i.product.image} alt={i.product.name} className="h-24 w-20 rounded-md object-cover" />
                        <div className="flex flex-1 flex-col">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="font-display text-base text-ink">{i.product.name}</h3>
                              <p className="text-xs text-ink/60">Size {i.size}</p>
                            </div>
                            <button onClick={() => remove(i.product.id, i.size)} className="text-ink/40 hover:text-maroon">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="mt-auto flex items-center justify-between">
                            <div className="flex items-center gap-2 rounded-full border border-gold/40 px-1">
                              <button onClick={() => setQty(i.product.id, i.size, i.qty - 1)} className="p-1 text-ink/70"><Minus className="h-3 w-3" /></button>
                              <span className="w-5 text-center text-sm">{i.qty}</span>
                              <button onClick={() => setQty(i.product.id, i.size, i.qty + 1)} className="p-1 text-ink/70"><Plus className="h-3 w-3" /></button>
                            </div>
                            <span className="text-sm font-semibold text-maroon">{formatINR(i.qty * i.product.price)}</span>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-gold/30 bg-cream-deep/40 px-5 py-5">
                <div className="mb-4 flex justify-between text-sm">
                  <span className="text-ink/70">Subtotal</span>
                  <span className="font-semibold text-ink">{formatINR(subtotal())}</span>
                </div>
                <button className="w-full rounded-full bg-maroon py-3 text-sm font-medium text-cream transition hover:bg-maroon-deep">
                  Checkout · Pay with Razorpay
                </button>
                <p className="mt-2 text-center text-[11px] text-ink/50">Shipping & taxes calculated at checkout</p>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
