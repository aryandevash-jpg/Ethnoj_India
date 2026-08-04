"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Mail, Lock, Eye, EyeOff, User, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function SignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (!agreeTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      setEmailSent(true);
    } catch {
      toast.error("An error occurred during signup");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4 py-12">
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
              Create Account
            </h1>
            <p className="text-ink/60 mt-2 text-sm">
              Join us for an exclusive shopping experience
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
                  We&apos;ve sent a verification link to{" "}
                  <span className="font-medium text-ink">{email}</span>
                </p>
                <button
                  onClick={() => router.push("/auth/login")}
                  className="text-maroon font-medium hover:text-maroon-deep transition"
                >
                  Back to login
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSignup}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label htmlFor="fullName" className="text-sm font-medium text-ink/80">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-ink/40" />
                    <input
                      id="fullName"
                      type="text"
                      placeholder="Your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      disabled={isLoading}
                      className="h-12 w-full rounded-lg border border-gold/30 bg-cream/50 pl-10 pr-4 text-sm outline-none transition focus:border-maroon focus:ring-2 focus:ring-maroon/20 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>

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

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-ink/80">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-ink/40" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="h-12 w-full rounded-lg border border-gold/30 bg-cream/50 pl-10 pr-12 text-sm outline-none transition focus:border-maroon focus:ring-2 focus:ring-maroon/20 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink/60"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-ink/80">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-ink/40" />
                    <input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="h-12 w-full rounded-lg border border-gold/30 bg-cream/50 pl-10 pr-4 text-sm outline-none transition focus:border-maroon focus:ring-2 focus:ring-maroon/20 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>

                <label className="flex items-start gap-2 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="h-4 w-4 mt-0.5 rounded border-gold/30 text-maroon focus:ring-maroon/20"
                  />
                  <span className="text-sm text-ink/70">
                    I agree to the{" "}
                    <Link href="/terms" className="text-maroon hover:text-maroon-deep">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-maroon hover:text-maroon-deep">
                      Privacy Policy
                    </Link>
                  </span>
                </label>

                <motion.button
                  type="submit"
                  className="flex h-12 w-full items-center justify-center rounded-lg bg-maroon text-sm font-medium text-cream transition hover:bg-maroon-deep disabled:cursor-not-allowed disabled:opacity-50 mt-6"
                  disabled={isLoading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>

          {!emailSent && (
            <div className="mt-6 text-center">
              <p className="text-sm text-ink/60">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="text-maroon font-medium hover:text-maroon-deep transition"
                >
                  Sign in
                </Link>
              </p>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-ink/50 mt-6">
          <Link href="/" className="hover:text-maroon transition">
            ← Back to store
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
