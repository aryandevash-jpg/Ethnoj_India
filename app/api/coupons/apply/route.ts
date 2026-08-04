import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Record coupon usage after successful order
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { couponId, orderId, userEmail, discountAmount } = await request.json()

    if (!couponId || !discountAmount) {
      return NextResponse.json(
        { error: 'Coupon ID and discount amount are required' },
        { status: 400 }
      )
    }

    // Get the current user if logged in
    const { data: { user } } = await supabase.auth.getUser()

    // Insert usage record
    const { error: usageError } = await supabase
      .from('coupon_usage')
      .insert({
        coupon_id: couponId,
        user_id: user?.id || null,
        user_email: userEmail || user?.email || null,
        order_id: orderId || null,
        discount_amount: discountAmount,
      })

    if (usageError) {
      console.error('Error recording coupon usage:', usageError)
    }

    // Increment times_used counter
    const { error: updateError } = await supabase
      .rpc('increment_coupon_usage', { coupon_id: couponId })
      .single()

    // Fallback if RPC doesn't exist
    if (updateError) {
      await supabase
        .from('coupons')
        .update({ times_used: supabase.rpc('increment', { x: 1 }) })
        .eq('id', couponId)
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}
