"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Mail, Lock, Eye, EyeOff, User, CheckCircle, ArrowRight, Shield, Gift, Truck, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function SignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = (): string | null => {
    if (!fullName.trim()) return "Please enter your full name.";
    if (!email.trim()) return "Please enter your email address.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "Please enter a valid email address.";
    if (!password) return "Please enter a password.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (password !== confirmPassword) return "Passwords do not match.";
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
      const normalizedEmail = email.trim().toLowerCase();

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: { full_name: fullName.trim() },
        },
      });

      if (signUpError) {
        if (signUpError.message.includes("already registered")) {
          setError("An account with this email already exists. Please sign in instead.");
        } else {
          setError(signUpError.message);
        }
        setIsSubmitting(false);
        return;
      }

      if (!data.session) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        if (signInError) {
          setError(signInError.message);
          setIsSubmitting(false);
          return;
        }
      }

      router.replace("/");
    } catch (err) {
      console.error("Signup error:", err);
      setError("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  const passwordStrength = () => {
    if (password.length === 0) return { width: "0%", color: "bg-gray-200", text: "" };
    if (password.length < 6) return { width: "25%", color: "bg-red-400", text: "Too short" };
    if (password.length < 8) return { width: "50%", color: "bg-orange-400", text: "Weak" };
    if (password.length >= 8) return { width: "75%", color: "bg-yellow-400", text: "Good" };
    return { width: "100%", color: "bg-emerald", text: "Strong" };
  };

  const strength = passwordStrength();

  const benefits = [
    { icon: Gift, text: "Get 10% off your first order" },
    { icon: Truck, text: "Free shipping on orders over ₹1499" },
    { icon: Shield, text: "100% secure checkout" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center bg-cream px-6 py-12 order-2 lg:order-1">
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
                Create your account
              </h1>
              <p className="text-ink/60 mt-2">
                Join us for an exclusive shopping experience
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-medium text-ink/80">
                  Full name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink/40" />
                  <input
                    id="fullName"
                    type="text"
                    placeholder="Your full name"
                    value={fullName}
                    onChange={(e) => { setFullName(e.target.value); setError(null); }}
                    disabled={isSubmitting}
                    className="h-14 w-full rounded-xl border border-gold/30 bg-cream/30 pl-12 pr-4 text-ink outline-none transition focus:border-maroon focus:ring-2 focus:ring-maroon/20 focus:bg-white disabled:opacity-50"
                  />
                </div>
              </div>

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
                    placeholder="Min. 6 characters"
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
                {password.length > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full ${strength.color} transition-all`} style={{ width: strength.width }} />
                    </div>
                    <span className="text-xs text-ink/60">{strength.text}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-ink/80">
                  Confirm password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink/40" />
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
                    disabled={isSubmitting}
                    className={`h-14 w-full rounded-xl border bg-cream/30 pl-12 pr-12 text-ink outline-none transition focus:ring-2 focus:bg-white disabled:opacity-50 ${
                      confirmPassword.length > 0 && confirmPassword !== password
                        ? "border-red-400 focus:border-red-400 focus:ring-red-200"
                        : confirmPassword.length > 0 && confirmPassword === password
                        ? "border-emerald focus:border-emerald focus:ring-emerald/20"
                        : "border-gold/30 focus:border-maroon focus:ring-maroon/20"
                    }`}
                  />
                  {confirmPassword.length > 0 && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2">
                      {confirmPassword === password ? (
                        <CheckCircle className="h-5 w-5 text-emerald" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-maroon text-base font-medium text-cream transition hover:bg-maroon-deep disabled:opacity-50 shadow-lg shadow-maroon/20 mt-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-ink/60">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-maroon font-semibold hover:text-maroon-deep transition">
                  Sign in
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

      {/* Right Side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-bl from-maroon-deep via-maroon to-maroon-deep overflow-hidden order-1 lg:order-2">
        <div className="absolute inset-0 bg-jali opacity-10" />
        
        <motion.div
          className="absolute right-[10%] top-[15%] h-64 w-64 rounded-full bg-gold/20 blur-3xl"
          animate={{ y: [0, -30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute left-[5%] bottom-[20%] h-96 w-96 rounded-full bg-cream/10 blur-3xl"
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
            Begin your journey into<br />
            <span className="text-gold">artisanal fashion</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-cream/90 text-lg mb-10 max-w-md"
          >
            Create an account to discover handpicked collections and enjoy exclusive member benefits.
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
                initial={{ opacity: 0, x: 20 }}
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
    </div>
  );
}
