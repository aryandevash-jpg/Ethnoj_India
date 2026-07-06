"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { createClient } from "@/lib/supabase/client";
import type { DBReview } from "@/lib/database.types";

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
      <div className="mx-auto max-w-7xl px-5 py-16">
        <SectionHeading
          kicker="In their words"
          title="Customer stories"
          sub="Real photos and words from the women who wear Ethnoj."
        />
        <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="break-inside-avoid rounded-2xl bg-gray-100 p-5 animate-pulse"
            >
              <div className="h-48 bg-gray-200 rounded-lg mb-4" />
              <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
              <div className="h-20 bg-gray-200 rounded mb-3" />
              <div className="h-4 bg-gray-200 rounded w-32" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-16">
      <SectionHeading
        kicker="In their words"
        title="Customer stories"
        sub="Real photos and words from the women who wear Ethnoj."
      />

      {reviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gold/40 py-20 text-center">
          <p className="font-display text-2xl text-ink/70">No reviews yet</p>
          <p className="mt-2 text-sm text-ink/50">
            Be the first to share your experience!
          </p>
        </div>
      ) : (
        <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5">
          {reviews.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 24, rotate: -2 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: (i % 4) * 0.08 }}
              whileHover={{ y: -4 }}
              className="group relative break-inside-avoid overflow-hidden rounded-2xl bg-card p-5 gold-border"
            >
              {r.image && (
                <div className="relative -m-5 mb-4 overflow-hidden">
                  <img src={r.image} alt="" loading="lazy" className="w-full" />
                  <div className="absolute right-0 top-0 h-12 w-12 bg-gradient-to-bl from-gold/70 to-transparent" />
                </div>
              )}
              <div className="mb-2 flex gap-0.5 text-gold">
                {Array.from({ length: r.rating }).map((_, k) => (
                  <Star key={k} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <p className="text-sm italic leading-relaxed text-ink/80">
                &quot;{r.text}&quot;
              </p>
              <p className="mt-3 font-display text-lg text-maroon">— {r.name}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
