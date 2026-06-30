import { createFileRoute, Link } from "@tanstack/react-router";
import { Hero } from "@/components/Hero";
import { CategoryStrip } from "@/components/CategoryStrip";
import { ProductCard } from "@/components/ProductCard";
import { SectionHeading } from "@/components/SectionHeading";
import { products, reviews } from "@/lib/products";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ethnoj — Heirloom Indian Ethnic Wear" },
      { name: "description", content: "Lehengas, sarees, kurtis, co-ord sets and suits — handcrafted by Indian artisans." },
    ],
  }),
  component: Index,
});

function Index() {
  const featured = products.filter((p) => p.featured);
  return (
    <>
      <Hero />

      <section className="mx-auto max-w-7xl px-5 py-24">
        <SectionHeading kicker="The Edit" title="Pieces we're loving" sub="A small, considered selection — each piece chosen for craft, drape, and detail." />
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
          {featured.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </section>

      <CategoryStrip />

      {/* Story / philosophy band */}
      <section className="relative overflow-hidden bg-cream-deep/60 bg-jali py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 md:grid-cols-2">
          <motion.img
            initial={{ opacity: 0, scale: 1.05 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1000&q=80"
            alt="Artisan crafting"
            className="aspect-[4/5] w-full rounded-2xl object-cover gold-border"
          />
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-gold">Our craft</p>
            <h2 className="mt-3 font-display text-4xl text-ink md:text-5xl">From the loom to your wardrobe.</h2>
            <p className="mt-5 text-ink/70">
              Every Ethnoj piece passes through the hands of more than a dozen artisans —
              from Banarasi weavers, to Lucknowi chikankari embroiderers, to Jaipuri block-printers.
              We work with small clusters, pay fair wages, and keep our collections intentionally small.
            </p>
            <Link to="/products" className="mt-8 inline-block rounded-full border border-maroon px-6 py-2.5 text-sm text-maroon hover:bg-maroon hover:text-cream transition">
              Discover our craft →
            </Link>
          </div>
        </div>
      </section>

      {/* Reviews teaser */}
      <section className="mx-auto max-w-7xl px-5 py-24">
        <SectionHeading kicker="In their words" title="Loved by 10,000+ women" />
        <div className="grid gap-5 md:grid-cols-3">
          {reviews.slice(0, 3).map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="rounded-2xl bg-card p-6 gold-border"
            >
              <div className="mb-3 flex gap-0.5 text-gold">
                {Array.from({ length: r.rating }).map((_, k) => <Star key={k} className="h-3.5 w-3.5 fill-current" />)}
              </div>
              <p className="text-sm text-ink/80 italic">"{r.text}"</p>
              <p className="mt-4 font-display text-lg text-maroon">— {r.name}</p>
            </motion.div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link to="/reviews" className="text-sm text-maroon underline-offset-4 hover:underline">Read all reviews →</Link>
        </div>
      </section>
    </>
  );
}
