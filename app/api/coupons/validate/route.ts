import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { CouponValidationResult, DBCoupon } from '@/lib/database.types'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { code, orderTotal, userEmail } = await request.json()

    if (!code) {
      return NextResponse.json(
        { valid: false, message: 'Coupon code is required' },
        { status: 400 }
      )
    }

    // Get the current user if logged in
    const { data: { user } } = await supabase.auth.getUser()

    // Find the coupon
    const { data: coupon, error: couponError } = await supabase
      .from('coupons')
      .select('*')
      .ilike('code', code.trim())
      .eq('is_active', true)
      .single()

    if (couponError || !coupon) {
      const result: CouponValidationResult = {
        valid: false,
        message: 'Invalid coupon code',
      }
      return NextResponse.json(result)
    }

    const c = coupon as DBCoupon
    const now = new Date()

    // Check if coupon has started
    if (new Date(c.starts_at) > now) {
      const result: CouponValidationResult = {
        valid: false,
        message: 'This coupon is not yet active',
      }
      return NextResponse.json(result)
    }

    // Check if coupon has expired
    if (c.expires_at && new Date(c.expires_at) < now) {
      const result: CouponValidationResult = {
        valid: false,
        message: 'This coupon has expired',
      }
      return NextResponse.json(result)
    }

    // Check minimum order value
    if (orderTotal < c.min_order_value) {
      const result: CouponValidationResult = {
        valid: false,
        message: `Minimum order value of ₹${c.min_order_value.toLocaleString()} required`,
      }
      return NextResponse.json(result)
    }

    // Check total usage limit
    if (c.usage_limit != null && c.times_used >= c.usage_limit) {
      const result: CouponValidationResult = {
        valid: false,
        message: 'This coupon has reached its usage limit',
      }
      return NextResponse.json(result)
    }

    // Check per-user usage limit
    if (c.usage_limit_per_user != null) {
      const email = user?.email || userEmail
      
      if (email || user) {
        const { count } = await supabase
          .from('coupon_usage')
          .select('*', { count: 'exact', head: true })
          .eq('coupon_id', c.id)
          .or(
            user 
              ? `user_id.eq.${user.id},user_email.eq.${email || ''}`
              : `user_email.eq.${email}`
          )

        if (count !== null && count >= c.usage_limit_per_user) {
          const result: CouponValidationResult = {
            valid: false,
            message: 'You have already used this coupon',
          }
          return NextResponse.json(result)
        }
      }
    }

    // Calculate discount
    let calculatedDiscount = 0
    let freeShipping = false

    switch (c.discount_type) {
      case 'flat':
        calculatedDiscount = Math.min(c.discount_value, orderTotal)
        break
      case 'percentage':
        calculatedDiscount = (orderTotal * c.discount_value) / 100
        if (c.max_discount) {
          calculatedDiscount = Math.min(calculatedDiscount, c.max_discount)
        }
        break
      case 'free_shipping':
        freeShipping = true
        calculatedDiscount = 0
        break
    }

    const result: CouponValidationResult = {
      valid: true,
      coupon_id: c.id,
      discount_type: c.discount_type,
      discount_value: c.discount_value,
      max_discount: c.max_discount ?? undefined,
      calculated_discount: Math.round(calculatedDiscount * 100) / 100,
      free_shipping: freeShipping,
      message: freeShipping 
        ? 'Free shipping applied!' 
        : `You save ₹${Math.round(calculatedDiscount).toLocaleString()}!`,
    }

    return NextResponse.json(result)
  } catch {
    return NextResponse.json(
      { valid: false, message: 'An error occurred while validating coupon' },
      { status: 500 }
    )
  }
}
