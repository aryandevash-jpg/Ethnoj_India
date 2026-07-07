"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { DBProduct, Category } from "@/lib/database.types";
import { isUuid } from "@/lib/utils";

export function useProducts(options?: {
  category?: Category;
  featured?: boolean;
  limit?: number;
}) {
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      const supabase = createClient();

      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        let query = supabase.from("products").select("*").eq("is_active", true);

        if (options?.category) {
          query = query.eq("category", options.category);
        }

        if (options?.featured) {
          query = query.eq("is_featured", true);
        }

        if (options?.limit) {
          query = query.limit(options.limit);
        }

        query = query.order("created_at", { ascending: false });

        const { data, error } = await query;

        if (error) throw error;
        setProducts(data || []);
      } catch (err) {
        setError(err as Error);
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [options?.category, options?.featured, options?.limit]);

  return { products, loading, error };
}

export function useProduct(id: string) {
  const [product, setProduct] = useState<DBProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      if (!id) {
        setLoading(false);
        return;
      }

      const supabase = createClient();

      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        const query = isUuid(id)
          ? supabase.from("products").select("*").eq("id", id)
          : supabase.from("products").select("*").eq("slug", id);

        const { data, error } = await query.single();

        if (error) throw error;
        setProduct(data);
      } catch (err) {
        setError(err as Error);
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  return { product, loading, error };
}
