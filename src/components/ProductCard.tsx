import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Heart, ShoppingBag } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/lib/products";
import { formatINR, useCart } from "@/lib/cart";
import { toast } from "sonner";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const [hovered, setHovered] = useState(false);
  const add = useCart((s) => s.add);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: (index % 4) * 0.06, ease: [0.4, 0, 0.2, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative"
    >
      <Link
        to="/products/$id"
        params={{ id: product.id }}
        className="block overflow-hidden rounded-2xl bg-card transition-shadow duration-300 hover:shadow-warm gold-border"
      >
        <div className="relative aspect-[3/4] overflow-hidden">
          <motion.img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
            animate={{ scale: hovered ? 1.04 : 1 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          />
          {/* Drape-wipe reveal of hover image via clip-path */}
          <motion.img
            src={product.hoverImage}
            alt=""
            loading="lazy"
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
            initial={false}
            animate={{
              clipPath: hovered
                ? "polygon(0 0, 100% 0, 100% 100%, 0 100%)"
                : "polygon(0 0, 0 0, 0 100%, 0 100%)",
            }}
            transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
          />

          {/* Discount badge */}
          {product.mrp && (
            <div className="absolute left-3 top-3 rounded-full bg-maroon px-2.5 py-1 text-[10px] font-medium tracking-wider text-cream">
              {Math.round((1 - product.price / product.mrp) * 100)}% OFF
            </div>
          )}

          {/* Wishlist */}
          <motion.button
            onClick={(e) => { e.preventDefault(); toast("Saved to wishlist", { description: product.name }); }}
            className="absolute right-3 top-3 rounded-full bg-cream/90 p-2 text-ink/80 backdrop-blur hover:text-maroon"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : -6 }}
          >
            <Heart className="h-4 w-4" />
          </motion.button>

          {/* Quick add */}
          <motion.button
            onClick={(e) => {
              e.preventDefault();
              add(product, product.sizes[0]);
              toast.success("Added to bag", { description: product.name });
            }}
            className="absolute bottom-3 left-3 right-3 flex items-center justify-center gap-2 rounded-full bg-ink/90 px-4 py-2.5 text-xs font-medium tracking-wide text-cream backdrop-blur"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 12 }}
            transition={{ duration: 0.25 }}
          >
            <ShoppingBag className="h-3.5 w-3.5" /> Quick Add
          </motion.button>
        </div>

        <div className="space-y-1 px-4 py-4">
          <h3 className="font-display text-lg leading-tight text-ink">{product.name}</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold text-maroon">{formatINR(product.price)}</span>
            {product.mrp && (
              <span className="text-xs text-ink/40 line-through">{formatINR(product.mrp)}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
