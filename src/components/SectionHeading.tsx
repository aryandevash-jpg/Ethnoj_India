import { motion } from "framer-motion";

export function SectionHeading({ kicker, title, sub }: { kicker?: string; title: string; sub?: string }) {
  return (
    <div className="mx-auto mb-12 max-w-2xl text-center">
      {kicker && <p className="text-xs uppercase tracking-[0.4em] text-gold">{kicker}</p>}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="mt-3 font-display text-4xl text-ink md:text-5xl text-balance"
      >
        {title}
      </motion.h2>
      {sub && <p className="mt-4 text-ink/70">{sub}</p>}
      <div className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-gold to-transparent" />
    </div>
  );
}
