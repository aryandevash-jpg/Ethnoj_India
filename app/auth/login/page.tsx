"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Mail, Lock, Eye, EyeOff, Sparkles, ShoppingBag, Heart, ArrowRight, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";
  const urlError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(urlError);

  const validateForm = (): string | null => {
    if (!email.trim()) return "Please enter your email address.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "Please enter a valid email address.";
    if (!password) return "Please enter your password.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (signInError) {
        if (signInError.message.includes("Invalid login credentials")) {
          setError("Invalid email or password. Please try again.");
        } else if (signInError.message.includes("Email not confirmed")) {
          setError("Please verify your email address before signing in.");
        } else {
          setError(signInError.message);
        }
        setIsSubmitting(false);
        return;
      }

      router.replace(redirectTo);
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  const benefits = [
    { icon: ShoppingBag, text: "Track your orders in real-time" },
    { icon: Heart, text: "Save favorites to your wishlist" },
    { icon: Sparkles, text: "Get exclusive member discounts" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-maroon-deep via-maroon to-maroon-deep overflow-hidden">
        <div className="absolute inset-0 bg-jali opacity-10" />
        
        <motion.div
          className="absolute left-[10%] top-[15%] h-64 w-64 rounded-full bg-gold/20 blur-3xl"
          animate={{ y: [0, -30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-[5%] bottom-[20%] h-96 w-96 rounded-full bg-cream/10 blur-3xl"
          animate={{ y: [0, 20, 0], scale: [1, 0.95, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Link href="/">
              <h2 className="font-display text-4xl text-cream mb-2">
                Ethnoj<span className="text-gold">.</span>
              </h2>
            </Link>
            <p className="text-cream/80 text-sm tracking-widest uppercase mb-12">
              Handcrafted Elegance
            </p>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="font-display text-4xl xl:text-5xl text-cream leading-tight mb-6"
          >
            Welcome back to<br />
            <span className="text-gold">timeless tradition</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-cream/90 text-lg mb-10 max-w-md"
          >
            Sign in to access your personalized shopping experience and exclusive collections.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="space-y-5"
          >
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/20 backdrop-blur-sm">
                  <benefit.icon className="h-5 w-5 text-gold" />
                </div>
                <span className="text-cream text-lg">{benefit.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-maroon-deep/50 to-transparent" />
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center bg-cream px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden text-center mb-8">
            <Link href="/">
              <h2 className="font-display text-3xl text-maroon">
                Ethnoj<span className="text-gold">.</span>
              </h2>
            </Link>
          </div>

          <div className="bg-white rounded-3xl shadow-warm p-8 md:p-10 border border-gold/10">
            <div className="mb-8">
              <h1 className="text-2xl font-display font-semibold text-ink">
                Sign in to your account
              </h1>
              <p className="text-ink/60 mt-2">
                Enter your credentials to continue shopping
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-ink/80">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink/40" />
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(null); }}
                    disabled={isSubmitting}
                    className="h-14 w-full rounded-xl border border-gold/30 bg-cream/30 pl-12 pr-4 text-ink outline-none transition focus:border-maroon focus:ring-2 focus:ring-maroon/20 focus:bg-white disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-ink/80">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink/40" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(null); }}
                    disabled={isSubmitting}
                    className="h-14 w-full rounded-xl border border-gold/30 bg-cream/30 pl-12 pr-14 text-ink outline-none transition focus:border-maroon focus:ring-2 focus:ring-maroon/20 focus:bg-white disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink/70"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end">
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-maroon hover:text-maroon-deep transition font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-maroon text-base font-medium text-cream transition hover:bg-maroon-deep disabled:opacity-50 shadow-lg shadow-maroon/20"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-ink/60">
                Don&apos;t have an account?{" "}
                <Link href="/auth/signup" className="text-maroon font-semibold hover:text-maroon-deep transition">
                  Create one now
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-sm text-ink/50 mt-8">
            <Link href="/" className="hover:text-maroon transition inline-flex items-center gap-1">
              <ArrowRight className="h-4 w-4 rotate-180" />
              Back to store
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function LoginFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <Loader2 className="h-10 w-10 animate-spin text-maroon" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
