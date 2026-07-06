"use client";

import { Hero } from "@/components/Hero";
import { VideoCarousel } from "@/components/VideoCarousel";
import { FeaturedProduct } from "@/components/FeaturedProduct";
import { SectionHeading } from "@/components/SectionHeading";
import { motion, useScroll, useSpring, useTransform, useInView } from "framer-motion";
import { Star, Quote, Sparkles, Award, Truck, Heart, ArrowRight, Instagram } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { DBReview } from "@/lib/database.types";

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div ref={containerRef}>
      <motion.div
        className="fixed left-0 right-0 top-0 z-[100] h-1 origin-left bg-gradient-to-r from-gold via-maroon to-gold"
        style={{ scaleX }}
      />

      <Hero />

      <VideoCarousel />

      <FeaturedProduct />

      <StorySection />

      <TrustBadges />

      <ReviewsSection />

      <InstagramSection />
    </div>
  );
}

function StorySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 10]);

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-gradient-to-b from-cream via-cream-deep/40 to-cream py-32">
      {/* Animated background elements */}
      <motion.div
        className="absolute -left-32 top-20 h-64 w-64 rounded-full bg-gold/5 blur-3xl"
        style={{ y: y1 }}
      />
      <motion.div
        className="absolute -right-32 bottom-20 h-96 w-96 rounded-full bg-maroon/5 blur-3xl"
        style={{ y: y2 }}
      />
      
      {/* Decorative pattern */}
      <div className="absolute inset-0 bg-jali opacity-20" />
      
      {/* Floating decorative shapes */}
      <motion.div
        className="absolute left-[10%] top-[20%] h-20 w-20 rounded-full border border-gold/20"
        animate={{ y: [0, -20, 0], rotate: [0, 180, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute right-[15%] top-[30%] h-12 w-12 rotate-45 border border-maroon/20"
        animate={{ y: [0, 20, 0], rotate: [45, 225, 405] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />

      <div className="relative mx-auto max-w-7xl px-5">
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
          {/* Image Column - Creative Layout */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 1 }}
            className="relative"
          >
            {/* Main image */}
            <motion.div
              initial={{ opacity: 0, y: 60, rotateY: -15 }}
              animate={isInView ? { opacity: 1, y: 0, rotateY: 0 } : {}}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10"
              style={{ perspective: "1000px" }}
            >
              <div className="relative overflow-hidden rounded-[2rem] shadow-2xl">
                <motion.img
                  src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80"
                  alt="Artisan crafting traditional Indian garments"
                  className="aspect-[4/5] w-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.8 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-maroon-deep/40 to-transparent" />
              </div>
              
              {/* Decorative frame */}
              <motion.div
                className="absolute -inset-4 -z-10 rounded-[2.5rem] border-2 border-gold/30"
                style={{ rotate }}
              />
            </motion.div>

            {/* Secondary floating image */}
            <motion.div
              initial={{ opacity: 0, x: 60, y: 40 }}
              animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
              transition={{ delay: 0.4, duration: 1 }}
              className="absolute -bottom-8 -right-8 z-20 hidden md:block"
            >
              <div className="overflow-hidden rounded-2xl shadow-warm">
                <img
                  src="https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&q=80"
                  alt="Traditional fabric"
                  className="h-48 w-36 object-cover"
                />
              </div>
            </motion.div>

            {/* Stats card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.6, duration: 0.6, type: "spring" }}
              className="absolute -left-6 top-1/4 z-20 rounded-2xl bg-cream p-5 shadow-warm"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Sparkles className="h-8 w-8 text-gold" />
              </motion.div>
              <CountUpStat value={200} suffix="+" />
              <p className="text-xs text-ink/60">Artisans</p>
            </motion.div>
          </motion.div>

          {/* Content Column */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={isInView ? { width: "4rem" } : {}}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="mb-6 h-1 bg-gradient-to-r from-gold to-maroon"
            />
            
            <p className="text-xs uppercase tracking-[0.5em] text-gold">Our Heritage</p>
            
            <h2 className="mt-4 font-display text-4xl leading-tight text-ink md:text-5xl lg:text-6xl">
              From the loom
              <span className="relative mx-3 inline-block">
                <span className="relative z-10">to your</span>
                <motion.span
                  className="absolute -bottom-2 left-0 h-3 w-full bg-gold/20"
                  initial={{ scaleX: 0 }}
                  animate={isInView ? { scaleX: 1 } : {}}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  style={{ originX: 0 }}
                />
              </span>
              wardrobe.
            </h2>

            <p className="mt-8 text-lg leading-relaxed text-ink/70">
              Every Ethnoj piece passes through the hands of more than a dozen
              artisans — from Banarasi weavers, to Lucknowi chikankari
              embroiderers, to Jaipuri block-printers.
            </p>

            {/* Animated stats row */}
            <div className="mt-12 grid grid-cols-3 gap-6">
              {[
                { value: 12, suffix: "+", label: "Artisan Clusters" },
                { value: 8, suffix: "", label: "States Covered" },
                { value: 15, suffix: "+", label: "Heritage Crafts" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.5 + i * 0.15 }}
                  className="relative"
                >
                  <motion.div
                    className="absolute -inset-3 rounded-xl bg-gradient-to-br from-gold/10 to-transparent"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                  />
                  <CountUpStat value={stat.value} suffix={stat.suffix} />
                  <p className="mt-1 text-xs text-ink/60">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 1 }}
              className="mt-12"
            >
              <Link
                href="/products"
                className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-maroon px-8 py-4 text-sm font-medium text-cream transition-transform hover:scale-[1.02]"
              >
                <span className="relative z-10">Discover Our Craft</span>
                <motion.span
                  className="relative z-10"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="h-4 w-4" />
                </motion.span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-maroon-deep to-maroon"
                  initial={{ x: "100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function CountUpStat({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const duration = 2000;
      const increment = value / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <div ref={ref} className="font-display text-4xl text-maroon">
      {count}{suffix}
    </div>
  );
}

function TrustBadges() {
  const badges = [
    { icon: Award, label: "Authentic Craft", desc: "Genuine handmade pieces" },
    { icon: Truck, label: "Free Shipping", desc: "On orders above ₹2000" },
    { icon: Heart, label: "Made with Love", desc: "By skilled artisans" },
    { icon: Sparkles, label: "Premium Quality", desc: "Finest materials used" },
  ];

  return (
    <section className="relative overflow-hidden border-y border-gold/20 bg-cream py-16">
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-gold/5 via-transparent to-gold/5"
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
      
      <div className="relative mx-auto max-w-7xl px-5">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {badges.map((badge, i) => (
            <motion.div
              key={badge.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              whileHover={{ y: -8 }}
              className="group text-center"
            >
              <motion.div
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cream-deep to-cream shadow-soft transition-all group-hover:shadow-warm"
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
              >
                <badge.icon className="h-7 w-7 text-maroon" />
              </motion.div>
              <h3 className="font-display text-lg text-ink">{badge.label}</h3>
              <p className="mt-1 text-xs text-ink/60">{badge.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ReviewsSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true });
  const [reviews, setReviews] = useState<DBReview[]>([]);

  useEffect(() => {
    async function fetchReviews() {
      const supabase = createClient();
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .eq("is_approved", true)
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(6);
      
      if (data) setReviews(data);
    }
    fetchReviews();
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-cream to-cream-deep/30 py-32">
      {/* Animated background circles */}
      <motion.div
        className="absolute -left-32 top-1/4 h-64 w-64 rounded-full border border-gold/10"
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute -right-32 bottom-1/4 h-96 w-96 rounded-full border border-maroon/10"
        animate={{ rotate: -360 }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
      />

      <div ref={containerRef} className="relative mx-auto max-w-7xl px-5">
        <div className="mb-16 flex flex-col items-center justify-between gap-6 md:flex-row">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              className="text-xs uppercase tracking-[0.5em] text-gold"
            >
              Testimonials
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 }}
              className="mt-3 font-display text-4xl text-ink md:text-5xl"
            >
              Loved by <span className="text-maroon">10,000+</span> women
            </motion.h2>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-4 rounded-full bg-cream-deep px-6 py-3"
          >
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  className="h-10 w-10 overflow-hidden rounded-full border-2 border-cream bg-gradient-to-br from-maroon to-maroon-deep"
                  initial={{ x: -20, opacity: 0 }}
                  animate={isInView ? { x: 0, opacity: 1 } : {}}
                  transition={{ delay: 0.4 + i * 0.1 }}
                />
              ))}
            </div>
            <div>
              <div className="flex gap-0.5 text-gold">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-xs text-ink/60">4.9 average rating</p>
            </div>
          </motion.div>
        </div>

        {/* Masonry-style reviews */}
        {reviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gold/40 py-20 text-center">
            <p className="font-display text-2xl text-ink/70">No featured reviews yet</p>
            <p className="mt-2 text-sm text-ink/50">
              Approve and feature reviews from the admin panel.
            </p>
          </div>
        ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 40, rotate: i % 2 === 0 ? -2 : 2 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.7 }}
              whileHover={{ y: -12, rotate: 0 }}
              className={`group relative overflow-hidden rounded-3xl bg-cream p-6 shadow-soft transition-all hover:shadow-warm ${
                i === 0 ? "md:col-span-2 md:row-span-2 md:p-10" : ""
              }`}
            >
              {/* Decorative gradient */}
              <motion.div
                className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-gold/20 to-transparent blur-2xl"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              
              <div className="relative">
                <Quote className="mb-4 h-8 w-8 text-gold/30" />
                
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: 5 }).map((_, k) => (
                    <motion.div
                      key={k}
                      initial={{ opacity: 0, scale: 0, rotate: -180 }}
                      whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 + k * 0.05 }}
                    >
                      <Star
                        className={`h-4 w-4 text-gold ${k < review.rating ? "fill-current" : ""}`}
                      />
                    </motion.div>
                  ))}
                </div>

                <p className={`leading-relaxed text-ink/80 italic ${i === 0 ? "text-lg md:text-xl" : "text-sm"}`}>
                  &quot;{review.text}&quot;
                </p>

                <div className="mt-6 flex items-center gap-4">
                  <motion.div
                    className="relative"
                    whileHover={{ scale: 1.1 }}
                  >
                    {review.image ? (
                      <img
                        src={review.image}
                        alt=""
                        className="h-12 w-12 rounded-full object-cover ring-2 ring-gold/30"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-maroon to-maroon-deep font-display text-lg text-cream">
                        {review.name.charAt(0)}
                      </div>
                    )}
                    <motion.div
                      className="absolute -bottom-1 -right-1 rounded-full bg-emerald p-1"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 }}
                    >
                      <svg className="h-3 w-3 text-cream" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                  </motion.div>
                  <div>
                    <p className="font-display text-lg text-maroon">{review.name}</p>
                    <p className="text-xs text-ink/50">Verified Buyer</p>
                  </div>
                </div>
              </div>

              {/* Hover border effect */}
              <motion.div
                className="absolute inset-0 rounded-3xl border-2 border-gold/0 transition-colors group-hover:border-gold/30"
              />
            </motion.div>
          ))}
        </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-14 text-center"
        >
          <Link
            href="/reviews"
            className="group inline-flex items-center gap-3 rounded-full border-2 border-maroon px-8 py-4 text-sm font-medium text-maroon transition-all hover:bg-maroon hover:text-cream"
          >
            Read All Reviews
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

