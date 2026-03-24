import { supabase } from '@/lib/supabase'
import { PartCard } from '@/components/PartCard'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

const CATEGORIES = [
  { label: 'Всички', value: '' },
  { label: 'Двигател', value: 'dvigatel' },
  { label: 'Ходова', value: 'hodova' },
  { label: 'Осветление', value: 'osvetlenie' },
  { label: 'Гуми & Джанти', value: 'gumi' },
  { label: 'Каросерия', value: 'karoseriya' },
  { label: 'Електрика', value: 'elektrika' },
  { label: 'Климатична', value: 'klimatichna' },
  { label: 'Интериор', value: 'interior' },
]

const CONDITIONS = [
  { label: 'Всички', value: '' },
  { label: 'Нов', value: 'нов' },
  { label: 'Употребяван', value: 'употребяван' },
  { label: 'Преработен', value: 'преработен' },
]

async function getParts(searchParams: any) {
  let query = supabase.from('parts').select('*').eq('in_stock', true)

  if (searchParams.q) {
    query = query.or(`title.ilike.%${searchParams.q}%,brand.ilike.%${searchParams.q}%,model.ilike.%${searchParams.q}%,description.ilike.%${searchParams.q}%`)
  }
  if (searchParams.category) {
    query = query.eq('category', searchParams.category)
  }
  if (searchParams.condition) {
    query = query.eq('condition', searchParams.condition)
  }
  if (searchParams.brand) {
    query = query.ilike('brand', searchParams.brand)
  }

  const sort = searchParams.sort || 'newest'
  if (sort === 'price_asc') query = query.order('price', { ascending: true })
  else if (sort === 'price_desc') query = query.order('price', { ascending: false })
  else query = query.order('created_at', { ascending: false })

  const { data } = await query
  return data || []
}

export default async function PartsPage({ searchParams }: { searchParams: any }) {
  const parts = await getParts(searchParams)

  return (
    <div className="grain min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-16">
        <h1 className="font-display text-5xl font-bold uppercase mb-2">Всички части</h1>
        <p className="text-gray-500 mb-8">{parts.length} намерени резултата</p>

        {/* Filters */}
        <form className="bg-dark-800 border border-dark-600 rounded-xl p-5 mb-8 flex flex-wrap gap-4">
          <input
            name="q"
            defaultValue={searchParams.q || ''}
            placeholder="Търси..."
            className="input flex-1 min-w-[200px]"
          />
          <select name="category" defaultValue={searchParams.category || ''} className="input w-auto min-w-[150px]">
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <select name="condition" defaultValue={searchParams.condition || ''} className="input w-auto min-w-[140px]">
            {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <select name="sort" defaultValue={searchParams.sort || 'newest'} className="input w-auto min-w-[160px]">
            <option value="newest">Най-нови</option>
            <option value="price_asc">Цена: ниска → висока</option>
            <option value="price_desc">Цена: висока → ниска</option>
          </select>
          <button type="submit" className="btn-primary">Филтрирай</button>
        </form>

        {/* Grid */}
        {parts.length === 0 ? (
          <div className="text-center py-24 text-gray-600">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-lg">Нищо не е намерено</p>
            <a href="/parts" className="text-brand-500 hover:underline mt-2 inline-block">Виж всички части</a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {parts.map((part: any) => (
              <PartCard key={part.id} part={part} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
