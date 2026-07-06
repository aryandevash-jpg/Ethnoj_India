"use client";

import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { useRef, useState } from "react";
import { Instagram, Mail, ArrowRight, MapPin, Phone } from "lucide-react";
import { useAdminConfig } from "@/lib/admin-config";
import { toast } from "sonner";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

const linkHoverVariants = {
  rest: { x: 0 },
  hover: { x: 6, transition: { duration: 0.2 } },
};

export function Footer() {
  const config = useAdminConfig((s) => s.config.footer);
  const footerRef = useRef<HTMLElement>(null);
  const isInView = useInView(footerRef, { once: true, margin: "-100px" });
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("Welcome to the family!", {
      description: "You'll be the first to know about new collections.",
    });
    setEmail("");
    setIsSubmitting(false);
  };

  const getIcon = (platform: string) => {
    switch (platform) {
      case "instagram":
        return <Instagram className="h-5 w-5" />;
      case "email":
        return <Mail className="h-5 w-5" />;
      default:
        return <Mail className="h-5 w-5" />;
    }
  };

  return (
    <footer
      ref={footerRef}
      className="relative mt-24 overflow-hidden border-t border-gold/30 bg-cream-deep/80"
    >
      <div className="absolute inset-0 bg-jali opacity-40" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="relative mx-auto max-w-7xl px-5 py-20"
      >
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-12">
          <motion.div variants={itemVariants} className="lg:col-span-4">
            <Link href="/" className="inline-block">
              <motion.h3
                className="font-display text-3xl text-maroon"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                {config.brand.name}
                <motion.span
                  className="text-gold"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  .
                </motion.span>
              </motion.h3>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink/70">
              {config.brand.tagline}
            </p>

            <form onSubmit={handleNewsletterSubmit} className="mt-8">
              <p className="mb-3 text-xs uppercase tracking-[0.2em] text-ink/60">
                {config.newsletterText}
              </p>
              <div className="flex gap-2">
                <motion.input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 rounded-full border border-gold/30 bg-cream px-4 py-3 text-sm text-ink placeholder:text-ink/40 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                  whileFocus={{ scale: 1.01 }}
                />
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-full bg-maroon p-3 text-cream transition hover:bg-maroon-deep disabled:opacity-50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowRight className="h-5 w-5" />
                </motion.button>
              </div>
            </form>

            <div className="mt-8 flex gap-3">
              {config.socialLinks.map((link, i) => (
                <motion.a
                  key={link.platform}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-gold/40 p-3 text-ink/70 transition hover:border-gold hover:bg-gold/10 hover:text-maroon"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {getIcon(link.platform)}
                </motion.a>
              ))}
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 lg:col-start-6"
          >
            <h4 className="mb-5 text-xs uppercase tracking-[0.2em] text-ink/60">
              Shop
            </h4>
            <ul className="space-y-3">
              {config.shopLinks.map((link) => (
                <li key={link.label}>
                  <motion.div initial="rest" whileHover="hover">
                    <Link
                      href={link.href}
                      className="inline-flex items-center text-sm text-ink/80 transition hover:text-maroon"
                    >
                      <motion.span variants={linkHoverVariants}>
                        {link.label}
                      </motion.span>
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={itemVariants} className="lg:col-span-2">
            <h4 className="mb-5 text-xs uppercase tracking-[0.2em] text-ink/60">
              Help
            </h4>
            <ul className="space-y-3">
              {config.helpLinks.map((link) => (
                <li key={link.label}>
                  <motion.div initial="rest" whileHover="hover">
                    <Link
                      href={link.href}
                      className="inline-flex items-center text-sm text-ink/80 transition hover:text-maroon"
                    >
                      <motion.span variants={linkHoverVariants}>
                        {link.label}
                      </motion.span>
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={itemVariants} className="lg:col-span-3">
            <h4 className="mb-5 text-xs uppercase tracking-[0.2em] text-ink/60">
              Visit Us
            </h4>
            <div className="space-y-4">
              <motion.div
                className="flex items-start gap-3"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold" />
                <p className="text-sm text-ink/80">
                  123 Fashion Street, Bandra West
                  <br />
                  Mumbai, Maharashtra 400050
                </p>
              </motion.div>
              <motion.div
                className="flex items-center gap-3"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <Phone className="h-4 w-4 flex-shrink-0 text-gold" />
                <a
                  href="tel:+919876543210"
                  className="text-sm text-ink/80 hover:text-maroon"
                >
                  +91 98765 43210
                </a>
              </motion.div>
              <motion.div
                className="flex items-center gap-3"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <Mail className="h-4 w-4 flex-shrink-0 text-gold" />
                <a
                  href="mailto:hello@ethnoj.com"
                  className="text-sm text-ink/80 hover:text-maroon"
                >
                  hello@ethnoj.com
                </a>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 0.8 }}
        className="relative border-t border-gold/20 px-5 py-6"
      >
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-xs text-ink/50">
            © {new Date().getFullYear()} {config.brand.name}. {config.copyright}
          </p>
          <div className="flex gap-6 text-xs text-ink/50">
            <Link href="#" className="transition hover:text-maroon">
              Privacy Policy
            </Link>
            <Link href="#" className="transition hover:text-maroon">
              Terms of Service
            </Link>
            <Link href="#" className="transition hover:text-maroon">
              Shipping Policy
            </Link>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-gold/5 blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -left-20 top-20 h-32 w-32 rounded-full bg-maroon/5 blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
    </footer>
  );
}
