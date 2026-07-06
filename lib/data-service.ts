import { createClient as createServerClient } from "@/lib/supabase/server";
import { createBuildClient } from "@/lib/supabase/build-client";
import { unstable_cache } from "next/cache";
import type { DBProduct, DBCategory, DBReview, DBOrder, DBHomeConfig, DBEnquiry, Category } from "./database.types";

async function getSupabaseClient() {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return createBuildClient();
  }

  try {
    return await createServerClient();
  } catch {
    return createBuildClient();
  }
}

const CACHE_REVALIDATE = process.env.NODE_ENV === "development" ? 60 : 300;

// ============== PRODUCTS ==============

async function fetchProductsInternal(): Promise<DBProduct[]> {
  try {
    const supabase = await getSupabaseClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Error fetching products:", err);
    return [];
  }
}

export const getProducts = unstable_cache(
  fetchProductsInternal,
  ["products-list"],
  { revalidate: CACHE_REVALIDATE, tags: ["products"] }
);

async function fetchProductBySlugInternal(slug: string): Promise<DBProduct | null> {
  try {
    const supabase = await getSupabaseClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Error fetching product:", err);
    return null;
  }
}

export async function getProductBySlug(slug: string) {
  const cachedFn = unstable_cache(
    () => fetchProductBySlugInternal(slug),
    [`product-${slug}`],
    { revalidate: CACHE_REVALIDATE, tags: ["products", `product-${slug}`] }
  );
  return cachedFn();
}

export async function getProductsByCategory(category: Category): Promise<DBProduct[]> {
  try {
    const supabase = await getSupabaseClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("category", category)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Error fetching products by category:", err);
    return [];
  }
}

export async function getFeaturedProducts(): Promise<DBProduct[]> {
  try {
    const supabase = await getSupabaseClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_featured", true)
      .eq("is_active", true)
      .limit(8);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Error fetching featured products:", err);
    return [];
  }
}

// ============== CATEGORIES ==============

async function fetchCategoriesInternal(): Promise<DBCategory[]> {
  try {
    const supabase = await getSupabaseClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Error fetching categories:", err);
    return [];
  }
}

export const getCategories = unstable_cache(
  fetchCategoriesInternal,
  ["categories-list"],
  { revalidate: CACHE_REVALIDATE, tags: ["categories"] }
);

// ============== REVIEWS ==============

async function fetchReviewsInternal(): Promise<DBReview[]> {
  try {
    const supabase = await getSupabaseClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("is_approved", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Error fetching reviews:", err);
    return [];
  }
}

export const getReviews = unstable_cache(
  fetchReviewsInternal,
  ["reviews-list"],
  { revalidate: CACHE_REVALIDATE, tags: ["reviews"] }
);

export async function getFeaturedReviews(): Promise<DBReview[]> {
  try {
    const supabase = await getSupabaseClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("is_featured", true)
      .eq("is_approved", true)
      .limit(6);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Error fetching featured reviews:", err);
    return [];
  }
}

export async function getProductReviews(productId: string): Promise<DBReview[]> {
  try {
    const supabase = await getSupabaseClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .eq("is_approved", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Error fetching product reviews:", err);
    return [];
  }
}

// ============== ORDERS ==============

export async function createOrder(orderData: Omit<DBOrder, "id" | "created_at" | "updated_at">): Promise<DBOrder | null> {
  try {
    const supabase = await getSupabaseClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("orders")
      .insert(orderData)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Error creating order:", err);
    return null;
  }
}

export async function getOrderByNumber(orderNumber: string): Promise<DBOrder | null> {
  try {
    const supabase = await getSupabaseClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("order_number", orderNumber)
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Error fetching order:", err);
    return null;
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: DBOrder["order_status"]
): Promise<boolean> {
  try {
    const supabase = await getSupabaseClient();
    if (!supabase) return false;

    const { error } = await supabase
      .from("orders")
      .update({ order_status: status, updated_at: new Date().toISOString() })
      .eq("id", orderId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Error updating order status:", err);
    return false;
  }
}

// ============== HOME CONFIG ==============

export async function getHomeConfig(section: string): Promise<DBHomeConfig | null> {
  try {
    const supabase = await getSupabaseClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("home_config")
      .select("*")
      .eq("section", section)
      .eq("is_active", true)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  } catch (err) {
    console.error("Error fetching home config:", err);
    return null;
  }
}

export async function updateHomeConfig(section: string, config: Record<string, unknown>): Promise<boolean> {
  try {
    const supabase = await getSupabaseClient();
    if (!supabase) return false;

    const { error } = await supabase
      .from("home_config")
      .upsert({
        section,
        config,
        is_active: true,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Error updating home config:", err);
    return false;
  }
}

// ============== ENQUIRIES ==============

export async function createEnquiry(enquiryData: Omit<DBEnquiry, "id" | "created_at" | "status">): Promise<DBEnquiry | null> {
  try {
    const supabase = await getSupabaseClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("enquiries")
      .insert({ ...enquiryData, status: "new" })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Error creating enquiry:", err);
    return null;
  }
}
