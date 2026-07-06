"use client";

import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { useRef, useState } from "react";
import { useAdminConfig, type CarouselItem } from "@/lib/admin-config";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

const cardVariants = {
  hidden: { opacity: 0, y: 80, rotateX: -15 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  }),
};

export function VideoCarousel() {
  const config = useAdminConfig((s) => s.config.carousel);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const showNavButtons = config.items.length > 4;

  const scroll = (direction: "left" | "right") => {
    if (containerRef.current) {
      const scrollAmount = containerRef.current.offsetWidth * 0.8;
      containerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section ref={sectionRef} className="relative overflow-hidden py-28">
      {/* Creative background */}
      <div className="absolute inset-0 bg-gradient-to-b from-cream via-cream-deep/30 to-cream" />
      <div className="absolute inset-0 bg-jali opacity-20" />
      
      {/* Floating decorative elements */}
      <motion.div
        className="absolute left-[5%] top-[15%] h-32 w-32 rounded-full border border-gold/20"
        animate={{ y: [0, -20, 0], rotate: [0, 180, 360] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute right-[8%] bottom-[20%] h-24 w-24 rounded-full bg-maroon/5 blur-2xl"
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      
      <div className="relative mx-auto max-w-7xl px-5">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4 inline-flex items-center gap-2 rounded-full bg-gold/10 px-4 py-2"
          >
            <Sparkles className="h-4 w-4 text-gold" />
            <span className="text-xs uppercase tracking-[0.3em] text-gold">{config.kicker}</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl text-ink md:text-5xl lg:text-6xl"
          >
            {config.title}
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-4 max-w-xl text-ink/60"
          >
            Each collection tells a story — hover to preview, click to explore pieces crafted for that moment.
          </motion.p>
          
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mx-auto mt-8 h-px w-32 bg-gradient-to-r from-transparent via-gold to-transparent"
          />
        </div>

        <div className="relative">
          {showNavButtons && (
            <>
              <motion.button
                onClick={() => scroll("left")}
                className="absolute -left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-cream p-4 text-maroon shadow-warm transition-all hover:scale-110 hover:bg-maroon hover:text-cream md:-left-6"
                aria-label="Scroll left"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronLeft className="h-6 w-6" />
              </motion.button>

              <motion.button
                onClick={() => scroll("right")}
                className="absolute -right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-cream p-4 text-maroon shadow-warm transition-all hover:scale-110 hover:bg-maroon hover:text-cream md:-right-6"
                aria-label="Scroll right"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronRight className="h-6 w-6" />
              </motion.button>
            </>
          )}

          <div
            ref={containerRef}
            className={`
              grid gap-6 
              grid-cols-2 
              md:grid-cols-4 
              ${showNavButtons ? 'md:flex md:overflow-x-auto md:scroll-smooth md:scrollbar-hide' : ''}
            `}
            style={showNavButtons ? {
              scrollSnapType: "x mandatory",
              scrollPaddingLeft: "1.25rem",
              perspective: "1000px",
            } : { perspective: "1000px" }}
          >
            {config.items.map((item, index) => (
              <CarouselCard
                key={item.id}
                item={item}
                index={index}
                isInView={isInView}
                isActive={activeIndex === index}
                onHover={() => setActiveIndex(index)}
                onLeave={() => setActiveIndex(null)}
                isGridMode={!showNavButtons}
              />
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-14 text-center"
        >
          <Link
            href="/products"
            className="group inline-flex items-center gap-3 text-sm text-maroon transition-all"
          >
            <span className="relative">
              View all collections
              <motion.span
                className="absolute -bottom-1 left-0 h-px w-full origin-left bg-maroon"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
              />
            </span>
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ArrowRight className="h-4 w-4" />
            </motion.span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function CarouselCard({
  item,
  index,
  isInView,
  isActive,
  onHover,
  onLeave,
  isGridMode = false,
}: {
  item: CarouselItem;
  index: number;
  isInView: boolean;
  isActive: boolean;
  onHover: () => void;
  onLeave: () => void;
  isGridMode?: boolean;
}) {
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={isGridMode ? "w-full" : "flex-shrink-0"}
      style={!isGridMode ? { scrollSnapAlign: "start" } : undefined}
    >
      <Link
        href={`/products?cat=${item.category}`}
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
        className="block"
      >
        <motion.div
          className={`group relative overflow-hidden rounded-3xl ${
            isGridMode ? "w-full" : "w-[280px] md:w-[300px]"
          }`}
          whileHover={{ y: -12 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Card content */}
          <div className="relative aspect-[3/4] overflow-hidden">
            {/* Background image */}
            {item.posterUrl ? (
              <motion.img
                src={item.posterUrl}
                alt={item.label}
                className="absolute inset-0 h-full w-full object-cover"
                animate={{
                  scale: isActive ? 1.1 : 1,
                }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-maroon to-maroon-deep" />
            )}

            {/* Video overlay - autoplay without loop */}
            {item.videoUrl && (
              <video
                autoPlay
                muted
                playsInline
                poster={item.posterUrl || undefined}
                className="absolute inset-0 h-full w-full object-cover"
              >
                <source src={item.videoUrl} type="video/mp4" />
              </video>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent opacity-80" />

            {/* Content */}
            <div className="absolute inset-x-0 bottom-0 p-6">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.3 }}
              >
                <p className="mb-2 text-[11px] uppercase tracking-[0.3em] text-gold">
                  {item.tagline}
                </p>
                <h3 className="font-display text-2xl text-cream">
                  {item.label}
                </h3>
                
                <motion.div
                  className="mt-4 flex items-center gap-2 text-sm text-cream/80"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <span>Explore collection</span>
                  <ArrowRight className="h-4 w-4" />
                </motion.div>
              </motion.div>
            </div>

            {/* Hover border */}
            <motion.div
              className="absolute inset-0 rounded-3xl border-2 border-transparent"
              animate={{
                borderColor: isActive ? "rgba(212, 164, 55, 0.5)" : "rgba(212, 164, 55, 0)",
              }}
              transition={{ duration: 0.3 }}
            />

            {/* Corner accent */}
            <motion.div
              className="absolute right-4 top-4 h-12 w-12"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: isActive ? 1 : 0, scale: isActive ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <svg viewBox="0 0 48 48" fill="none" className="h-full w-full">
                <path
                  d="M0 24C0 10.745 10.745 0 24 0h24v48H24C10.745 48 0 37.255 0 24z"
                  fill="rgba(212, 164, 55, 0.2)"
                />
              </svg>
            </motion.div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
