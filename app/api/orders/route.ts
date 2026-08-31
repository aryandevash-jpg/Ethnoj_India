import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function generateOrderNumber(): string {
  const prefix = "ETH";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = searchParams.get("limit");

    let query = supabase
      .from("orders")
      .select("*")
      .or(`user_id.eq.${user.id},customer_email.eq.${user.email}`);

    if (status) {
      query = query.eq("order_status", status);
    }

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      customer_name,
      customer_phone,
      shipping_address,
      items,
      subtotal,
      shipping,
      discount,
      total,
      coupon_code,
      coupon_discount,
      payment_method,
    } = body;

    if (!customer_name || !customer_phone || !shipping_address || !items?.length) {
      return NextResponse.json(
        { success: false, error: "Missing order details" },
        { status: 400 }
      );
    }

    if (!shipping_address.line1 || !shipping_address.city || !shipping_address.state || !shipping_address.pincode) {
      return NextResponse.json(
        { success: false, error: "Incomplete shipping address" },
        { status: 400 }
      );
    }

    const orderData = {
      user_id: user.id,
      customer_name,
      customer_email: user.email,
      customer_phone,
      shipping_address,
      items,
      subtotal: Number(subtotal) || 0,
      shipping: Number(shipping) || 0,
      discount: Number(discount) || 0,
      total: Number(total) || 0,
      coupon_code: coupon_code || null,
      coupon_discount: Number(coupon_discount) || 0,
      order_number: generateOrderNumber(),
      payment_status: "pending",
      order_status: "pending",
      payment_method: payment_method || "razorpay",
    };

    const { data, error } = await supabase
      .from("orders")
      .insert(orderData)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create order" },
      { status: 500 }
    );
  }
}
