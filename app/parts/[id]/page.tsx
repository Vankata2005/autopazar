'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase, type Part } from '@/lib/supabase'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Phone, MessageCircle, CreditCard, Truck, Shield } from 'lucide-react'
import { OrderModal } from '@/components/OrderModal'

export default function PartPage() {
  const { id } = useParams()
  const [part, setPart] = useState<Part | null>(null)
  const [imgIdx, setImgIdx] = useState(0)
  const [orderOpen, setOrderOpen] = useState(false)
  const [payMethod, setPayMethod] = useState<'card' | 'cash_on_delivery' | 'whatsapp'>('card')

  useEffect(() => {
    supabase.from('parts').select('*').eq('id', id).single().then(({ data }) => {
      if (data) setPart(data)
    })
  }, [id])

  if (!part) return (
    <div className="grain min-h-screen flex items-center justify-center">
      <Navbar />
      <div className="animate-pulse text-gray-600">Зарежда се...</div>
    </div>
  )

  const images = part.images?.length ? part.images : ['https://placehold.co/800x600/1a1a1a/555?text=Без+снимка']
  const whatsappUrl = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=Здравейте, интересувам се от: ${part.title} (${part.price} лв.) — ${typeof window !== 'undefined' ? window.location.href : ''}`

  const conditionColor: Record<string, string> = {
    'нов': 'bg-green-900/50 text-green-400 border-green-800',
    'употребяван': 'bg-yellow-900/50 text-yellow-400 border-yellow-800',
    'преработен': 'bg-blue-900/50 text-blue-400 border-blue-800',
  }

  return (
    <div className="grain min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-16">
        {/* Back */}
        <a href="/parts" className="inline-flex items-center gap-1 text-gray-500 hover:text-white mb-6 text-sm transition-colors">
          <ChevronLeft size={16} /> Назад към каталога
        </a>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Images */}
          <div>
            <div className="relative aspect-[4/3] bg-dark-800 rounded-2xl overflow-hidden border border-dark-600 mb-3">
              <Image
                src={images[imgIdx]}
                alt={part.title}
                fill
                className="object-cover"
              />
              {images.length > 1 && (
                <>
                  <button onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 rounded-full p-2">
                    <ChevronLeft size={20} />
                  </button>
                  <button onClick={() => setImgIdx(i => (i + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 rounded-full p-2">
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${i === imgIdx ? 'border-brand-500' : 'border-dark-600'}`}>
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className={`badge border ${conditionColor[part.condition] || 'bg-dark-700 text-gray-400 border-dark-500'}`}>
                {part.condition}
              </span>
              {!part.in_stock && <span className="badge bg-red-900/50 text-red-400 border border-red-800">Изчерпан</span>}
            </div>

            <h1 className="font-display text-4xl font-bold uppercase leading-tight mb-2">{part.title}</h1>

            <p className="text-gray-500 text-sm mb-4">
              {part.brand} {part.model}
              {part.year_from && ` · ${part.year_from}${part.year_to ? '–' + part.year_to : '+'}`}
              {part.part_number && ` · №${part.part_number}`}
            </p>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-display text-5xl font-bold text-brand-500">{part.price} лв.</span>
              {part.original_price && (
                <span className="text-gray-600 line-through text-xl">{part.original_price} лв.</span>
              )}
            </div>

            <p className="text-gray-400 leading-relaxed mb-8">{part.description}</p>

            {/* Payment method selector */}
            <p className="text-xs text-gray-600 uppercase tracking-wider mb-3 font-semibold">Начин на поръчка</p>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {[
                { value: 'card', icon: <CreditCard size={18} />, label: 'Карта' },
                { value: 'cash_on_delivery', icon: <Truck size={18} />, label: 'Наложен платеж' },
                { value: 'whatsapp', icon: <MessageCircle size={18} />, label: 'WhatsApp' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setPayMethod(opt.value as any)}
                  className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-xs font-semibold transition-all ${payMethod === opt.value
                    ? 'border-brand-500 bg-brand-500/10 text-brand-400'
                    : 'border-dark-500 text-gray-500 hover:border-dark-400'}`}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Action button */}
            {payMethod === 'whatsapp' ? (
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition-all text-lg">
                <MessageCircle size={22} /> Пиши в WhatsApp
              </a>
            ) : (
              <button
                disabled={!part.in_stock}
                onClick={() => setOrderOpen(true)}
                className="btn-primary w-full py-4 text-lg disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {part.in_stock ? (payMethod === 'card' ? '💳 Поръчай с карта' : '📦 Поръчай с наложен платеж') : 'Изчерпан'}
              </button>
            )}

            {/* Trust */}
            <div className="flex gap-4 mt-5 text-xs text-gray-600">
              <span className="flex items-center gap-1.5"><Shield size={13} className="text-brand-500" /> Гаранция за качество</span>
              <span className="flex items-center gap-1.5"><Truck size={13} className="text-brand-500" /> Доставка 1–3 дни</span>
            </div>
          </div>
        </div>
      </div>

      {orderOpen && (
        <OrderModal
          part={part}
          paymentMethod={payMethod}
          onClose={() => setOrderOpen(false)}
        />
      )}

      <Footer />
    </div>
  )
}
