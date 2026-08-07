"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, ShieldCheck, Truck, RotateCcw, Star } from "lucide-react";
import { formatINR, useCart } from "@/lib/cart";
import { toast } from "sonner";
import { notFound, useRouter } from "next/navigation";
import { use } from "react";
import { createClient } from "@/lib/supabase/client";
import type { DBProduct } from "@/lib/database.types";
import { isUuid } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

export default function ProductDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [product, setProduct] = useState<DBProduct | null>(null);
  const [categoryName, setCategoryName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);
  
  const { isAuthenticated } = useAuth();

  const add = useCart((s) => s.add);
  const setOpen = useCart((s) => s.setOpen);
  const [size, setSize] = useState<string>("");
  const [activeMedia, setActiveMedia] = useState<string>("");
  const [activeMediaType, setActiveMediaType] = useState<"image" | "video">("image");

  const requireAuth = (action: () => void, redirectPath?: string) => {
    if (!isAuthenticated) {
      const fallbackPath = redirectPath || `/products/${id}`;
      router.push(`/auth/login?redirectTo=${encodeURIComponent(fallbackPath)}`);
      return;
    }
    action();
  };

  useEffect(() => {
    async function fetchProduct() {
      const supabase = createClient();

      const query = isUuid(id)
        ? supabase
            .from("products")
            .select("*")
            .eq("id", id)
            .eq("is_active", true)
        : supabase
            .from("products")
            .select("*")
            .eq("slug", id)
            .eq("is_active", true);

      const { data, error } = await query.single();

      if (error || !data) {
        setNotFoundState(true);
      } else {
        setProduct(data);
        setSize(data.sizes?.[0] || "");
        if (data.video_url) {
          setActiveMedia(data.video_url);
          setActiveMediaType("video");
        } else {
          setActiveMedia(data.image);
          setActiveMediaType("image");
        }

        const { data: category } = await supabase
          .from("categories")
          .select("name")
          .eq("slug", data.category)
          .maybeSingle();

        setCategoryName(category?.name || data.category.replace(/-/g, " "));
      }
      setLoading(false);
    }

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-12">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="aspect-[3/4] w-full rounded-2xl bg-gray-200 animate-pulse" />
          <div className="space-y-4">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-12 w-3/4 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-24 w-full bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (notFoundState || !product) {
    notFound();
  }

  const images = [product.image, product.hover_image].filter(
    (src): src is string => Boolean(src)
  );
  const mediaItems = [
    ...images.map((src) => ({ type: "image" as const, src: src! })),
    ...(product.video_url
      ? [{ type: "video" as const, src: product.video_url }]
      : []),
  ];

  return (
    <div className="mx-auto max-w-7xl px-5 py-12">
      <div className="grid gap-10 md:grid-cols-2">
        <div>
          {activeMediaType === "video" ? (
            <motion.video
              key={activeMedia}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              src={activeMedia}
              className="aspect-[3/4] w-full rounded-2xl object-cover gold-border"
              muted
              playsInline
              loop
              autoPlay
            />
          ) : (
            <motion.img
              key={activeMedia}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              src={activeMedia}
              alt={product.name}
              className="aspect-[3/4] w-full rounded-2xl object-cover gold-border"
            />
          )}
          <div className="mt-4 flex gap-3">
            {mediaItems.map((item) => (
              <button
                key={item.src}
                onClick={() => {
                  setActiveMedia(item.src);
                  setActiveMediaType(item.type);
                }}
                className={`relative overflow-hidden rounded-lg ${
                  activeMedia === item.src
                    ? "ring-2 ring-maroon"
                    : "opacity-70 hover:opacity-100"
                }`}
              >
                {item.type === "video" ? (
                  <video
                    src={item.src}
                    muted
                    playsInline
                    loop
                    autoPlay
                    className="h-20 w-16 object-cover"
                  />
                ) : (
                  <img src={item.src} alt="" className="h-20 w-16 object-cover" />
                )}
              </button>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs uppercase tracking-[0.3em] text-gold">
            {categoryName}
          </p>
          <h1 className="mt-2 font-display text-4xl text-ink md:text-5xl">
            {product.name}
          </h1>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex gap-0.5 text-gold">
              {Array.from({ length: Math.round(product.rating || 0) }).map((_, k) => (
                <Star key={k} className="h-3.5 w-3.5 fill-current" />
              ))}
            </div>
            <span className="text-xs text-ink/60">
              {product.rating || 0} · {product.reviews_count || 0} reviews
            </span>
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-2xl font-semibold text-maroon">
              {formatINR(product.price)}
            </span>
            {product.mrp && product.mrp > product.price && (
              <>
                <span className="text-sm text-ink/40 line-through">
                  {formatINR(product.mrp)}
                </span>
                <span className="text-xs text-emerald">
                  {Math.round((1 - product.price / product.mrp) * 100)}% off
                </span>
              </>
            )}
          </div>
          <p className="mt-1 text-xs text-ink/60">Inclusive of all taxes</p>

          <p className="mt-6 leading-relaxed text-ink/75">
            {product.description}
          </p>

          {product.colors && product.colors.length > 0 && (
            <div className="mt-7">
              <p className="mb-2 text-xs uppercase tracking-widest text-ink/60">
                Colors
              </p>
              <div className="flex gap-2">
                {product.colors.map((c: string) => (
                  <span
                    key={c}
                    className="h-7 w-7 cursor-pointer rounded-full border border-gold/40 ring-offset-2 hover:ring-1 hover:ring-maroon"
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
          )}

          {product.sizes && product.sizes.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-xs uppercase tracking-widest text-ink/60">
                Size
              </p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s: string) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`min-w-[2.75rem] rounded-md border px-3 py-2 text-sm transition ${
                      size === s
                        ? "border-maroon bg-maroon text-cream"
                        : "border-gold/40 hover:bg-cream-deep"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => {
                requireAuth(() => {
                  add(
                    {
                      id: product.slug || product.id,
                      name: product.name,
                      price: product.price,
                      mrp: product.mrp || product.price,
                      image: product.image,
                      hoverImage: product.hover_image || product.image,
                      category: product.category as any,
                      colors: product.colors || [],
                      sizes: product.sizes || [],
                      description: product.description || "",
                      rating: product.rating || 0,
                      reviews: product.reviews_count || 0,
                    },
                    size
                  );
                  toast.success("Added to bag", { description: product.name });
                  setOpen(true);
                });
              }}
              className="flex-1 rounded-full bg-maroon py-3.5 text-sm font-medium text-cream transition hover:bg-maroon-deep"
            >
              Add to Bag
            </button>
            <button
              onClick={() => {
                const productId = product.slug || product.id;
                const checkoutUrl = `/checkout?product=${encodeURIComponent(productId)}&size=${encodeURIComponent(size || "Free Size")}&qty=1`;
                requireAuth(() => {
                  router.push(checkoutUrl);
                }, checkoutUrl);
              }}
              className="flex-1 rounded-full border border-maroon py-3.5 text-sm font-medium text-maroon transition hover:bg-maroon hover:text-cream flex items-center justify-center gap-2"
            >
              Buy Now
            </button>
            <button
              onClick={() => requireAuth(() => toast("Saved to wishlist"))}
              className="rounded-full border border-gold/40 px-4 hover:bg-cream-deep"
            >
              <Heart className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3 border-t border-gold/30 pt-6 text-center text-xs text-ink/70">
            <div>
              <Truck className="mx-auto mb-1.5 h-4 w-4 text-gold" />
              Free shipping ₹2000+
            </div>
            <div>
              <RotateCcw className="mx-auto mb-1.5 h-4 w-4 text-gold" />
              7-day returns
            </div>
            <div>
              <ShieldCheck className="mx-auto mb-1.5 h-4 w-4 text-gold" />
              Authentic craft
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
