import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";

async function recordCouponUsage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  couponCode: string,
  orderId: string,
  userId: string | null,
  userEmail: string | null,
  discountAmount: number
) {
  const { data: coupon } = await supabase
    .from("coupons")
    .select("id, times_used")
    .eq("code", couponCode)
    .maybeSingle();

  if (!coupon) return;

  await supabase.from("coupon_usage").insert({
    coupon_id: coupon.id,
    user_id: userId,
    user_email: userEmail,
    order_id: orderId,
    discount_amount: discountAmount,
  });

  await supabase
    .from("coupons")
    .update({ times_used: (coupon.times_used || 0) + 1 })
    .eq("id", coupon.id);
}

export async function POST(request: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_id,
    } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing payment details" },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json(
        { error: "Payment gateway is not configured" },
        { status: 503 }
      );
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    if (order_id) {
      const supabase = await createClient();
      const { data: order, error: updateError } = await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          order_status: "confirmed",
          payment_id: razorpay_payment_id,
          payment_method: "razorpay",
          updated_at: new Date().toISOString(),
        })
        .eq("id", order_id)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating order after payment:", updateError);
      } else if (order?.coupon_code) {
        await recordCouponUsage(
          supabase,
          order.coupon_code,
          order.id,
          order.user_id || null,
          order.customer_email || null,
          Number(order.coupon_discount)
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 }
    );
  }
}
