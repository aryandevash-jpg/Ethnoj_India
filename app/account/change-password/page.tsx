"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Lock, Eye, EyeOff, Shield } from "lucide-react";
import { toast } from "sonner";
import { AccountSidebar } from "@/components/AccountSidebar";
import type { DBUserProfile } from "@/lib/database.types";

export default function ChangePasswordPage() {
  const [profile, setProfile] = useState<DBUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/user/profile");
      const data = await res.json();
      if (data.profile) setProfile(data.profile);
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsSaving(true);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Password changed successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.error || "Failed to change password");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-maroon" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="mx-auto max-w-6xl px-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl text-ink">My Account</h1>
          <p className="text-ink/60 mt-1">Update your password</p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-[280px,1fr]">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <AccountSidebar
              userName={profile?.full_name}
              userEmail={profile?.email}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-white rounded-2xl shadow-soft border border-gold/20 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-full bg-maroon/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-maroon" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold text-ink">
                    Change Password
                  </h2>
                  <p className="text-sm text-ink/60">
                    Update your password to keep your account secure
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="max-w-md space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-ink/80">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-ink/40" />
                    <input
                      type={showPasswords ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      placeholder="Enter current password"
                      className="h-12 w-full rounded-lg border border-gold/30 bg-cream/50 pl-10 pr-12 text-sm outline-none transition focus:border-maroon focus:ring-2 focus:ring-maroon/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-ink/80">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-ink/40" />
                    <input
                      type={showPasswords ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="Min. 6 characters"
                      className="h-12 w-full rounded-lg border border-gold/30 bg-cream/50 pl-10 pr-12 text-sm outline-none transition focus:border-maroon focus:ring-2 focus:ring-maroon/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-ink/80">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-ink/40" />
                    <input
                      type={showPasswords ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Confirm new password"
                      className="h-12 w-full rounded-lg border border-gold/30 bg-cream/50 pl-10 pr-4 text-sm outline-none transition focus:border-maroon focus:ring-2 focus:ring-maroon/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(!showPasswords)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink/60"
                    >
                      {showPasswords ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="pt-4">
                  <motion.button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-3 bg-maroon text-cream rounded-lg font-medium text-sm hover:bg-maroon-deep transition disabled:opacity-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Lock className="h-4 w-4" />
                    )}
                    {isSaving ? "Updating..." : "Update Password"}
                  </motion.button>
                </div>
              </form>

              <div className="mt-8 p-4 rounded-xl bg-cream-deep/50 border border-gold/20">
                <h3 className="font-medium text-ink text-sm mb-2">
                  Password Tips
                </h3>
                <ul className="text-xs text-ink/60 space-y-1">
                  <li>• Use at least 6 characters</li>
                  <li>• Include both letters and numbers</li>
                  <li>• Avoid using personal information</li>
                  <li>• Don&apos;t reuse passwords from other sites</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
