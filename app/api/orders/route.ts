import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const body = await req.json()

  const { error } = await supabaseAdmin.from('orders').insert({
    part_id: body.part_id,
    customer_name: body.customer_name,
    customer_phone: body.customer_phone,
    customer_email: body.customer_email || null,
    customer_address: body.customer_address,
    payment_method: body.payment_method,
    total: body.total,
    notes: body.notes || null,
    status: 'pending',
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function GET(req: NextRequest) {
  // Protected — only for admin
  const auth = req.headers.get('x-admin-password')
  if (auth !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data } = await supabaseAdmin
    .from('orders')
    .select('*, parts(title, price)')
    .order('created_at', { ascending: false })

  return NextResponse.json(data)
}
