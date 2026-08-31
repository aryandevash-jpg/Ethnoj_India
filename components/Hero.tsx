"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRef, useState } from "react";
import { useAdminConfig } from "@/lib/admin-config";
import { ChevronDown, Volume2, VolumeX, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const letterVariants = {
  hidden: { y: 80, opacity: 0, rotateX: -90 },
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    rotateX: 0,
    transition: {
      delay: 0.4 + i * 0.05,
      duration: 1,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  }),
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.4,
    },
  },
};

export function Hero() {
  const config = useAdminConfig((s) => s.config.hero);
  const ref = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  
  const { isAuthenticated, isLoading } = useAuth();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <section ref={ref} className="relative h-[calc(100vh-4rem)] min-h-[600px] w-full overflow-hidden md:h-[calc(100vh-5rem)]">
      <motion.div style={{ y, scale }} className="absolute inset-0">
        <AnimatePresence>
          {!isVideoLoaded && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 bg-maroon-deep"
            >
              {config.posterUrl && (
                <motion.img
                  src={config.posterUrl}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
        {config.videoUrl ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            poster={config.posterUrl || undefined}
            onLoadedData={() => setIsVideoLoaded(true)}
            className="absolute inset-0 h-full w-full object-cover"
          >
            <source src={config.videoUrl} type="video/mp4" />
          </video>
        ) : config.posterUrl ? (
          <img
            src={config.posterUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            onLoad={() => setIsVideoLoaded(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-maroon-deep" />
        )}
      </motion.div>

      <motion.div
        style={{ opacity }}
        className="absolute inset-0 bg-gradient-to-b from-maroon-deep/50 via-ink/40 to-ink/80"
      />
      <div className="absolute inset-0 bg-jali opacity-15" />

      <motion.div style={{ opacity }} className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-5 pb-28 md:pb-36">
        <motion.p
          initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mb-5 text-xs uppercase tracking-[0.5em] text-gold"
        >
          {config.kicker}
        </motion.p>

        <motion.h1
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl font-display text-5xl leading-[1.05] text-cream md:text-7xl lg:text-8xl"
        >
          {config.headline.map((word, i) => (
            <motion.span
              key={i}
              variants={letterVariants}
              custom={i}
              className="mr-4 inline-block origin-bottom"
              style={{ perspective: "1000px" }}
            >
              {word}
            </motion.span>
          ))}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="mt-7 max-w-xl text-lg text-cream/85 leading-relaxed"
        >
          {config.subheadline}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.8 }}
          className="mt-10 flex flex-wrap gap-4"
        >
          <Link
            href={config.primaryCta.link}
            className="group relative overflow-hidden rounded-full bg-cream px-8 py-4 text-sm font-medium text-maroon transition-all hover:scale-[1.02] hover:shadow-warm"
          >
            <span className="relative z-10 flex items-center gap-2">
              {config.primaryCta.label}
              <motion.span
                className="inline-block"
                initial={{ x: 0 }}
                whileHover={{ x: 4 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                →
              </motion.span>
            </span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-gold/20 to-transparent"
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.6 }}
            />
          </Link>
          <Link
            href={config.secondaryCta.link}
            className="group rounded-full border border-cream/50 px-8 py-4 text-sm text-cream backdrop-blur-sm transition-all hover:border-cream hover:bg-cream/10"
          >
            {config.secondaryCta.label}
          </Link>
        </motion.div>

        {/* Login/Signup Hook - Only visible when not logged in */}
        <AnimatePresence>
          {!isLoading && !isAuthenticated && (
            <motion.div
              key="auth-hook"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: 1.5, duration: 0.8 }}
              className="mt-8"
            >
              <div className="inline-flex items-center gap-3 rounded-full bg-ink/30 px-5 py-3 backdrop-blur-sm border border-cream/20">
                <UserPlus className="h-4 w-4 text-gold" />
                <span className="text-sm text-cream/90">
                  <Link href="/auth/login" className="text-gold hover:text-cream transition font-medium">
                    Sign in
                  </Link>
                  {" "}or{" "}
                  <Link href="/auth/signup" className="text-gold hover:text-cream transition font-medium">
                    create an account
                  </Link>
                  {" "}to save favorites & checkout faster
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.button
        onClick={toggleMute}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="absolute right-5 top-24 z-20 rounded-full bg-ink/40 p-3 text-cream/80 backdrop-blur-sm transition hover:bg-ink/60 hover:text-cream"
        aria-label={isMuted ? "Unmute video" : "Mute video"}
      >
        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-[10px] uppercase tracking-[0.4em] text-cream/60">Scroll</span>
          <ChevronDown className="h-4 w-4 text-cream/60" />
        </motion.div>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-cream to-transparent" />
    </section>
  );
}
