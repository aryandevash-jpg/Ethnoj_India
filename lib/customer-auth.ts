import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { DBUserProfile, DBUserAddress, DBWishlistItem } from './database.types'

export async function getCustomer() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  return user
}

export async function getCustomerProfile(): Promise<DBUserProfile | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  return profile
}

export async function requireCustomer() {
  const user = await getCustomer()
  
  if (!user) {
    redirect('/auth/login')
  }
  
  return user
}

export async function getCustomerAddresses(): Promise<DBUserAddress[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []
  
  const { data: addresses } = await supabase
    .from('user_addresses')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false })
  
  return addresses || []
}

export async function getCustomerWishlist(): Promise<DBWishlistItem[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []
  
  const { data: wishlist } = await supabase
    .from('wishlist')
    .select(`
      *,
      product:products(*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  
  return wishlist || []
}

export async function getCustomerOrders() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []
  
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .or(`user_id.eq.${user.id},customer_email.eq.${user.email}`)
    .order('created_at', { ascending: false })
  
  return orders || []
}

export async function signOutCustomer() {
  const supabase = await createClient()
  await supabase.auth.signOut()
}
