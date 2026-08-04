"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Heart, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { AccountSidebar } from "@/components/AccountSidebar";
import { useCart, formatINR } from "@/lib/cart";
import type { DBUserProfile, DBWishlistItem } from "@/lib/database.types";

export default function WishlistPage() {
  const [profile, setProfile] = useState<DBUserProfile | null>(null);
  const [wishlist, setWishlist] = useState<DBWishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const addToCart = useCart((s) => s.add);
  const setCartOpen = useCart((s) => s.setOpen);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, wishlistRes] = await Promise.all([
        fetch("/api/user/profile"),
        fetch("/api/user/wishlist"),
      ]);

      const profileData = await profileRes.json();
      const wishlistData = await wishlistRes.json();

      if (profileData.profile) setProfile(profileData.profile);
      if (wishlistData.wishlist) setWishlist(wishlistData.wishlist);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      const res = await fetch("/api/user/wishlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId }),
      });

      if (res.ok) {
        setWishlist(wishlist.filter((item) => item.product_id !== productId));
        toast.success("Removed from wishlist");
      } else {
        toast.error("Failed to remove item");
      }
    } catch {
      toast.error("An error occurred");
    }
  };

  const handleAddToCart = (item: DBWishlistItem) => {
    if (!item.product) return;

    const product = {
      id: item.product.id,
      name: item.product.name,
      category: item.product.category as "co-ord-sets" | "kurtis" | "ladies-suits" | "sarees" | "lehengas",
      price: Number(item.product.price),
      mrp: item.product.mrp ? Number(item.product.mrp) : undefined,
      image: item.product.image,
      hoverImage: item.product.hover_image || item.product.image,
      colors: item.product.colors || [],
      sizes: item.product.sizes || [],
      description: item.product.description,
      rating: Number(item.product.rating),
      reviews: item.product.reviews_count,
    };

    const defaultSize = product.sizes[0] || "Free";
    addToCart(product, defaultSize);
    toast.success("Added to cart");
    setCartOpen(true);
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
          <p className="text-ink/60 mt-1">Your saved items</p>
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
                  <Heart className="h-5 w-5 text-maroon" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold text-ink">
                    My Wishlist
                  </h2>
                  <p className="text-sm text-ink/60">
                    {wishlist.length} item{wishlist.length !== 1 ? "s" : ""} saved
                  </p>
                </div>
              </div>

              {wishlist.length === 0 ? (
                <div className="text-center py-12">
                  <div className="h-16 w-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-8 w-8 text-gold" />
                  </div>
                  <h3 className="font-medium text-ink mb-2">
                    Your wishlist is empty
                  </h3>
                  <p className="text-sm text-ink/60 mb-4">
                    Save items you love for later
                  </p>
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-maroon text-cream rounded-lg font-medium text-sm hover:bg-maroon-deep transition"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Browse Products
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <AnimatePresence mode="popLayout">
                    {wishlist.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.05 }}
                        className="group relative rounded-xl border border-gold/30 overflow-hidden bg-cream/50"
                      >
                        {item.product && (
                          <>
                            <Link
                              href={`/products/${item.product.slug}`}
                              className="block relative aspect-[3/4] overflow-hidden"
                            >
                              <Image
                                src={item.product.image}
                                alt={item.product.name}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            </Link>

                            <div className="p-4">
                              <Link href={`/products/${item.product.slug}`}>
                                <h3 className="font-medium text-ink text-sm line-clamp-1 hover:text-maroon transition">
                                  {item.product.name}
                                </h3>
                              </Link>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="font-semibold text-maroon">
                                  {formatINR(Number(item.product.price))}
                                </span>
                                {item.product.mrp && (
                                  <span className="text-xs text-ink/50 line-through">
                                    {formatINR(Number(item.product.mrp))}
                                  </span>
                                )}
                              </div>

                              <div className="flex gap-2 mt-3">
                                <motion.button
                                  onClick={() => handleAddToCart(item)}
                                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-maroon text-cream rounded-lg text-xs font-medium hover:bg-maroon-deep transition"
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <ShoppingBag className="h-3.5 w-3.5" />
                                  Add to Cart
                                </motion.button>
                                <motion.button
                                  onClick={() => handleRemove(item.product_id)}
                                  className="p-2 border border-gold/30 rounded-lg text-ink/50 hover:text-destructive hover:border-destructive/30 transition"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </motion.button>
                              </div>
                            </div>
                          </>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
