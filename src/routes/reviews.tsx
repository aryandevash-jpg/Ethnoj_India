import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { reviews } from "@/lib/products";
import { SectionHeading } from "@/components/SectionHeading";

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "Reviews — Ethnoj" },
      { name: "description", content: "Read what our customers are saying about Ethnoj ethnic wear." },
    ],
  }),
  component: ReviewsPage,
});

function ReviewsPage() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-16">
      <SectionHeading kicker="In their words" title="Customer stories" sub="Real photos and words from the women who wear Ethnoj." />

      <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5">
        {reviews.map((r, i) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 24, rotate: -2 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: (i % 4) * 0.08 }}
            whileHover={{ y: -4 }}
            className="group relative break-inside-avoid overflow-hidden rounded-2xl bg-card p-5 gold-border"
          >
            {r.image && (
              <div className="relative -m-5 mb-4 overflow-hidden">
                <img src={r.image} alt="" loading="lazy" className="w-full" />
                <div className="absolute right-0 top-0 h-12 w-12 bg-gradient-to-bl from-gold/70 to-transparent" />
              </div>
            )}
            <div className="mb-2 flex gap-0.5 text-gold">
              {Array.from({ length: r.rating }).map((_, k) => <Star key={k} className="h-3.5 w-3.5 fill-current" />)}
            </div>
            <p className="text-sm text-ink/80 italic leading-relaxed">"{r.text}"</p>
            <p className="mt-3 font-display text-lg text-maroon">— {r.name}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
