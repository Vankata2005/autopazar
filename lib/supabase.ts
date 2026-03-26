import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('NEXT_PUBLIC_SUPABASE_URL =', supabaseUrl)
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY exists =', !!supabaseAnonKey)
console.log('SUPABASE_SERVICE_ROLE_KEY exists =', !!serviceRoleKey)

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is missing')
}

if (!supabaseAnonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is missing')
}

if (!serviceRoleKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

export type Part = {
  id: string
  title: string
  description: string
  price: number
  original_price?: number
  category: string
  brand: string
  model: string
  year_from?: number
  year_to?: number
  condition: 'нов' | 'употребяван' | 'преработен'
  images: string[]
  in_stock: boolean
  part_number?: string
  created_at: string
}

export type Order = {
  id: string
  part_id: string
  customer_name: string
  customer_phone: string
  customer_email?: string
  customer_address?: string
  payment_method: 'card' | 'cash_on_delivery' | 'whatsapp'
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  notes?: string
  created_at: string
}
