"use client";

import { useEffect, useState } from "react";
import { Star, Check, X, Trash2, Eye } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { DBReview } from "@/lib/database.types";
import { toast } from "sonner";
import { confirmToast } from "@/lib/confirm-toast";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<DBReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");

  useEffect(() => {
    const controller = new AbortController();
    fetchReviews(controller.signal);
    return () => controller.abort();
  }, []);

  async function fetchReviews(signal?: AbortSignal) {
    try {
      const supabase = createClient();

      const timeoutId = setTimeout(() => {
        if (!signal?.aborted) {
          setLoading(false);
          toast.error("Request taking too long. Please refresh.");
        }
      }, 10000);

      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });

      clearTimeout(timeoutId);
      if (signal?.aborted) return;

      if (error) {
        console.error("Error fetching reviews:", error);
        toast.error("Failed to fetch reviews");
      } else {
        setReviews(data || []);
      }
    } catch (error) {
      if (signal?.aborted) return;
      console.error("Error:", error);
      toast.error("Connection error");
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }

  async function approveReview(id: string) {
    const supabase = createClient();

    const { error } = await supabase
      .from("reviews")
      .update({ is_approved: true })
      .eq("id", id);

    if (error) {
      toast.error("Failed to approve review");
    } else {
      toast.success("Review approved");
      fetchReviews();
    }
  }

  async function toggleFeatured(id: string, featured: boolean) {
    const supabase = createClient();

    const { error } = await supabase
      .from("reviews")
      .update({ is_featured: !featured })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update review");
    } else {
      toast.success(featured ? "Removed from featured" : "Added to featured");
      fetchReviews();
    }
  }

  function deleteReview(id: string) {
    confirmToast("Are you sure you want to delete this review?", async () => {
      const supabase = createClient();

      const { error } = await supabase.from("reviews").delete().eq("id", id);

      if (error) {
        toast.error("Failed to delete review");
      } else {
        toast.success("Review deleted");
        fetchReviews();
      }
    });
  }

  const filteredReviews = reviews.filter((review) => {
    if (filter === "pending") return !review.is_approved;
    if (filter === "approved") return review.is_approved;
    return true;
  });

  const pendingCount = reviews.filter((r) => !r.is_approved).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-maroon"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">Reviews</h1>
          <p className="text-gray-500 mt-1">
            Manage customer reviews
            {pendingCount > 0 && (
              <span className="ml-2 text-orange-500">
                ({pendingCount} pending approval)
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {["all", "pending", "approved"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-maroon text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {filteredReviews.map((review) => (
          <div
            key={review.id}
            className={`bg-white rounded-xl shadow-sm border p-6 ${
              !review.is_approved ? "border-orange-200" : "border-gray-100"
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-start gap-4">
              {review.image && (
                <img
                  src={review.image}
                  alt={review.name}
                  className="h-16 w-16 rounded-full object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{review.name}</h3>
                      {review.is_featured && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-gold/20 text-amber-800 rounded-full">
                          Featured
                        </span>
                      )}
                      {!review.is_approved && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                          Pending
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!review.is_approved && (
                      <button
                        onClick={() => approveReview(review.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        title="Approve"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => toggleFeatured(review.id, review.is_featured)}
                      className={`p-2 rounded-lg ${
                        review.is_featured
                          ? "text-amber-600 bg-amber-50"
                          : "text-gray-500 hover:bg-gray-100"
                      }`}
                      title={review.is_featured ? "Remove from featured" : "Add to featured"}
                    >
                      <Star className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteReview(review.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 mt-3">{review.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredReviews.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
          <Star className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>No reviews found</p>
        </div>
      )}
    </div>
  );
}
