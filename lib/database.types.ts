export type Category =
  | "co-ord-sets"
  | "kurtis"
  | "ladies-suits"
  | "sarees"
  | "lehengas";

export interface DBProduct {
  id: string;
  name: string;
  slug: string;
  category: Category;
  price: number;
  mrp?: number;
  image: string;
  hover_image?: string;
  video_url?: string;
  images?: string[];
  colors: string[];
  sizes: string[];
  description: string;
  short_description?: string;
  is_featured: boolean;
  is_active: boolean;
  rating: number;
  reviews_count: number;
  stock: number;
  sku?: string;
  created_at: string;
  updated_at: string;
}

export interface DBCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image: string;
  video_url?: string;
  tagline?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DBReview {
  id: string;
  product_id?: string;
  name: string;
  email?: string;
  rating: number;
  text: string;
  image?: string;
  is_approved: boolean;
  is_featured: boolean;
  created_at: string;
}

export interface DBOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  payment_status: "pending" | "paid" | "failed" | "refunded";
  order_status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  payment_id?: string;
  payment_method?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  product_image: string;
  size: string;
  color?: string;
  quantity: number;
  price: number;
}

export interface DBHomeConfig {
  id: string;
  section: string;
  config: Record<string, unknown>;
  is_active: boolean;
  updated_at: string;
}

export interface DBEnquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  product_id?: string;
  status: "new" | "contacted" | "resolved";
  created_at: string;
}

export interface DBAdmin {
  id: string;
  email: string;
  name: string;
  role: "admin" | "super_admin";
  is_active: boolean;
  created_at: string;
  last_login?: string;
}
