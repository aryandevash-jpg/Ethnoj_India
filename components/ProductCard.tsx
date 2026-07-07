"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/lib/products";
import { formatINR, useCart } from "@/lib/cart";
import { toast } from "sonner";

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: (i % 4) * 0.08,
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  }),
};

export function ProductCard({
  product,
  index = 0,
}: {
  product: Product;
  index?: number;
}) {
  const [hovered, setHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const add = useCart((s) => s.add);

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative"
    >
      <Link
        href={`/products/${product.id}`}
        className="block overflow-hidden rounded-2xl bg-card transition-all duration-500 gold-border"
      >
        <motion.div
          className="relative aspect-[3/4] overflow-hidden"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.5 }}
        >
          {!imageLoaded && product.image && (
            <div className="absolute inset-0 animate-pulse bg-cream-deep" />
          )}

          {product.image && (
            <motion.img
              src={product.image}
              alt={product.name}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              className="absolute inset-0 h-full w-full object-cover"
              animate={{
                scale: hovered && !product.videoUrl ? 1.08 : 1,
                filter: hovered && !product.videoUrl ? "brightness(0.9)" : "brightness(1)",
                opacity: product.videoUrl ? 0 : 1,
              }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            />
          )}

          {product.videoUrl && (
            <motion.video
              src={product.videoUrl}
              muted
              playsInline
              loop
              autoPlay
              className="absolute inset-0 h-full w-full object-cover"
              animate={{
                opacity: 1,
                scale: hovered ? 1.08 : 1,
              }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            />
          )}

          {product.hoverImage &&
            product.hoverImage !== product.image &&
            !product.videoUrl && (
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
                scale: hovered ? 1.08 : 1,
              }}
              transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
            />
          )}

          <AnimatePresence>
            {product.mrp && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="absolute left-3 top-3 rounded-full bg-maroon px-3 py-1.5 text-[10px] font-medium tracking-wider text-cream shadow-lg"
              >
                {Math.round((1 - product.price / product.mrp) * 100)}% OFF
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            onClick={(e) => {
              e.preventDefault();
              toast("Saved to wishlist", { description: product.name });
            }}
            className="absolute right-3 top-3 rounded-full bg-cream/95 p-2.5 text-ink/80 shadow-lg backdrop-blur-sm transition hover:bg-cream hover:text-maroon"
            initial={{ opacity: 0, y: -10, scale: 0.8 }}
            animate={{
              opacity: hovered ? 1 : 0,
              y: hovered ? 0 : -10,
              scale: hovered ? 1 : 0.8,
            }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Heart className="h-4 w-4" />
          </motion.button>

          <motion.div
            className="absolute bottom-3 left-3 right-3 flex gap-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: hovered ? 1 : 0,
              y: hovered ? 0 : 20,
            }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.button
              onClick={(e) => {
                e.preventDefault();
                add(product, product.sizes[0]);
                toast.success("Added to bag", { description: product.name });
              }}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-ink/90 px-4 py-3 text-xs font-medium tracking-wide text-cream backdrop-blur-sm transition hover:bg-ink"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ShoppingBag className="h-3.5 w-3.5" /> Quick Add
            </motion.button>
            <motion.div
              className="flex items-center justify-center rounded-full bg-cream/95 p-3 text-ink/80 backdrop-blur-sm transition hover:bg-cream hover:text-maroon"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Eye className="h-4 w-4" />
            </motion.div>
          </motion.div>

          <motion.div
            className="pointer-events-none absolute inset-0 rounded-t-2xl border-2 border-gold/0"
            animate={{
              borderColor: hovered
                ? "rgba(212, 164, 55, 0.4)"
                : "rgba(212, 164, 55, 0)",
            }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>

        <motion.div
          className="space-y-2 px-4 py-5"
          animate={{ y: hovered ? -4 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-lg leading-tight text-ink transition-colors group-hover:text-maroon">
              {product.name}
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <motion.span
              className="text-base font-semibold text-maroon"
              animate={{ scale: hovered ? 1.05 : 1 }}
              transition={{ duration: 0.2 }}
            >
              {formatINR(product.price)}
            </motion.span>
            {product.mrp && (
              <span className="text-sm text-ink/40 line-through">
                {formatINR(product.mrp)}
              </span>
            )}
          </div>

          <motion.div
            className="flex gap-1.5 pt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {product.colors.slice(0, 4).map((color, i) => (
              <motion.span
                key={color}
                className="h-4 w-4 rounded-full border border-ink/10 shadow-sm"
                style={{ backgroundColor: color }}
                initial={{ scale: 0 }}
                animate={{ scale: hovered ? 1 : 0 }}
                transition={{ delay: i * 0.05, duration: 0.2 }}
              />
            ))}
            {product.colors.length > 4 && (
              <span className="flex h-4 w-4 items-center justify-center text-[8px] text-ink/50">
                +{product.colors.length - 4}
              </span>
            )}
          </motion.div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
