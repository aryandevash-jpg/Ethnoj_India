"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  User,
  MapPin,
  Heart,
  Package,
  Lock,
  LogOut,
  ChevronRight,
} from "lucide-react";

const menuItems = [
  { href: "/account", label: "My Profile", icon: User },
  { href: "/account/addresses", label: "Saved Addresses", icon: MapPin },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/orders", label: "My Orders", icon: Package },
  { href: "/account/change-password", label: "Change Password", icon: Lock },
];

interface AccountSidebarProps {
  userName?: string;
  userEmail?: string;
}

export function AccountSidebar({ userName, userEmail }: AccountSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Failed to logout");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-gold/20 overflow-hidden">
      <div className="p-6 border-b border-gold/20 bg-cream-deep/50">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-maroon/10 flex items-center justify-center">
            <User className="h-7 w-7 text-maroon" />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold text-ink">
              {userName || "Welcome"}
            </h3>
            <p className="text-sm text-ink/60">{userEmail}</p>
          </div>
        </div>
      </div>

      <nav className="p-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                  isActive
                    ? "bg-maroon text-cream"
                    : "text-ink/70 hover:bg-cream-deep hover:text-maroon"
                }`}
                whileHover={{ x: isActive ? 0 : 4 }}
                transition={{ duration: 0.2 }}
              >
                <Icon className="h-5 w-5" />
                <span className="flex-1 text-sm font-medium">{item.label}</span>
                {!isActive && <ChevronRight className="h-4 w-4 opacity-50" />}
              </motion.div>
            </Link>
          );
        })}

        <motion.button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 mt-2 rounded-xl text-ink/70 hover:bg-destructive/10 hover:text-destructive transition"
          whileHover={{ x: 4 }}
          transition={{ duration: 0.2 }}
        >
          <LogOut className="h-5 w-5" />
          <span className="flex-1 text-left text-sm font-medium">Logout</span>
        </motion.button>
      </nav>
    </div>
  );
}
