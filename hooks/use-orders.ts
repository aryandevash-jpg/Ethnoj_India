"use client";

import { createClient } from "@/lib/supabase/client";
import type { DBOrder, OrderItem } from "@/lib/database.types";

interface CreateOrderData {
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
  payment_method?: string;
}

function generateOrderNumber(): string {
  const prefix = "ETH";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export async function createOrder(orderData: CreateOrderData): Promise<DBOrder | null> {
  const supabase = createClient();
  if (!supabase) {
    console.error("Database not configured");
    return null;
  }

  // Get current user for user_id
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("orders")
    .insert({
      ...orderData,
      user_id: user?.id || null,
      order_number: generateOrderNumber(),
      payment_status: "pending",
      order_status: "pending",
      payment_method: orderData.payment_method || "razorpay",
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating order:", error);
    return null;
  }
  return data;
}

export async function getOrderByNumber(orderNumber: string): Promise<DBOrder | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("order_number", orderNumber)
    .single();

  if (error) {
    console.error("Error fetching order:", error);
    return null;
  }

  return data;
}

export async function updatePaymentStatus(
  orderId: string,
  paymentStatus: "paid" | "failed",
  paymentId?: string
): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;

  const { error } = await supabase
    .from("orders")
    .update({
      payment_status: paymentStatus,
      payment_id: paymentId,
      order_status: paymentStatus === "paid" ? "confirmed" : "pending",
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) {
    console.error("Error updating payment status:", error);
    return false;
  }

  return true;
}
