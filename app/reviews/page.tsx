"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Camera, Send, Quote, Share2, Check, X, Sparkles, Heart, MessageCircle } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { createClient } from "@/lib/supabase/client";
import type { DBReview } from "@/lib/database.types";
import { CloudinaryUpload } from "@/components/CloudinaryUpload";
import Link from "next/link";
import { toast } from "sonner";

interface ReviewFormData {
  name: string;
  email: string;
  rating: number;
  text: string;
  image: string;
}

function ReviewCard({ review, index }: { review: DBReview; index: number }) {
  const [copied, setCopied] = useState(false);

  const shareReview = async () => {
    const url = `${window.location.origin}/reviews/${review.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Review by ${review.name}`,
          text: review.text.slice(0, 100) + "...",
          url,
        });
      } catch {
        copyToClipboard(url);
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, rotate: -1 }}
      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: (index % 6) * 0.08 }}
      className="group relative break-inside-avoid"
    >
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cream via-white to-cream/80 p-1 transition-all duration-500">
        {/* Decorative border gradient */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gold/30 via-maroon/20 to-gold/30 opacity-60" />
        
        <div className="relative overflow-hidden rounded-xl bg-white/95 backdrop-blur-sm">
          {/* Image Section */}
          {review.image && (
            <div className="relative overflow-hidden">
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.4 }}
                className="relative aspect-[4/3] overflow-hidden"
              >
                <img 
                  src={review.image} 
                  alt={`Review by ${review.name}`} 
                  loading="lazy" 
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent" />
              </motion.div>
              
              {/* Floating quote icon */}
              <div className="absolute -bottom-4 left-5 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-maroon to-maroon-deep">
                <Quote className="h-4 w-4 text-gold" />
              </div>
            </div>
          )}

          <div className={`p-5 ${review.image ? "pt-8" : ""}`}>
            {/* No image quote icon */}
            {!review.image && (
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-maroon/10 to-gold/10">
                <Quote className="h-4 w-4 text-maroon" />
              </div>
            )}

            {/* Rating */}
            <div className="mb-3 flex items-center gap-2">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star 
                    key={k} 
                    className={`h-4 w-4 ${k < review.rating ? "fill-gold text-gold" : "fill-gray-200 text-gray-200"}`} 
                  />
                ))}
              </div>
              <span className="text-xs font-medium text-ink/40">{review.rating}/5</span>
            </div>

            {/* Review Text */}
            <p className="mb-4 text-sm leading-relaxed text-ink/80 line-clamp-4">
              &quot;{review.text}&quot;
            </p>

            {/* Author & Actions */}
            <div className="flex items-center justify-between border-t border-gold/10 pt-4">
              <div>
                <p className="font-display text-lg text-maroon">— {review.name}</p>
                <p className="text-xs text-ink/40">
                  {new Date(review.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              
              <div className="flex gap-2">
                <Link 
                  href={`/reviews/${review.id}`}
                  className="rounded-full bg-cream p-2 text-maroon/60 transition-all hover:bg-maroon hover:text-cream"
                >
                  <MessageCircle className="h-4 w-4" />
                </Link>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={shareReview}
                  className="rounded-full bg-cream p-2 text-maroon/60 transition-all hover:bg-maroon hover:text-cream"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ReviewForm({ onSuccess }: { onSuccess: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [formData, setFormData] = useState<ReviewFormData>({
    name: "",
    email: "",
    rating: 5,
    text: "",
    image: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.text.trim()) {
      toast.error("Please fill in your name and review");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.from("reviews").insert({
        name: formData.name.trim(),
        email: formData.email.trim() || null,
        rating: formData.rating,
        text: formData.text.trim(),
        image: formData.image || null,
        is_approved: false,
        is_featured: false,
      });

      if (error) throw error;

      toast.success("Thank you! Your review has been submitted for approval.");
      setFormData({ name: "", email: "", rating: 5, text: "", image: "" });
      setIsOpen(false);
      onSuccess();
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-12">
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.div
            key="button"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsOpen(true)}
              className="group relative overflow-hidden rounded-full bg-gradient-to-r from-maroon to-maroon-deep px-8 py-4 text-cream transition-all"
            >
              <span className="relative z-10 flex items-center gap-3 font-medium">
                <Sparkles className="h-5 w-5" />
                Share Your Experience
                <Heart className="h-4 w-4 transition-transform group-hover:scale-125" />
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-gold/20 to-transparent"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.6 }}
              />
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.3 }}
            className="relative mx-auto max-w-2xl"
          >
            {/* Decorative background */}
            <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-maroon/5 via-gold/5 to-cream blur-xl" />
            
            <div className="overflow-hidden rounded-3xl bg-white/80 p-1 backdrop-blur-sm">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-gold/20 via-maroon/10 to-gold/20" />
              
              <div className="relative rounded-[22px] bg-white p-6 sm:p-8">
                {/* Close button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute right-4 top-4 rounded-full bg-gray-100 p-2 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="mb-6 text-center">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-maroon/10 to-gold/10">
                    <Quote className="h-6 w-6 text-maroon" />
                  </div>
                  <h3 className="font-display text-2xl text-maroon">Share Your Story</h3>
                  <p className="mt-1 text-sm text-ink/60">Your review helps other customers</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Rating */}
                  <div className="text-center">
                    <label className="mb-2 block text-sm font-medium text-ink/70">Your Rating</label>
                    <div className="flex justify-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <motion.button
                          key={star}
                          type="button"
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          onMouseEnter={() => setHoveredStar(star)}
                          onMouseLeave={() => setHoveredStar(0)}
                          onClick={() => setFormData({ ...formData, rating: star })}
                          className="p-1"
                        >
                          <Star
                            className={`h-8 w-8 transition-colors ${
                              star <= (hoveredStar || formData.rating)
                                ? "fill-gold text-gold"
                                : "fill-gray-200 text-gray-200"
                            }`}
                          />
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Name & Email */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-ink/70">
                        Your Name <span className="text-maroon">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter your name"
                        className="w-full rounded-xl border border-gold/20 bg-cream/30 px-4 py-3 text-ink outline-none transition-all placeholder:text-ink/30 focus:border-maroon focus:ring-2 focus:ring-maroon/10"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-ink/70">Email (optional)</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your@email.com"
                        className="w-full rounded-xl border border-gold/20 bg-cream/30 px-4 py-3 text-ink outline-none transition-all placeholder:text-ink/30 focus:border-maroon focus:ring-2 focus:ring-maroon/10"
                      />
                    </div>
                  </div>

                  {/* Review Text */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-ink/70">
                      Your Review <span className="text-maroon">*</span>
                    </label>
                    <textarea
                      value={formData.text}
                      onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                      placeholder="Tell us about your experience with the product..."
                      rows={4}
                      className="w-full resize-none rounded-xl border border-gold/20 bg-cream/30 px-4 py-3 text-ink outline-none transition-all placeholder:text-ink/30 focus:border-maroon focus:ring-2 focus:ring-maroon/10"
                      required
                    />
                  </div>

                  {/* Photo Upload */}
                  <div>
                    <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-ink/70">
                      <Camera className="h-4 w-4" />
                      Add a Photo (optional)
                    </label>
                    <CloudinaryUpload
                      value={formData.image}
                      onChange={(url) => setFormData({ ...formData, image: url })}
                      type="image"
                      label=""
                      placeholder="Upload your photo"
                      folder="reviews"
                    />
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-maroon to-maroon-deep py-4 font-medium text-cream transition-all disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="h-5 w-5 rounded-full border-2 border-cream border-t-transparent"
                        />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        Submit Review
                      </>
                    )}
                  </motion.button>

                  <p className="text-center text-xs text-ink/40">
                    Reviews are moderated and will appear after approval
                  </p>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<DBReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  async function fetchReviews() {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("is_approved", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching reviews:", error);
    } else {
      setReviews(data || []);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cream via-white to-cream">
        <div className="mx-auto max-w-7xl px-5 py-16">
          <SectionHeading
            kicker="In their words"
            title="Customer Stories"
            sub="Real photos and words from the women who wear Ethnoj."
          />
          <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 [&>*]:mb-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="break-inside-avoid animate-pulse overflow-hidden rounded-2xl bg-white p-5"
              >
                <div className="mb-4 aspect-[4/3] rounded-lg bg-gray-100" />
                <div className="mb-2 h-4 w-24 rounded bg-gray-100" />
                <div className="mb-3 h-20 rounded bg-gray-100" />
                <div className="h-4 w-32 rounded bg-gray-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream via-white to-cream">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-maroon via-maroon-deep to-ink py-16 sm:py-24">
        <div className="absolute inset-0 bg-jali opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-maroon-deep/50 to-transparent" />
        
        <div className="relative mx-auto max-w-7xl px-5 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="mb-3 text-xs uppercase tracking-[0.5em] text-gold">In Their Words</p>
            <h1 className="font-display text-4xl text-cream sm:text-5xl lg:text-6xl">Customer Stories</h1>
            <p className="mx-auto mt-4 max-w-xl text-cream/70">
              Real photos and heartfelt words from the women who wear Ethnoj. 
              Every review tells a story of tradition, elegance, and joy.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10 flex flex-wrap justify-center gap-8"
          >
            <div className="text-center">
              <p className="font-display text-3xl text-gold">{reviews.length}+</p>
              <p className="text-xs uppercase tracking-wider text-cream/60">Happy Customers</p>
            </div>
            <div className="text-center">
              <p className="font-display text-3xl text-gold">
                {reviews.length > 0 
                  ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) 
                  : "5.0"}
              </p>
              <p className="text-xs uppercase tracking-wider text-cream/60">Average Rating</p>
            </div>
            <div className="text-center">
              <p className="font-display text-3xl text-gold">
                {reviews.filter(r => r.image).length}
              </p>
              <p className="text-xs uppercase tracking-wider text-cream/60">Photo Reviews</p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-12 sm:py-16">
        {/* Review Form */}
        <ReviewForm onSuccess={fetchReviews} />

        {/* Reviews Grid */}
        {reviews.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border-2 border-dashed border-gold/30 bg-white/50 py-20 text-center backdrop-blur-sm"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-maroon/10 to-gold/10">
              <Quote className="h-8 w-8 text-maroon/50" />
            </div>
            <p className="font-display text-2xl text-ink/70">No reviews yet</p>
            <p className="mt-2 text-sm text-ink/50">
              Be the first to share your experience with Ethnoj!
            </p>
          </motion.div>
        ) : (
          <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 [&>*]:mb-6">
            {reviews.map((review, index) => (
              <ReviewCard key={review.id} review={review} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
