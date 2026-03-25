'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase, type Part } from '@/lib/supabase'
import { Plus, Edit2, Trash2, Eye, EyeOff, LogOut, Package, ShoppingBag, Loader2, Upload } from 'lucide-react'

const CATEGORIES = ['dvigatel','hodova','osvetlenie','gumi','karoseriya','elektrika','klimatichna','interior']
const CAT_LABELS: Record<string,string> = {
  dvigatel:'Двигател', hodova:'Ходова', osvetlenie:'Осветление', gumi:'Гуми & Джанти',
  karoseriya:'Каросерия', elektrika:'Електрика', klimatichna:'Климатична', interior:'Интериор'
}

const emptyForm = {
  title: '', description: '', price: '', original_price: '', category: 'dvigatel',
  brand: '', model: '', year_from: '', year_to: '', condition: 'употребяван' as Part['condition'],
  part_number: '', in_stock: true, images: [] as string[],
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [tab, setTab] = useState<'parts' | 'orders'>('parts')
  const [parts, setParts] = useState<Part[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const login = () => {
    // Simple client-side check (real check is on API)
    fetch('/api/orders', { headers: { 'x-admin-password': pw } }).then(r => {
      if (r.ok) { setAuthed(true); localStorage.setItem('ap', pw) }
      else alert('Грешна парола')
    })
  }

  useEffect(() => {
    const saved = localStorage.getItem('ap')
    if (saved) { setPw(saved); setAuthed(true) }
  }, [])

  useEffect(() => {
    if (!authed) return
    supabase.from('parts').select('*').order('created_at', { ascending: false }).then(({ data }) => setParts(data || []))
    fetch('/api/orders', { headers: { 'x-admin-password': pw } }).then(r => r.json()).then(setOrders)
  }, [authed])

  const uploadImages = async (files: FileList) => {
    setUploading(true)
    const urls: string[] = []
    for (const file of Array.from(files)) {
      const name = `${Date.now()}-${file.name.replace(/\s/g, '_')}`
      const { error } = await supabase.storage.from('parts').upload(name, file)
      if (!error) {
        const { data } = supabase.storage.from('parts').getPublicUrl(name)
        urls.push(data.publicUrl)
      }
    }
    setForm(f => ({ ...f, images: [...f.images, ...urls] }))
    setUploading(false)
  }

  const save = async () => {
    setLoading(true)
    const payload = {
      ...form,
      price: parseFloat(form.price),
      original_price: form.original_price ? parseFloat(form.original_price) : null,
      year_from: form.year_from ? parseInt(form.year_from) : null,
      year_to: form.year_to ? parseInt(form.year_to) : null,
    }
    if (editing) {
      await supabase.from('parts').update(payload).eq('id', editing)
    } else {
      await supabase.from('parts').insert(payload)
    }
    const { data } = await supabase.from('parts').select('*').order('created_at', { ascending: false })
    setParts(data || [])
    setForm(emptyForm); setEditing(null); setShowForm(false); setLoading(false)
  }

  const deletePart = async (id: string) => {
    if (!confirm('Изтриване на частта?')) return
    await supabase.from('parts').delete().eq('id', id)
    setParts(p => p.filter(x => x.id !== id))
  }

  const editPart = (p: Part) => {
    setForm({
      title: p.title,
      description: p.description,
      price: String(p.price),
      original_price: String(p.original_price || ''),
      category: p.category,
      brand: p.brand,
      model: p.model,
      year_from: String(p.year_from || ''),
      year_to: String(p.year_to || ''),
      condition: p.condition,
      in_stock: p.in_stock,
      images: p.images || [],
      part_number: p.part_number || '',
    })
    setEditing(p.id); setShowForm(true)
  }

  const toggleStock = async (p: Part) => {
    await supabase.from('parts').update({ in_stock: !p.in_stock }).eq('id', p.id)
    setParts(ps => ps.map(x => x.id === p.id ? { ...x, in_stock: !x.in_stock } : x))
  }

  const updateOrderStatus = async (id: string, status: string) => {
    await fetch(`/api/orders`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'x-admin-password': pw }, body: JSON.stringify({ id, status }) })
    setOrders(o => o.map(x => x.id === id ? { ...x, status } : x))
  }

  if (!authed) return (
    <div className="grain min-h-screen flex items-center justify-center bg-dark-900">
      <div className="bg-dark-800 border border-dark-600 rounded-2xl p-8 w-full max-w-sm">
        <h1 className="font-display text-3xl font-bold uppercase mb-6 text-center">Администратор</h1>
        <input type="password" value={pw} onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && login()}
          placeholder="Парола" className="input mb-4" />
        <button onClick={login} className="btn-primary w-full">Влез</button>
      </div>
    </div>
  )

  const statusColors: Record<string,string> = {
    pending: 'bg-yellow-900/50 text-yellow-400',
    confirmed: 'bg-blue-900/50 text-blue-400',
    shipped: 'bg-purple-900/50 text-purple-400',
    delivered: 'bg-green-900/50 text-green-400',
    cancelled: 'bg-red-900/50 text-red-400',
  }
  const statusLabels: Record<string,string> = {
    pending:'Нова', confirmed:'Потвърдена', shipped:'Изпратена', delivered:'Доставена', cancelled:'Анулирана'
  }

  return (
    <div className="grain min-h-screen bg-dark-900 text-white">
      {/* Header */}
      <div className="bg-dark-800 border-b border-dark-700 px-6 py-4 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold uppercase">АвтоПазар — Администрация</h1>
        <div className="flex items-center gap-4">
          <a href="/" target="_blank" className="text-gray-500 hover:text-white text-sm">← Сайт</a>
          <button onClick={() => { localStorage.removeItem('ap'); setAuthed(false) }} className="text-gray-500 hover:text-red-400">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Общо части', value: parts.length, icon: <Package size={20} /> },
            { label: 'На склад', value: parts.filter(p => p.in_stock).length, icon: <Eye size={20} /> },
            { label: 'Поръчки', value: orders.length, icon: <ShoppingBag size={20} /> },
            { label: 'Нови поръчки', value: orders.filter(o => o.status === 'pending').length, icon: <Plus size={20} /> },
          ].map(s => (
            <div key={s.label} className="bg-dark-800 border border-dark-600 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">{s.icon}{s.label}</div>
              <div className="font-display text-4xl font-bold">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['parts', 'orders'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all ${tab === t ? 'bg-brand-500 text-white' : 'bg-dark-800 text-gray-400 hover:text-white border border-dark-600'}`}>
              {t === 'parts' ? 'Части' : 'Поръчки'}
            </button>
          ))}
          {tab === 'parts' && (
            <button onClick={() => { setForm(emptyForm); setEditing(null); setShowForm(true) }}
              className="ml-auto btn-primary flex items-center gap-2">
              <Plus size={16} /> Нова част
            </button>
          )}
        </div>

        {/* Parts tab */}
        {tab === 'parts' && (
          <>
            {showForm && (
              <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6 mb-6">
                <h2 className="font-display text-2xl font-bold uppercase mb-5">{editing ? 'Редактирай' : 'Нова'} Част</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-xs text-gray-500 uppercase mb-1 block">Заглавие *</label>
                    <input className="input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="BMW N47 Двигател 2.0d 143кс" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase mb-1 block">Цена (лв.) *</label>
                    <input className="input" type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="1200" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase mb-1 block">Стара цена (лв.)</label>
                    <input className="input" type="number" value={form.original_price} onChange={e => set('original_price', e.target.value)} placeholder="1500" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase mb-1 block">Марка</label>
                    <input className="input" value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="BMW" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase mb-1 block">Модел</label>
                    <input className="input" value={form.model} onChange={e => set('model', e.target.value)} placeholder="E90" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase mb-1 block">Година от</label>
                    <input className="input" type="number" value={form.year_from} onChange={e => set('year_from', e.target.value)} placeholder="2008" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase mb-1 block">Година до</label>
                    <input className="input" type="number" value={form.year_to} onChange={e => set('year_to', e.target.value)} placeholder="2012" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase mb-1 block">Категория</label>
                    <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase mb-1 block">Състояние</label>
                    <select className="input" value={form.condition} onChange={e => set('condition', e.target.value as any)}>
                      <option value="нов">Нов</option>
                      <option value="употребяван">Употребяван</option>
                      <option value="преработен">Преработен</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase mb-1 block">Номер на частта</label>
                    <input className="input" value={form.part_number} onChange={e => set('part_number', e.target.value)} placeholder="N47D20A" />
                  </div>
                  <div className="flex items-center gap-3 mt-4">
                    <input type="checkbox" id="instock" checked={form.in_stock} onChange={e => set('in_stock', e.target.checked)} className="w-4 h-4 accent-brand-500" />
                    <label htmlFor="instock" className="text-sm text-gray-300">На склад</label>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-gray-500 uppercase mb-1 block">Описание</label>
                    <textarea className="input resize-none" rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Детайлно описание на частта..." />
                  </div>
                  {/* Image upload */}
                  <div className="md:col-span-2">
                    <label className="text-xs text-gray-500 uppercase mb-2 block">Снимки</label>
                    <div className="flex flex-wrap gap-3 mb-3">
                      {form.images.map((img, i) => (
                        <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-dark-500 group">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          <button onClick={() => set('images', form.images.filter((_: string, j: number) => j !== i))}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-400 text-xl">✕</button>
                        </div>
                      ))}
                      <button onClick={() => fileRef.current?.click()}
                        className="w-20 h-20 rounded-lg border-2 border-dashed border-dark-500 hover:border-brand-500 flex items-center justify-center text-gray-600 hover:text-brand-500 transition-all">
                        {uploading ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
                      </button>
                    </div>
                    <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={e => e.target.files && uploadImages(e.target.files)} />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={save} disabled={loading} className="btn-primary flex items-center gap-2">
                    {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                    {editing ? 'Запази' : 'Добави'}
                  </button>
                  <button onClick={() => { setShowForm(false); setEditing(null) }} className="btn-ghost">Откажи</button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {parts.map(p => (
                <div key={p.id} className="bg-dark-800 border border-dark-700 rounded-xl p-4 flex items-center gap-4">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt="" className="w-16 h-12 object-cover rounded-lg flex-shrink-0" />
                  ) : (
                    <div className="w-16 h-12 bg-dark-700 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">⚙️</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{p.title}</p>
                    <p className="text-gray-600 text-xs">{p.brand} {p.model} · {CAT_LABELS[p.category] || p.category}</p>
                  </div>
                  <div className="font-display text-xl font-bold text-brand-500 flex-shrink-0">{p.price} лв.</div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleStock(p)} title={p.in_stock ? 'Скрий' : 'Покажи'}
                      className={`p-2 rounded-lg transition-colors ${p.in_stock ? 'text-green-400 hover:bg-green-900/30' : 'text-gray-600 hover:bg-dark-700'}`}>
                      {p.in_stock ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button onClick={() => editPart(p)} className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-dark-700"><Edit2 size={16} /></button>
                    <a href={`/parts/${p.id}`} target="_blank" className="p-2 rounded-lg text-gray-500 hover:text-brand-500 hover:bg-dark-700"><Package size={16} /></a>
                    <button onClick={() => deletePart(p.id)} className="p-2 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-900/20"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Orders tab */}
        {tab === 'orders' && (
          <div className="space-y-3">
            {orders.length === 0 ? (
              <div className="text-center py-20 text-gray-600">Все още няма поръчки</div>
            ) : orders.map((o: any) => (
              <div key={o.id} className="bg-dark-800 border border-dark-700 rounded-xl p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="font-semibold">{o.customer_name}</p>
                    <p className="text-gray-500 text-sm">{o.customer_phone}{o.customer_email && ` · ${o.customer_email}`}</p>
                    <p className="text-gray-600 text-xs mt-1">{o.customer_address}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-display text-2xl font-bold text-brand-500">{o.total} лв.</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {o.payment_method === 'card' ? '💳 Карта' : '📦 Наложен'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`badge ${statusColors[o.status]}`}>{statusLabels[o.status]}</span>
                  <select value={o.status}
                    onChange={e => updateOrderStatus(o.id, e.target.value)}
                    className="text-xs bg-dark-700 border border-dark-500 rounded-lg px-2 py-1 text-gray-300 outline-none">
                    {Object.entries(statusLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                  <span className="text-xs text-gray-600 ml-auto">{new Date(o.created_at).toLocaleString('bg-BG')}</span>
                </div>
                {o.notes && <p className="text-gray-500 text-xs mt-2 italic">"{o.notes}"</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
