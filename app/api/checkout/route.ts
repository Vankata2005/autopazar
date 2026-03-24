import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const { partId, customerInfo } = await req.json()

  const { data: part } = await supabase.from('parts').select('*').eq('id', partId).single()
  if (!part) return NextResponse.json({ error: 'Part not found' }, { status: 404 })

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'bgn',
        product_data: {
          name: part.title,
          description: `${part.brand} ${part.model} · ${part.condition}`,
          images: part.images?.[0] ? [part.images[0]] : [],
        },
        unit_amount: Math.round(part.price * 100),
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/parts/${partId}`,
    customer_email: customerInfo.email || undefined,
    metadata: {
      part_id: partId,
      customer_name: customerInfo.name,
      customer_phone: customerInfo.phone,
      customer_address: customerInfo.address,
      notes: customerInfo.notes || '',
    },
    shipping_address_collection: { allowed_countries: ['BG'] },
  })

  return NextResponse.json({ url: session.url })
}
