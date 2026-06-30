import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, ShieldCheck, Truck, RotateCcw, Star } from "lucide-react";
import { products } from "@/lib/products";
import { formatINR, useCart } from "@/lib/cart";
import { toast } from "sonner";

export const Route = createFileRoute("/products/$id")({
  loader: ({ params }) => {
    const p = products.find((x) => x.id === params.id);
    if (!p) throw notFound();
    return p;
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [
      { title: `${loaderData.name} — Ethnoj` },
      { name: "description", content: loaderData.description },
      { property: "og:image", content: loaderData.image },
    ] : [],
  }),
  component: ProductDetail,
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-5 py-32 text-center">
      <h1 className="font-display text-4xl">Piece not found</h1>
      <Link to="/products" className="mt-6 inline-block text-maroon underline">Back to shop</Link>
    </div>
  ),
  errorComponent: () => <div className="p-12 text-center">Something went wrong.</div>,
});

function ProductDetail() {
  const product = Route.useLoaderData();
  const add = useCart((s) => s.add);
  const setOpen = useCart((s) => s.setOpen);
  const [size, setSize] = useState(product.sizes[0]);
  const [activeImg, setActiveImg] = useState(product.image);

  const images = [product.image, product.hoverImage];

  return (
    <div className="mx-auto max-w-7xl px-5 py-12">
      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <motion.img
            key={activeImg}
            initial={{ opacity: 0, scale: 1.02 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            src={activeImg} alt={product.name}
            className="aspect-[3/4] w-full rounded-2xl object-cover gold-border"
          />
          <div className="mt-4 flex gap-3">
            {images.map((src) => (
              <button key={src} onClick={() => setActiveImg(src)}
                className={`overflow-hidden rounded-lg ${activeImg === src ? "ring-2 ring-maroon" : "opacity-70 hover:opacity-100"}`}>
                <img src={src} alt="" className="h-20 w-16 object-cover" />
              </button>
            ))}
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p className="text-xs uppercase tracking-[0.3em] text-gold">{product.category.replace("-", " ")}</p>
          <h1 className="mt-2 font-display text-4xl text-ink md:text-5xl">{product.name}</h1>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex gap-0.5 text-gold">
              {Array.from({ length: Math.round(product.rating) }).map((_, k) =>
                <Star key={k} className="h-3.5 w-3.5 fill-current" />)}
            </div>
            <span className="text-xs text-ink/60">{product.rating} · {product.reviews} reviews</span>
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-2xl font-semibold text-maroon">{formatINR(product.price)}</span>
            {product.mrp && (
              <>
                <span className="text-sm text-ink/40 line-through">{formatINR(product.mrp)}</span>
                <span className="text-xs text-emerald">{Math.round((1 - product.price / product.mrp) * 100)}% off</span>
              </>
            )}
          </div>
          <p className="mt-1 text-xs text-ink/60">Inclusive of all taxes</p>

          <p className="mt-6 text-ink/75 leading-relaxed">{product.description}</p>

          <div className="mt-7">
            <p className="mb-2 text-xs uppercase tracking-widest text-ink/60">Colors</p>
            <div className="flex gap-2">
              {product.colors.map((c: string) => (
                <span key={c} className="h-7 w-7 cursor-pointer rounded-full border border-gold/40 ring-offset-2 hover:ring-1 hover:ring-maroon"
                  style={{ background: c }} />
              ))}
            </div>
          </div>

          <div className="mt-6">
            <p className="mb-2 text-xs uppercase tracking-widest text-ink/60">Size</p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s: string) => (
                <button key={s} onClick={() => setSize(s)}
                  className={`min-w-[2.75rem] rounded-md border px-3 py-2 text-sm transition ${
                    size === s ? "border-maroon bg-maroon text-cream" : "border-gold/40 hover:bg-cream-deep"
                  }`}>{s}</button>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => { add(product, size); toast.success("Added to bag", { description: product.name }); setOpen(true); }}
              className="flex-1 rounded-full bg-maroon py-3.5 text-sm font-medium text-cream hover:bg-maroon-deep transition"
            >Add to Bag</button>
            <button
              onClick={() => toast("Razorpay checkout will open here once payments are connected")}
              className="flex-1 rounded-full border border-maroon py-3.5 text-sm font-medium text-maroon hover:bg-maroon hover:text-cream transition"
            >Buy Now</button>
            <button onClick={() => toast("Saved to wishlist")} className="rounded-full border border-gold/40 px-4 hover:bg-cream-deep">
              <Heart className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3 border-t border-gold/30 pt-6 text-center text-xs text-ink/70">
            <div><Truck className="mx-auto mb-1.5 h-4 w-4 text-gold" />Free shipping ₹2000+</div>
            <div><RotateCcw className="mx-auto mb-1.5 h-4 w-4 text-gold" />7-day returns</div>
            <div><ShieldCheck className="mx-auto mb-1.5 h-4 w-4 text-gold" />Authentic craft</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