interface InstagramPost {
  id: string;
  imageUrl: string;
  postUrl: string;
  caption?: string;
}

function InstagramSection() {
  const [instagramConfig, setInstagramConfig] = useState<{ handle: string; posts: InstagramPost[] }>({
    handle: "@ethnoj",
    posts: [],
  });

  useEffect(() => {
    async function fetchInstagramConfig() {
      const supabase = createClient();
      const { data } = await supabase
        .from("home_config")
        .select("*")
        .eq("section", "instagram")
        .eq("is_active", true)
        .single();
      
      if (data?.config) {
        setInstagramConfig(data.config);
      }
    }
    fetchInstagramConfig();
  }, []);

  if (instagramConfig.posts.length === 0) {
    return null;
  }

  return (
    <section className="relative overflow-hidden bg-maroon-deep py-20">
      <div className="absolute inset-0 bg-jali opacity-10" />
      
      <div className="relative mx-auto max-w-7xl px-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 flex flex-col items-center justify-between gap-6 md:flex-row"
        >
          <div className="text-center md:text-left">
            <p className="text-xs uppercase tracking-[0.5em] text-gold">Follow Us</p>
            <h2 className="mt-3 font-display text-3xl text-cream md:text-4xl">
              {instagramConfig.handle} on Instagram
            </h2>
          </div>
          
          <motion.a
            href={`https://instagram.com/${instagramConfig.handle.replace("@", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 rounded-full bg-cream/10 px-6 py-3 text-sm text-cream backdrop-blur-sm transition hover:bg-cream/20"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Instagram className="h-5 w-5" />
            Follow Us
          </motion.a>
        </motion.div>

        <div className="grid grid-cols-3 gap-3 md:grid-cols-6 md:gap-4">
          {instagramConfig.posts.slice(0, 6).map((post, i) => (
            <motion.a
              key={post.id}
              href={post.postUrl || `https://instagram.com/${instagramConfig.handle.replace("@", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05, zIndex: 10 }}
              className="group relative aspect-square overflow-hidden rounded-xl"
            >
              <img
                src={post.imageUrl}
                alt={post.caption || "Instagram post"}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <motion.div
                className="absolute inset-0 flex items-center justify-center bg-maroon/60 opacity-0 transition-opacity group-hover:opacity-100"
                initial={false}
              >
                <Instagram className="h-8 w-8 text-cream" />
              </motion.div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
