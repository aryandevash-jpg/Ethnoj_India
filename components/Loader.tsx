"use client";

import { motion, AnimatePresence } from "framer-motion";

interface LoaderProps {
  isLoading: boolean;
  text?: string;
  fullScreen?: boolean;
}

export function Loader({ isLoading, text = "Loading...", fullScreen = false }: LoaderProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={`flex items-center justify-center ${
            fullScreen 
              ? "fixed inset-0 z-[90] bg-ink/20 backdrop-blur-sm" 
              : "py-12"
          }`}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="flex flex-col items-center gap-4 rounded-2xl bg-cream p-8 shadow-warm"
          >
            {/* Spinner */}
            <div className="relative h-12 w-12">
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-gold/20"
              />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-transparent border-t-maroon"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              <motion.div
                className="absolute inset-2 rounded-full border-2 border-transparent border-t-gold"
                animate={{ rotate: -360 }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            </div>

            {/* Text */}
            <p className="text-sm text-ink/70">{text}</p>

            {/* Animated dots */}
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-gold"
                  animate={{
                    y: [0, -6, 0],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Inline spinner for buttons or small areas
export function Spinner({ size = "md", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <motion.div
      className={`relative ${sizeClasses[size]} ${className}`}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      <div className="absolute inset-0 rounded-full border-2 border-current opacity-20" />
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-current" />
    </motion.div>
  );
}

// Page loading skeleton
export function PageLoader() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-12">
      <div className="animate-pulse space-y-8">
        {/* Header skeleton */}
        <div className="space-y-3">
          <div className="h-4 w-24 rounded bg-gold/20" />
          <div className="h-12 w-64 rounded bg-cream-deep" />
        </div>

        {/* Content skeleton */}
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-[3/4] rounded-2xl bg-cream-deep" />
              <div className="h-4 w-3/4 rounded bg-cream-deep" />
              <div className="h-4 w-1/2 rounded bg-cream-deep" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
