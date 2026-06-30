import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { categories, products, type Category } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { motion } from "framer-motion";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Shop — Ethnoj" },
      { name: "description", content: "Browse lehengas, sarees, kurtis, co-ord sets and suits at Ethnoj." },
    ],
  }),
  component: ProductsPage,
});

type Sort = "featured" | "price-asc" | "price-desc";

function ProductsPage() {
  const [cat, setCat] = useState<Category | "all">("all");
  const [sort, setSort] = useState<Sort>("featured");
  const [maxPrice, setMaxPrice] = useState(30000);

  const filtered = useMemo(() => {
    let list = products.filter((p) => (cat === "all" || p.category === cat) && p.price <= maxPrice);
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [cat, sort, maxPrice]);

  return (
    <div className="mx-auto max-w-7xl px-5 py-12">
      <motion.div
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
        className="mb-10 border-b border-gold/30 pb-6"
      >
        <p className="text-xs uppercase tracking-[0.4em] text-gold">The Collection</p>
        <h1 className="mt-2 font-display text-5xl text-ink">Shop all</h1>
      </motion.div>

      {/* Category tabs */}
      <div className="mb-8 flex flex-wrap gap-2">
        {(["all", ...categories.map((c) => c.id)] as const).map((id) => {
          const label = id === "all" ? "All" : categories.find((c) => c.id === id)?.label ?? id;
          const active = cat === id;
          return (
            <button
              key={id}
              onClick={() => setCat(id as Category | "all")}
              className={`relative rounded-full px-5 py-2 text-sm transition ${
                active ? "bg-maroon text-cream" : "border border-gold/40 text-ink/80 hover:bg-cream-deep"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-8 md:grid-cols-[240px_1fr]">
        {/* Filters */}
        <aside className="hidden space-y-7 md:block">
          <div>
            <h3 className="mb-3 text-xs uppercase tracking-widest text-ink/60">Sort by</h3>
            <select
              value={sort} onChange={(e) => setSort(e.target.value as Sort)}
              className="w-full rounded-md border border-gold/40 bg-card px-3 py-2 text-sm"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price · low to high</option>
              <option value="price-desc">Price · high to low</option>
            </select>
          </div>
          <div>
            <h3 className="mb-3 text-xs uppercase tracking-widest text-ink/60">Max price</h3>
            <input
              type="range" min={1000} max={30000} step={500}
              value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-maroon"
            />
            <p className="mt-2 text-sm text-ink/70">Up to ₹{maxPrice.toLocaleString("en-IN")}</p>
          </div>
          <div>
            <h3 className="mb-3 text-xs uppercase tracking-widest text-ink/60">Size</h3>
            <div className="flex flex-wrap gap-2">
              {["XS","S","M","L","XL","XXL"].map((s) => (
                <span key={s} className="cursor-pointer rounded border border-gold/40 px-3 py-1 text-xs hover:bg-maroon hover:text-cream">{s}</span>
              ))}
            </div>
          </div>
        </aside>

        <div>
          <p className="mb-4 text-sm text-ink/60">{filtered.length} pieces</p>
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gold/40 py-20 text-center">
              <p className="font-display text-2xl text-ink/70">Nothing here yet</p>
              <p className="mt-2 text-sm text-ink/50">Try widening your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5 md:grid-cols-3 md:gap-6">
              {filtered.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
