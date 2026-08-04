"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      setEmailSent(true);
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-soft p-8 border border-gold/20">
          <div className="text-center mb-8">
            <Link href="/">
              <motion.h2
                className="font-display text-3xl text-maroon"
                whileHover={{ scale: 1.02 }}
              >
                Ethnoj
                <span className="text-gold">.</span>
              </motion.h2>
            </Link>
            <h1 className="text-xl font-display font-semibold text-ink mt-4">
              Forgot Password?
            </h1>
            <p className="text-ink/60 mt-2 text-sm">
              No worries, we&apos;ll send you reset instructions
            </p>
          </div>

          <AnimatePresence mode="wait">
            {emailSent ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-8"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald/10 mb-4">
                  <CheckCircle className="h-8 w-8 text-emerald" />
                </div>
                <h3 className="text-lg font-semibold text-ink mb-2">
                  Check your email
                </h3>
                <p className="text-ink/60 text-sm mb-6">
                  We&apos;ve sent a password reset link to{" "}
                  <span className="font-medium text-ink">{email}</span>
                </p>
                <button
                  onClick={() => setEmailSent(false)}
                  className="text-maroon font-medium hover:text-maroon-deep transition"
                >
                  Didn&apos;t receive it? Try again
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-ink/80">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-ink/40" />
                    <input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="h-12 w-full rounded-lg border border-gold/30 bg-cream/50 pl-10 pr-4 text-sm outline-none transition focus:border-maroon focus:ring-2 focus:ring-maroon/20 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  className="flex h-12 w-full items-center justify-center rounded-lg bg-maroon text-sm font-medium text-cream transition hover:bg-maroon-deep disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isLoading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-6 text-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-sm text-ink/60 hover:text-maroon transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
