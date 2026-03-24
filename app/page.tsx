import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { PartCard } from '@/components/PartCard'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Search, Zap, Shield, Truck, PhoneCall } from 'lucide-react'

async function getLatestParts() {
  const { data } = await supabase
    .from('parts')
    .select('*')
    .eq('in_stock', true)
    .order('created_at', { ascending: false })
    .limit(6)
  return data || []
}

const CATEGORIES = [
  { name: 'Двигател', icon: '⚙️', slug: 'dvigatel' },
  { name: 'Ходова', icon: '🔧', slug: 'hodova' },
  { name: 'Осветление', icon: '💡', slug: 'osvetlenie' },
  { name: 'Гуми & Джанти', icon: '🛞', slug: 'gumi' },
  { name: 'Каросерия', icon: '🪟', slug: 'karoseriya' },
  { name: 'Електрика', icon: '🔋', slug: 'elektrika' },
  { name: 'Климатична', icon: '❄️', slug: 'klimatichna' },
  { name: 'Интериор', icon: '🪑', slug: 'interior' },
]

export default async function HomePage() {
  const parts = await getLatestParts()

  return (
    <div className="grain min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-24 pb-20 px-4 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Zap size={14} />
            Бърза доставка из цяла България
          </div>

          <h1 className="font-display text-6xl md:text-8xl font-bold uppercase leading-none tracking-tight mb-6">
            Авточасти
            <br />
            <span className="text-brand-500">на добра цена</span>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl max-w-xl mx-auto mb-10">
            Качествени части за всички марки. Нови и употребявани.
            Три начина на плащане.
          </p>

          {/* Search bar */}
          <form action="/parts" method="GET" className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto mb-12">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                name="q"
                type="text"
                placeholder="Търси по марка, модел, или тип..."
                className="input pl-11"
              />
            </div>
            <button type="submit" className="btn-primary whitespace-nowrap">
              Търси части
            </button>
          </form>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-2"><Shield size={15} className="text-brand-500" /> Гарантирано качество</span>
            <span className="flex items-center gap-2"><Truck size={15} className="text-brand-500" /> Доставка 1–3 дни</span>
            <span className="flex items-center gap-2"><PhoneCall size={15} className="text-brand-500" /> Поддръжка по телефон</span>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-4 py-12 max-w-6xl mx-auto">
        <h2 className="font-display text-3xl font-bold uppercase mb-6 text-gray-100">
          Категории
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/parts?category=${cat.slug}`}
              className="bg-dark-800 border border-dark-600 hover:border-brand-500/50 rounded-xl p-4 text-center transition-all duration-200 group"
            >
              <div className="text-3xl mb-2">{cat.icon}</div>
              <div className="text-xs font-semibold text-gray-400 group-hover:text-white transition-colors leading-tight">
                {cat.name}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest parts */}
      <section className="px-4 py-12 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-3xl font-bold uppercase text-gray-100">
            Последни обяви
          </h2>
          <Link href="/parts" className="btn-ghost text-sm">
            Всички части →
          </Link>
        </div>

        {parts.length === 0 ? (
          <div className="text-center py-24 text-gray-600">
            <p className="text-5xl mb-4">🔧</p>
            <p className="text-lg">Скоро ще има части тук</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {parts.map((part: any, i: number) => (
              <div key={part.id} style={{ animationDelay: `${i * 80}ms` }} className="animate-fade-up opacity-0">
                <PartCard part={part} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* WhatsApp CTA */}
      <section className="px-4 py-16 max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-dark-700 to-dark-800 border border-dark-500 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-display text-4xl font-bold uppercase mb-2">Не намери нужната част?</h3>
            <p className="text-gray-400">Пиши ни директно — намираме всичко!</p>
          </div>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=Здравейте, търся авточаст...`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-4 rounded-xl transition-all whitespace-nowrap text-lg"
          >
            <span>💬</span> Пиши в WhatsApp
          </a>
        </div>
      </section>

      <Footer />
    </div>
  )
}
