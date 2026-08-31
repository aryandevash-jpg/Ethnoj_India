"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import type { DBProduct, DBCategory } from "@/lib/database.types";

type Sort = "featured" | "price-asc" | "price-desc";

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialCat = searchParams.get("cat") || "all";

  const [products, setProducts] = useState<DBProduct[]>([]);
  const [categories, setCategories] = useState<DBCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState<string>(initialCat);
  const [sort, setSort] = useState<Sort>("featured");
  const [maxPrice, setMaxPrice] = useState(100000);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [productsRes, categoriesRes] = await Promise.all([
      fetch("/api/products"),
      fetch("/api/categories"),
    ]);

    const productsJson = await productsRes.json();
    const categoriesJson = await categoriesRes.json();

    if (productsJson.data) setProducts(productsJson.data);
    if (categoriesJson.data) setCategories(categoriesJson.data);
    setLoading(false);
  }

  const filtered = useMemo(() => {
    let list = products.filter(
      (p) => (cat === "all" || p.category === cat) && p.price <= maxPrice
    );
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "featured") list = [...list].sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
    return list;
  }, [products, cat, sort, maxPrice]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 w-24 bg-gray-200 rounded-full" />
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-[3/4] bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-12">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 border-b border-gold/30 pb-6"
      >
        <p className="text-xs uppercase tracking-[0.4em] text-gold">
          The Collection
        </p>
        <h1 className="mt-2 font-display text-5xl text-ink">Shop all</h1>
      </motion.div>

      <div className="mb-8 flex flex-wrap gap-2">
        <button
          onClick={() => setCat("all")}
          className={`relative rounded-full px-5 py-2 text-sm transition ${
            cat === "all"
              ? "bg-maroon text-cream"
              : "border border-gold/40 text-ink/80 hover:bg-cream-deep"
          }`}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setCat(category.slug)}
            className={`relative rounded-full px-5 py-2 text-sm transition ${
              cat === category.slug
                ? "bg-maroon text-cream"
                : "border border-gold/40 text-ink/80 hover:bg-cream-deep"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-[240px_1fr]">
        <aside className="hidden space-y-7 md:block">
          <div>
            <h3 className="mb-3 text-xs uppercase tracking-widest text-ink/60">
              Sort by
            </h3>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="w-full rounded-md border border-gold/40 bg-card px-3 py-2 text-sm"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price · low to high</option>
              <option value="price-desc">Price · high to low</option>
            </select>
          </div>
          <div>
            <h3 className="mb-3 text-xs uppercase tracking-widest text-ink/60">
              Max price
            </h3>
            <input
              type="range"
              min={1000}
              max={100000}
              step={1000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-maroon"
            />
            <p className="mt-2 text-sm text-ink/70">
              Up to ₹{maxPrice.toLocaleString("en-IN")}
            </p>
          </div>
          <div>
            <h3 className="mb-3 text-xs uppercase tracking-widest text-ink/60">
              Size
            </h3>
            <div className="flex flex-wrap gap-2">
              {["XS", "S", "M", "L", "XL", "XXL"].map((s) => (
                <span
                  key={s}
                  className="cursor-pointer rounded border border-gold/40 px-3 py-1 text-xs hover:bg-maroon hover:text-cream"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </aside>

        <div>
          <p className="mb-4 text-sm text-ink/60">{filtered.length} pieces</p>
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gold/40 py-20 text-center">
              <p className="font-display text-2xl text-ink/70">
                Nothing here yet
              </p>
              <p className="mt-2 text-sm text-ink/50">
                {products.length === 0
                  ? "Add products from the admin panel."
                  : "Try widening your filters."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5 md:grid-cols-3 md:gap-6">
              {filtered.map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={{
                    id: p.id,
                    slug: p.slug,
                    name: p.name,
                    price: p.price,
                    mrp: p.mrp || p.price,
                    image: p.image,
                    hoverImage: p.hover_image || p.image,
                    videoUrl: p.video_url || undefined,
                    category: p.category as any,
                    colors: p.colors || [],
                    sizes: p.sizes || [],
                    description: p.description || "",
                    rating: p.rating || 0,
                    reviews: p.reviews_count || 0,
                  }}
                  index={i}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-5 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-8 w-48 bg-gray-200 rounded" />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 w-24 bg-gray-200 rounded-full" />
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-[3/4] bg-gray-200 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
