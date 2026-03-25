'use client'
import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { type Part } from '@/lib/supabase'

type Props = {
  part: Part
  paymentMethod: 'card' | 'cash_on_delivery' | 'whatsapp'
  onClose: () => void
}

export function OrderModal({ part, paymentMethod, onClose }: Props) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', notes: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const submit = async () => {
    if (!form.name || !form.phone || !form.address) {
      setError('Моля попълни всички задължителни полета.')
      return
    }
    setLoading(true)
    setError('')

    try {
      if (paymentMethod === 'card') {
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ partId: part.id, customerInfo: form }),
        })
        const { url } = await res.json()
        if (url) window.location.href = url
      } else {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            part_id: part.id,
            customer_name: form.name,
            customer_phone: form.phone,
            customer_email: form.email,
            customer_address: form.address,
            payment_method: 'cash_on_delivery',
            total: part.price,
            notes: form.notes,
          }),
        })
        if (res.ok) setDone(true)
        else setError('Грешка при изпращане. Опитай пак или ни пиши в WhatsApp.')
      }
    } catch (e) {
      setError('Грешка. Опитай пак.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-dark-800 border border-dark-600 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          <h2 className="font-display text-2xl font-bold uppercase">
            {paymentMethod === 'card' ? '💳 Поръчка с карта' : '📦 Наложен платеж'}
          </h2>
          <button onClick={onClose} className="text-gray-600 hover:text-white"><X size={22} /></button>
        </div>

        {done ? (
          <div className="p-8 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="font-display text-3xl font-bold mb-2">Поръчката е приета!</h3>
            <p className="text-gray-400 mb-6">Ще се свържем с теб на {form.phone} скоро.</p>
            <button onClick={onClose} className="btn-primary">Затвори</button>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <div className="bg-dark-900 rounded-xl p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold text-sm">{part.title}</p>
                <p className="text-gray-600 text-xs">{part.brand} {part.model}</p>
              </div>
              <span className="font-display text-2xl font-bold text-brand-500">{part.price} лв.</span>
            </div>

            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Имена *</label>
              <input className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Иван Иванов" />
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Телефон *</label>
              <input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+359 88 888 8888" type="tel" />
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Имейл</label>
              <input className="input" value={form.email} onChange={e => set('email', e.target.value)} placeholder="ivan@example.com" type="email" />
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Адрес за доставка *</label>
              <input className="input" value={form.address} onChange={e => set('address', e.target.value)} placeholder="гр. София, ул. Пример 1" />
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Забележки</label>
              <textarea className="input resize-none" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Допълнителна информация..." />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button onClick={submit} disabled={loading} className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2">
              {loading ? <><Loader2 size={18} className="animate-spin" /> Обработва се...</> : paymentMethod === 'card' ? 'Продължи към плащане →' : 'Потвърди поръчката'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
