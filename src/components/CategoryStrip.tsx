import { Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { categories } from "@/lib/products";

export function CategoryStrip() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gold">Curated Edits</p>
          <h2 className="mt-2 font-display text-4xl text-ink md:text-5xl">Shop by occasion</h2>
        </div>
        <Link to="/products" className="hidden text-sm text-maroon underline-offset-4 hover:underline md:block">
          View all →
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {categories.map((c, i) => (
          <Tile key={c.id} index={i} {...c} />
        ))}
      </div>
    </section>
  );
}

function Tile({ id, label, tagline, image, index }: typeof categories[number] & { index: number }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1.0, 1.12]);
  const y = useTransform(scrollYProgress, [0, 1], [0, index % 2 ? -30 : -10]);

  return (
    <motion.a
      ref={ref}
      href={`/products?cat=${id}`}
      style={{ y }}
      className="group relative block aspect-[3/4] overflow-hidden rounded-2xl gold-border"
    >
      <motion.img
        src={image}
        alt={label}
        loading="lazy"
        style={{ scale }}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4 text-cream">
        <p className="text-[10px] uppercase tracking-[0.25em] text-gold">{tagline}</p>
        <h3 className="font-display text-xl">{label}</h3>
      </div>
    </motion.a>
  );
}
