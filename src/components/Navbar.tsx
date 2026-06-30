import { Link, useRouterState } from "@tanstack/react-router";
import { Heart, Search, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/lib/cart";

const links = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Shop" },
  { to: "/reviews", label: "Reviews" },
  { to: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const count = useCart((s) => s.items.reduce((n, i) => n + i.qty, 0));
  const setOpen = useCart((s) => s.setOpen);

  return (
    <header className="glass-cream sticky top-0 z-50">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
        <Link to="/" className="font-display text-2xl tracking-wide text-maroon">
          Ethnoj
          <span className="text-gold">.</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => {
            const active = pathname === l.to || (l.to !== "/" && pathname.startsWith(l.to));
            return (
              <Link
                key={l.to}
                to={l.to}
                className="group relative text-sm tracking-wide text-ink/80 transition-colors hover:text-maroon"
              >
                {l.label}
                <span
                  className={`absolute -bottom-1 left-0 h-px w-full origin-left bg-gold transition-transform duration-300 ${
                    active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <button className="rounded-full p-2 text-ink/70 transition hover:bg-cream-deep hover:text-maroon">
            <Search className="h-4 w-4" />
          </button>
          <button className="rounded-full p-2 text-ink/70 transition hover:bg-cream-deep hover:text-maroon">
            <Heart className="h-4 w-4" />
          </button>
          <button
            onClick={() => setOpen(true)}
            className="relative rounded-full p-2 text-ink/70 transition hover:bg-cream-deep hover:text-maroon"
            aria-label="Open cart"
          >
            <ShoppingBag className="h-4 w-4" />
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ y: -8, opacity: 0, scale: 0.6 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: 8, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 18 }}
                  className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-maroon px-1 text-[10px] font-semibold text-cream"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
    </header>
  );
}
