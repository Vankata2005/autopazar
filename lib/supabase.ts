import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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
