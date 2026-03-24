import Link from 'next/link'
import Image from 'next/image'
import { type Part } from '@/lib/supabase'

const conditionBadge: Record<string, string> = {
  'нов': 'bg-green-900/60 text-green-400',
  'употребяван': 'bg-yellow-900/60 text-yellow-400',
  'преработен': 'bg-blue-900/60 text-blue-400',
}

export function PartCard({ part }: { part: Part }) {
  const img = part.images?.[0] || 'https://placehold.co/400x300/1a1a1a/555?text=АвтоПазар'
  const discount = part.original_price
    ? Math.round((1 - part.price / part.original_price) * 100)
    : null

  return (
    <Link href={`/parts/${part.id}`} className="card group block">
      <div className="relative aspect-[4/3] bg-dark-900 overflow-hidden">
        <Image
          src={img}
          alt={part.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {discount && (
          <div className="absolute top-3 left-3 bg-brand-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
            -{discount}%
          </div>
        )}
        {!part.in_stock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-gray-300 font-semibold text-sm">Изчерпан</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-white text-sm leading-snug group-hover:text-brand-400 transition-colors line-clamp-2">
            {part.title}
          </h3>
          <span className={`badge flex-shrink-0 text-xs ${conditionBadge[part.condition] || 'bg-dark-600 text-gray-400'}`}>
            {part.condition}
          </span>
        </div>
        <p className="text-gray-600 text-xs mb-3">
          {part.brand} {part.model}{part.year_from ? ` · ${part.year_from}${part.year_to ? '–' + part.year_to : '+'}` : ''}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold text-brand-500">{part.price}</span>
            <span className="text-gray-500 text-sm">лв.</span>
            {part.original_price && (
              <span className="text-gray-700 line-through text-sm">{part.original_price} лв.</span>
            )}
          </div>
          <span className="text-xs text-gray-600 group-hover:text-brand-500 transition-colors">Виж →</span>
        </div>
      </div>
    </Link>
  )
}
