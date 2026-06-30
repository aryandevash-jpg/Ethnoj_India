import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function Preloader() {
  const [done, setDone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setDone(true), 1800);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-cream"
        >
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: "110%" }}
            transition={{ delay: 1.1, duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
            className="absolute inset-0 bg-gradient-to-br from-cream via-cream-deep to-cream"
          />
          <svg viewBox="0 0 200 80" className="relative w-56">
            <motion.text
              x="100" y="56" textAnchor="middle"
              className="font-display"
              style={{
                fontSize: 56,
                fill: "none",
                stroke: "var(--gold)",
                strokeWidth: 1.2,
                fontFamily: "var(--font-display)",
                letterSpacing: "0.04em",
              }}
              initial={{ strokeDasharray: 400, strokeDashoffset: 400 }}
              animate={{ strokeDashoffset: 0, fill: "var(--maroon)" }}
              transition={{ duration: 1.1, ease: "easeInOut" }}
            >
              Ethnoj
            </motion.text>
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
