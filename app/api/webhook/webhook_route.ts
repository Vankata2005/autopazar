import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const meta = session.metadata!

    await supabaseAdmin.from('orders').insert({
      part_id: meta.part_id,
      customer_name: meta.customer_name,
      customer_phone: meta.customer_phone,
      customer_email: session.customer_email,
      customer_address: meta.customer_address || '',
      payment_method: 'card',
      status: 'confirmed',
      total: (session.amount_total || 0) / 100,
      notes: meta.notes || null,
      stripe_session_id: session.id,
    })
  }

  return NextResponse.json({ received: true })
}
