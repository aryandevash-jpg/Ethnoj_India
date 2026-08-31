import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET single coupon
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ coupon })
  } catch {
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}

// PUT update coupon
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const body = await request.json()

    const updates: Record<string, unknown> = {}
    const allowedFields = [
      'code',
      'description',
      'discount_type',
      'discount_value',
      'max_discount',
      'min_order_value',
      'usage_limit',
      'usage_limit_per_user',
      'starts_at',
      'expires_at',
      'is_active',
    ]

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'code') {
          updates[field] = body[field].toUpperCase().trim()
        } else {
          updates[field] = body[field]
        }
      }
    }

    const { data: coupon, error } = await supabase
      .from('coupons')
      .update(updates)
      .eq('id', id)
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

// DELETE coupon
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}
