import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .or(`user_id.eq.${user.id},customer_email.eq.${user.email}`)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ orders })
  } catch {
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}
