import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET all coupons (admin)
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: coupons, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ coupons })
  } catch {
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}

// POST create new coupon (admin)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const {
      code,
      description,
      discount_type,
      discount_value,
      max_discount,
      min_order_value,
      usage_limit,
      usage_limit_per_user,
      starts_at,
      expires_at,
      is_active,
    } = body

    if (!code || !discount_type) {
      return NextResponse.json(
        { error: 'Code and discount type are required' },
        { status: 400 }
      )
    }

    const { data: coupon, error } = await supabase
      .from('coupons')
      .insert({
        code: code.toUpperCase().trim(),
        description,
        discount_type,
        discount_value: discount_value || 0,
        max_discount: max_discount || null,
        min_order_value: min_order_value || 0,
        usage_limit: usage_limit || null,
        usage_limit_per_user: usage_limit_per_user ?? 1,
        starts_at: starts_at || new Date().toISOString(),
        expires_at: expires_at || null,
        is_active: is_active ?? true,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A coupon with this code already exists' },
          { status: 400 }
        )
      }
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, coupon })
  } catch {
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}
