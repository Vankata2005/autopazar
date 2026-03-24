import Link from 'next/link'
import { Zap } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-dark-700 mt-12">
      <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-brand-500 rounded flex items-center justify-center">
            <Zap size={13} className="text-white" />
          </div>
          <span className="font-display font-bold uppercase">АвтоПазар</span>
        </div>
        <div className="flex gap-6 text-sm text-gray-600">
          <Link href="/parts" className="hover:text-white transition-colors">Каталог</Link>
          <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Контакт</a>
        </div>
        <p className="text-gray-700 text-xs">© {new Date().getFullYear()} АвтоПазар. Всички права запазени.</p>
      </div>
    </footer>
  )
}
