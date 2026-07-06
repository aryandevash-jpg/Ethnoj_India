"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const curtainVariants = {
  initial: { scaleY: 1 },
  exit: {
    scaleY: 0,
    transition: { duration: 0.8, ease: [0.65, 0, 0.35, 1] as const },
  },
};

const logoVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
  exit: {
    opacity: 0,
    scale: 1.1,
    filter: "blur(10px)",
    transition: { duration: 0.4 },
  },
};

export function Preloader() {
  const [showPreloader, setShowPreloader] = useState(false);
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Check if preloader has already been shown in this session
    const hasShown = sessionStorage.getItem("ethnoj-preloader-shown");
    
    if (hasShown) {
      // Already shown, don't show again
      setShowPreloader(false);
      setDone(true);
      return;
    }

    // First visit in this session, show the preloader
    setShowPreloader(true);
    sessionStorage.setItem("ethnoj-preloader-shown", "true");

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 100);

    const timeout = setTimeout(() => {
      setProgress(100);
      setTimeout(() => setDone(true), 300);
    }, 2000);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(timeout);
    };
  }, []);

  if (!showPreloader) return null;

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
        >
          <motion.div
            variants={curtainVariants}
            initial="initial"
            exit="exit"
            className="absolute inset-0 origin-top bg-cream"
            style={{ transformOrigin: "top" }}
          />

          <motion.div
            variants={curtainVariants}
            initial="initial"
            exit="exit"
            className="absolute inset-0 origin-bottom bg-gradient-to-t from-cream-deep to-cream"
            style={{ transformOrigin: "bottom" }}
          />

          <motion.div
            variants={logoVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative z-10 flex flex-col items-center"
          >
            <svg viewBox="0 0 200 80" className="w-64">
              <defs>
                <linearGradient
                  id="logoGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="oklch(0.45 0.16 12)" />
                  <stop offset="50%" stopColor="oklch(0.74 0.13 80)" />
                  <stop offset="100%" stopColor="oklch(0.45 0.16 12)" />
                </linearGradient>
              </defs>
              <motion.text
                x="100"
                y="56"
                textAnchor="middle"
                style={{
                  fontSize: 56,
                  fontFamily: "var(--font-cormorant), serif",
                  letterSpacing: "0.04em",
                }}
                initial={{
                  fill: "transparent",
                  stroke: "oklch(0.74 0.13 80)",
                  strokeWidth: 1.5,
                  strokeDasharray: 400,
                  strokeDashoffset: 400,
                }}
                animate={{
                  strokeDashoffset: 0,
                  fill: "oklch(0.45 0.16 12)",
                  transition: {
                    strokeDashoffset: { duration: 1.2, ease: "easeInOut" },
                    fill: { delay: 0.8, duration: 0.5 },
                  },
                }}
              >
                Ethnoj
              </motion.text>
              <motion.text
                x="168"
                y="56"
                textAnchor="middle"
                style={{
                  fontSize: 56,
                  fontFamily: "var(--font-cormorant), serif",
                  fill: "oklch(0.74 0.13 80)",
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  transition: { delay: 1, duration: 0.4, type: "spring" },
                }}
              >
                .
              </motion.text>
            </svg>

            <div className="mt-8 flex items-center gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="h-2 w-2 rounded-full bg-gold"
                  animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              className="mt-6 h-0.5 bg-gradient-to-r from-gold via-maroon to-gold"
              style={{ maxWidth: "200px" }}
            />

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-4 text-xs uppercase tracking-[0.4em] text-ink/50"
            >
              Crafting elegance
            </motion.p>
          </motion.div>

          <motion.div
            className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-gold/10 blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.div
            className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-maroon/10 blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
