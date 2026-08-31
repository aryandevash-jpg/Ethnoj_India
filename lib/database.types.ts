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
  category: string;
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
  user_id?: string;
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
  coupon_code?: string;
  coupon_discount?: number;
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

export interface DBUserProfile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  date_of_birth?: string;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  email_verified: boolean;
  phone_verified: boolean;
  marketing_consent: boolean;
  created_at: string;
  updated_at: string;
}

export interface DBUserAddress {
  id: string;
  user_id: string;
  label: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface DBWishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: DBProduct;
}

export type CouponDiscountType = 'flat' | 'percentage' | 'free_shipping';

export interface DBCoupon {
  id: string;
  code: string;
  description?: string | null;
  discount_type: CouponDiscountType;
  discount_value: number;
  max_discount?: number | null;
  min_order_value: number;
  usage_limit?: number | null;
  usage_limit_per_user?: number | null;
  times_used: number;
  starts_at: string;
  expires_at?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DBCouponUsage {
  id: string;
  coupon_id: string;
  user_id?: string;
  order_id?: string;
  user_email?: string;
  discount_amount: number;
  used_at: string;
}

export interface CouponValidationResult {
  valid: boolean;
  coupon_id?: string;
  discount_type?: CouponDiscountType;
  discount_value?: number;
  max_discount?: number;
  calculated_discount?: number;
  free_shipping?: boolean;
  message: string;
}
