"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface SectionHeadingProps {
  kicker?: string;
  title: string;
  sub?: string;
  align?: "center" | "left";
  light?: boolean;
}

const letterVariants = {
  hidden: { opacity: 0, y: 30, rotateX: -45 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      delay: i * 0.02,
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  }),
};

export function SectionHeading({
  kicker,
  title,
  sub,
  align = "center",
  light = false,
}: SectionHeadingProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const words = title.split(" ");

  return (
    <div
      ref={ref}
      className={`mx-auto mb-14 ${align === "center" ? "max-w-2xl text-center" : "max-w-xl"}`}
    >
      {kicker && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className={`text-xs uppercase tracking-[0.5em] ${light ? "text-gold" : "text-gold"}`}
        >
          {kicker}
        </motion.p>
      )}

      <motion.h2
        className={`mt-4 font-display text-4xl text-balance md:text-5xl lg:text-6xl ${
          light ? "text-cream" : "text-ink"
        }`}
        style={{ perspective: "1000px" }}
      >
        {words.map((word, i) => (
          <motion.span
            key={i}
            custom={i}
            variants={letterVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="mr-3 inline-block origin-bottom"
          >
            {word}
          </motion.span>
        ))}
      </motion.h2>

      {sub && (
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4, duration: 0.6 }}
          className={`mt-5 text-lg leading-relaxed ${light ? "text-cream/70" : "text-ink/70"}`}
        >
          {sub}
        </motion.p>
      )}

      <motion.div
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : {}}
        transition={{ delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`mx-auto mt-8 h-px w-32 origin-left bg-gradient-to-r from-transparent via-gold to-transparent ${
          align === "left" ? "mx-0" : ""
        }`}
      />
    </div>
  );
}
