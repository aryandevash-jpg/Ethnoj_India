import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { HERO_POSTER, HERO_VIDEO } from "@/lib/products";

const headline = ["Woven", "in", "tradition,", "draped", "in", "you."];

export function Hero() {
  return (
    <section className="relative h-[92vh] min-h-[640px] w-full overflow-hidden">
      <video
        autoPlay muted loop playsInline
        poster={HERO_POSTER}
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src={HERO_VIDEO} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-maroon-deep/40 via-ink/30 to-ink/70" />
      <div className="absolute inset-0 bg-jali opacity-20" />

      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-5 pb-24 md:pb-32">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="mb-4 text-xs uppercase tracking-[0.4em] text-gold"
        >
          Festive Edit · AW 2026
        </motion.p>
        <h1 className="max-w-3xl font-display text-5xl leading-[1.05] text-cream md:text-7xl">
          {headline.map((w, i) => (
            <motion.span
              key={i}
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                delay: 0.35 + i * 0.04,
                duration: 0.9,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="mr-3 inline-block"
            >
              {w}
            </motion.span>
          ))}
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95, duration: 0.7 }}
          className="mt-6 max-w-xl text-cream/80"
        >
          Heirloom lehengas, hand-loomed sarees, and modern co-ord sets — crafted by the hands of artisans across India.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.15, duration: 0.7 }}
          className="mt-8 flex gap-4"
        >
          <Link
            to="/products"
            className="group relative overflow-hidden rounded-full bg-cream px-7 py-3 text-sm font-medium text-maroon transition-transform hover:scale-[1.02]"
          >
            Shop the Edit
            <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
          </Link>
          <Link
            to="/products"
            className="rounded-full border border-cream/60 px-7 py-3 text-sm text-cream hover:bg-cream/10"
          >
            Explore Bridal
          </Link>
        </motion.div>
      </div>

      {/* scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs uppercase tracking-[0.3em] text-cream/60"
      >
        scroll
      </motion.div>
    </section>
  );
}
