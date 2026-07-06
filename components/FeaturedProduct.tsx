"use client";

import { motion, useScroll, useTransform, useInView } from "framer-motion";
import Link from "next/link";
import { useRef, useState } from "react";
import { useAdminConfig } from "@/lib/admin-config";
import { formatINR, useCart } from "@/lib/cart";
import { ShoppingBag, Heart, Star, Play, Pause, Sparkles, ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";

export function FeaturedProduct() {
  const config = useAdminConfig((s) => s.config.featuredProduct);
  const product = useAdminConfig((s) => s.featuredProduct);
  const isLoaded = useAdminConfig((s) => s.isLoaded);

  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const add = useCart((s) => s.add);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const rotate = useTransform(scrollYProgress, [0, 1], [-5, 5]);

  const toggleVideo = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (!isLoaded || !product) return null;

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-32"
    >
      {/* Creative background */}
      <div className="absolute inset-0 bg-gradient-to-br from-maroon-deep via-maroon to-maroon-deep" />
      <div className="absolute inset-0 bg-jali opacity-5" />
      
      {/* Animated background shapes */}
      <motion.div
        className="absolute -left-64 top-0 h-[800px] w-[800px] rounded-full bg-gold/5 blur-3xl"
        style={{ y: y1 }}
      />
      <motion.div
        className="absolute -right-64 bottom-0 h-[600px] w-[600px] rounded-full bg-cream/5 blur-3xl"
        style={{ y: y2 }}
      />
      
      {/* Floating decorative elements */}
      <motion.div
        className="absolute left-[10%] top-[20%] h-2 w-2 rounded-full bg-gold"
        animate={{ y: [0, -30, 0], opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.div
        className="absolute right-[15%] top-[30%] h-3 w-3 rounded-full bg-cream/30"
        animate={{ y: [0, 20, 0], opacity: [0.2, 0.6, 0.2] }}
        transition={{ duration: 5, repeat: Infinity }}
      />
      <motion.div
        className="absolute left-[20%] bottom-[25%] h-4 w-4 rotate-45 border border-gold/30"
        animate={{ rotate: [45, 225, 405] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      <div className="relative mx-auto max-w-7xl px-5">
        {/* Section badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="mb-12 flex justify-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-gold/20 px-5 py-2 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-gold" />
            <span className="text-xs uppercase tracking-[0.3em] text-gold">{config.kicker}</span>
          </div>
        </motion.div>

        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Image/Video Column */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            {/* Main media container */}
            <motion.div
              style={{ rotate }}
              className="relative"
            >
              {/* Decorative frame */}
              <motion.div
                className="absolute -inset-4 rounded-[2.5rem] border border-gold/30"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.3 }}
              />
              <motion.div
                className="absolute -inset-8 rounded-[3rem] border border-gold/10"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.5 }}
              />

              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-2xl">
                {config.videoUrl ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="h-full w-full object-cover"
                    >
                      <source src={config.videoUrl} type="video/mp4" />
                    </video>
                    
                    {/* Video controls */}
                    <motion.button
                      onClick={toggleVideo}
                      className="absolute bottom-6 right-6 rounded-full bg-cream/20 p-4 text-cream backdrop-blur-md transition hover:bg-cream/30"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" fill="currentColor" />}
                    </motion.button>
                  </>
                ) : (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                )}

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />

                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  initial={{ x: "-100%" }}
                  animate={isInView ? { x: "200%" } : {}}
                  transition={{ delay: 0.8, duration: 1.5, ease: "easeInOut" }}
                />
              </div>
            </motion.div>

            {/* Rating badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
              transition={{ delay: 0.6, type: "spring" }}
              className="absolute -bottom-6 -right-6 z-10 rounded-2xl bg-cream p-5 shadow-warm md:-bottom-8 md:-right-8"
            >
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0, rotate: -180 }}
                    animate={isInView ? { opacity: 1, scale: 1, rotate: 0 } : {}}
                    transition={{ delay: 0.8 + i * 0.1 }}
                  >
                      <Star
                      className={`h-4 w-4 text-gold ${i < Math.floor(product.rating || 0) ? "fill-current" : ""}`}
                    />
                  </motion.div>
                ))}
              </div>
              <p className="mt-1 text-2xl font-semibold text-maroon">{product.rating || 0}</p>
              <p className="text-xs text-ink/60">{product.reviews_count || 0} reviews</p>
            </motion.div>

            {/* Discount badge */}
            {product.mrp && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: -20 }}
                animate={isInView ? { opacity: 1, scale: 1, x: 0 } : {}}
                transition={{ delay: 0.7, type: "spring" }}
                className="absolute -left-4 top-8 z-10 rounded-full bg-gold px-4 py-2 shadow-lg md:-left-6"
              >
                <p className="text-sm font-bold text-maroon-deep">
                  {Math.round((1 - product.price / product.mrp) * 100)}% OFF
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Content Column */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.h2
              className="font-display text-4xl text-cream md:text-5xl lg:text-6xl"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 }}
            >
              {config.title}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 }}
              className="mt-6 text-lg leading-relaxed text-cream/70"
            >
              {config.description}
            </motion.p>

            {/* Price */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5 }}
              className="mt-8 flex items-baseline gap-4"
            >
              <span className="font-display text-5xl text-cream">
                {formatINR(product.price)}
              </span>
              {product.mrp && (
                <span className="text-xl text-cream/40 line-through">
                  {formatINR(product.mrp)}
                </span>
              )}
            </motion.div>

            {/* Sizes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.6 }}
              className="mt-8"
            >
              <p className="mb-4 text-sm text-cream/60">Select Size</p>
              <div className="flex flex-wrap gap-3">
                {(product.sizes || []).map((size, i) => (
                  <motion.button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`relative min-w-[3rem] rounded-full px-5 py-3 text-sm font-medium transition ${
                      selectedSize === size
                        ? "bg-cream text-maroon"
                        : "border border-cream/30 text-cream hover:border-cream"
                    }`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 0.6 + i * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {size}
                    {selectedSize === size && (
                      <motion.div
                        layoutId="sizeIndicator"
                        className="absolute -right-1 -top-1 rounded-full bg-gold p-1"
                      >
                        <Check className="h-3 w-3 text-maroon-deep" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Colors */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.7 }}
              className="mt-8"
            >
              <p className="mb-4 text-sm text-cream/60">Available Colors</p>
              <div className="flex gap-4">
                {(product.colors || []).map((color, i) => (
                  <motion.button
                    key={color}
                    className="group relative"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 0.7 + i * 0.1, type: "spring" }}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <span
                      className="block h-10 w-10 rounded-full border-2 border-cream/30 transition group-hover:border-cream"
                      style={{ backgroundColor: color }}
                    />
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.8 }}
              className="mt-10 flex flex-wrap gap-4"
            >
              <Link
                href={`/products/${product.slug || product.id}`}
                className="group relative overflow-hidden rounded-full bg-cream px-8 py-4 text-sm font-medium text-maroon transition-transform hover:scale-[1.02]"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {config.ctaLabel}
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </motion.span>
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-gold/30 to-transparent"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.5 }}
                />
              </Link>

              <motion.button
                onClick={() => {
                  const size = selectedSize || (product.sizes || [])[0] || "";
                  add({
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
                  }, size);
                  toast.success("Added to bag", { description: product.name });
                }}
                className="flex items-center gap-2 rounded-full border border-cream/50 px-8 py-4 text-sm font-medium text-cream transition hover:border-cream hover:bg-cream/10"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ShoppingBag className="h-4 w-4" />
                Add to Bag
              </motion.button>

              <motion.button
                onClick={() => toast("Saved to wishlist", { description: product.name })}
                className="rounded-full border border-cream/50 p-4 text-cream transition hover:border-cream hover:bg-cream/10"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Heart className="h-5 w-5" />
              </motion.button>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 1 }}
              className="mt-10 flex flex-wrap gap-6 border-t border-cream/20 pt-8 text-xs text-cream/50"
            >
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-gold" /> Authentic Handcraft
              </span>
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-gold" /> Free Shipping
              </span>
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-gold" /> 7-Day Returns
              </span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
