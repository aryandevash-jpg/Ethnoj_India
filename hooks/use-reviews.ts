"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { DBReview } from "@/lib/database.types";

export function useReviews(options?: { featured?: boolean; productId?: string }) {
  const [reviews, setReviews] = useState<DBReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchReviews() {
      const supabase = createClient();

      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        let query = supabase
          .from("reviews")
          .select("*")
          .eq("is_approved", true);

        if (options?.featured) {
          query = query.eq("is_featured", true);
        }

        if (options?.productId) {
          query = query.eq("product_id", options.productId);
        }

        query = query.order("created_at", { ascending: false });

        const { data, error } = await query;

        if (error) throw error;
        setReviews(data || []);
      } catch (err) {
        setError(err as Error);
        console.error("Error fetching reviews:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, [options?.featured, options?.productId]);

  return { reviews, loading, error };
}

export async function submitReview(review: {
  name: string;
  email?: string;
  rating: number;
  text: string;
  product_id?: string;
}) {
  const supabase = createClient();
  if (!supabase) {
    throw new Error("Database not configured");
  }

  const { data, error } = await supabase
    .from("reviews")
    .insert({
      ...review,
      is_approved: false,
      is_featured: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
