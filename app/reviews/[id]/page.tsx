"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Star, Quote, ArrowLeft, Share2, Check, Calendar, User, Heart, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { DBReview } from "@/lib/database.types";
import Link from "next/link";
import { toast } from "sonner";

export default function ReviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [review, setReview] = useState<DBReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [relatedReviews, setRelatedReviews] = useState<DBReview[]>([]);

  useEffect(() => {
    async function fetchReview() {
      const supabase = createClient();
      const id = params.id as string;

      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("id", id)
        .eq("is_approved", true)
        .single();

      if (error || !data) {
        console.error("Error fetching review:", error);
        setLoading(false);
        return;
      }

      setReview(data);

      // Fetch related reviews
      const { data: related } = await supabase
        .from("reviews")
        .select("*")
        .eq("is_approved", true)
        .neq("id", id)
        .order("created_at", { ascending: false })
        .limit(3);

      setRelatedReviews(related || []);
      setLoading(false);
    }

    fetchReview();
  }, [params.id]);

  const shareReview = async () => {
    const url = window.location.href;

    if (navigator.share && review) {
      try {
        await navigator.share({
          title: `Review by ${review.name} - Ethnoj`,
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cream via-white to-cream">
        <div className="mx-auto max-w-4xl px-5 py-16">
          <div className="animate-pulse">
            <div className="mb-8 h-8 w-32 rounded bg-gray-200" />
            <div className="overflow-hidden rounded-3xl bg-white">
              <div className="aspect-[16/10] bg-gray-200" />
              <div className="p-8">
                <div className="mb-4 h-6 w-32 rounded bg-gray-200" />
                <div className="mb-4 h-24 rounded bg-gray-200" />
                <div className="h-8 w-48 rounded bg-gray-200" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cream via-white to-cream">
        <div className="mx-auto max-w-4xl px-5 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-maroon/10">
              <Quote className="h-10 w-10 text-maroon/50" />
            </div>
            <h1 className="font-display text-3xl text-ink">Review Not Found</h1>
            <p className="mt-2 text-ink/60">This review may have been removed or doesn&apos;t exist.</p>
            <Link
              href="/reviews"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-maroon px-6 py-3 text-cream transition-all hover:bg-maroon-deep"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Reviews
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream via-white to-cream">
      {/* Header */}
      <div className="border-b border-gold/10 bg-white/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-ink/60 transition-colors hover:text-maroon"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={shareReview}
            className="flex items-center gap-2 rounded-full bg-cream px-4 py-2 text-sm font-medium text-maroon transition-all hover:bg-maroon hover:text-cream"
          >
            {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
            {copied ? "Copied!" : "Share"}
          </motion.button>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-5 py-8 sm:py-12">
        {/* Main Review Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-white"
        >
          {/* Decorative elements */}
          <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-gold/20 to-transparent blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-gradient-to-br from-maroon/10 to-transparent blur-3xl" />

          {/* Image */}
          {review.image && (
            <div className="relative">
              <motion.div
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8 }}
                className="relative aspect-[16/10] overflow-hidden sm:aspect-[2/1]"
              >
                <img
                  src={review.image}
                  alt={`Review by ${review.name}`}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent" />
              </motion.div>

              {/* Floating quote badge */}
              <div className="absolute -bottom-6 left-8 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-maroon to-maroon-deep ring-4 ring-white">
                <Quote className="h-6 w-6 text-gold" />
              </div>
            </div>
          )}

          {/* Content */}
          <div className={`relative p-6 sm:p-10 ${review.image ? "pt-10 sm:pt-12" : ""}`}>
            {/* No image quote icon */}
            {!review.image && (
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-maroon/10 to-gold/10">
                <Quote className="h-6 w-6 text-maroon" />
              </div>
            )}

            {/* Rating */}
            <div className="mb-6 flex flex-wrap items-center gap-4">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, k) => (
                  <motion.div
                    key={k}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + k * 0.1 }}
                  >
                    <Star
                      className={`h-6 w-6 ${
                        k < review.rating ? "fill-gold text-gold" : "fill-gray-200 text-gray-200"
                      }`}
                    />
                  </motion.div>
                ))}
              </div>
              <span className="rounded-full bg-gold/10 px-3 py-1 text-sm font-medium text-gold">
                {review.rating} out of 5
              </span>
            </div>

            {/* Review Text */}
            <motion.blockquote
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8 text-lg leading-relaxed text-ink/80 sm:text-xl"
            >
              &quot;{review.text}&quot;
            </motion.blockquote>

            {/* Author Info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center justify-between gap-4 border-t border-gold/10 pt-6"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-maroon to-maroon-deep text-cream">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-xl text-maroon">{review.name}</p>
                  <p className="flex items-center gap-1 text-sm text-ink/50">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(review.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {review.is_featured && (
                <div className="flex items-center gap-1.5 rounded-full bg-gold/10 px-3 py-1.5 text-sm font-medium text-gold">
                  <Heart className="h-4 w-4 fill-gold" />
                  Featured Review
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* Related Reviews */}
        {relatedReviews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-2xl text-maroon">More Reviews</h2>
              <Link
                href="/reviews"
                className="flex items-center gap-1 text-sm text-maroon/70 transition-colors hover:text-maroon"
              >
                View All
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {relatedReviews.map((r, i) => (
                <Link key={r.id} href={`/reviews/${r.id}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="group overflow-hidden rounded-xl bg-white p-4 border border-gold/10 transition-colors hover:border-gold/30"
                  >
                    {r.image && (
                      <div className="relative -mx-4 -mt-4 mb-4 aspect-video overflow-hidden">
                        <img
                          src={r.image}
                          alt=""
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="mb-2 flex gap-0.5">
                      {Array.from({ length: r.rating }).map((_, k) => (
                        <Star key={k} className="h-3.5 w-3.5 fill-gold text-gold" />
                      ))}
                    </div>
                    <p className="line-clamp-2 text-sm text-ink/70">&quot;{r.text}&quot;</p>
                    <p className="mt-2 font-display text-maroon">— {r.name}</p>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-12 rounded-2xl bg-gradient-to-br from-maroon via-maroon-deep to-ink p-8 text-center"
        >
          <h3 className="font-display text-2xl text-cream">Loved Your Purchase?</h3>
          <p className="mt-2 text-cream/70">Share your experience and help others discover Ethnoj</p>
          <Link
            href="/reviews"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-cream px-6 py-3 font-medium text-maroon transition-all hover:bg-gold hover:text-ink"
          >
            Write a Review
            <Heart className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
