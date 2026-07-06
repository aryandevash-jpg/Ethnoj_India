"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Search, ShoppingBag, Menu, X } from "lucide-react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { useCart } from "@/lib/cart";
import { useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/reviews", label: "Reviews" },
  { href: "/contact", label: "Contact" },
];

const menuVariants = {
  closed: {
    opacity: 0,
    x: "100%",
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
  },
  open: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const linkVariants = {
  closed: { opacity: 0, x: 20 },
  open: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.1, duration: 0.4 },
  }),
};

export function Navbar() {
  const pathname = usePathname();
  const count = useCart((s) => s.items.reduce((n, i) => n + i.qty, 0));
  const setOpen = useCart((s) => s.setOpen);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  return (
    <>
      <header
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? "bg-cream shadow-soft" 
            : "bg-cream"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:h-20">
          <Link href="/" className="relative z-10">
            <motion.span
              className="font-display text-2xl tracking-wide text-maroon"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              Ethnoj
              <motion.span
                className="text-gold"
                animate={{ opacity: [1, 0.6, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                .
              </motion.span>
            </motion.span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex lg:gap-10">
            {links.map((l, i) => {
              const active = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
              return (
                <motion.div
                  key={l.href}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    href={l.href}
                    className={`group relative text-sm tracking-wide transition-colors ${
                      active ? "text-maroon" : "text-ink/70 hover:text-maroon"
                    }`}
                  >
                    {l.label}
                    <motion.span
                      className="absolute -bottom-1 left-0 h-0.5 w-full origin-left bg-gold"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: active ? 1 : 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          <div className="flex items-center gap-1 md:gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="hidden rounded-full p-2.5 text-ink/70 transition hover:bg-cream-deep hover:text-maroon md:block"
            >
              <Search className="h-5 w-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="hidden rounded-full p-2.5 text-ink/70 transition hover:bg-cream-deep hover:text-maroon md:block"
            >
              <Heart className="h-5 w-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setOpen(true)}
              className="relative rounded-full p-2.5 text-ink/70 transition hover:bg-cream-deep hover:text-maroon"
              aria-label="Open cart"
            >
              <ShoppingBag className="h-5 w-5" />
              <AnimatePresence mode="popLayout">
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ y: -8, opacity: 0, scale: 0.6 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 8, opacity: 0, scale: 0.6 }}
                    transition={{ type: "spring", stiffness: 400, damping: 18 }}
                    className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-maroon px-1.5 text-[10px] font-semibold text-cream"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(true)}
              className="rounded-full p-2.5 text-ink/70 transition hover:bg-cream-deep hover:text-maroon md:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </motion.button>
          </div>
        </div>

        {/* Bottom border accent */}
        <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      </header>

      {/* Spacer to prevent content from going under fixed navbar */}
      <div className="h-16 md:h-20" />

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm md:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed bottom-0 right-0 top-0 z-50 w-80 bg-cream p-8 shadow-2xl md:hidden"
            >
              <div className="flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-full p-2 text-ink/70 hover:bg-cream-deep hover:text-maroon"
                >
                  <X className="h-6 w-6" />
                </motion.button>
              </div>

              <nav className="mt-12 space-y-6">
                {links.map((l, i) => (
                  <motion.div
                    key={l.href}
                    custom={i}
                    variants={linkVariants}
                    initial="closed"
                    animate="open"
                  >
                    <Link
                      href={l.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="block font-display text-3xl text-ink transition hover:text-maroon"
                    >
                      {l.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute bottom-8 left-8 right-8"
              >
                <div className="flex gap-4">
                  <button className="flex-1 rounded-full bg-maroon py-3 text-sm font-medium text-cream">
                    Search
                  </button>
                  <button className="flex-1 rounded-full border border-maroon py-3 text-sm font-medium text-maroon">
                    Wishlist
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
