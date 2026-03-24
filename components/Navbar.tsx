'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Zap } from 'lucide-react'

export function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-dark-900/80 backdrop-blur-lg border-b border-dark-700">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-display text-xl font-bold uppercase tracking-wide">АвтоПазар</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/parts" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Каталог</Link>
          <Link href="/parts?category=dvigatel" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Двигатели</Link>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all"
          >
            💬 WhatsApp
          </a>
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden text-gray-400 hover:text-white">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-dark-800 border-t border-dark-700 px-4 py-4 flex flex-col gap-3">
          <Link href="/parts" onClick={() => setOpen(false)} className="text-gray-300 hover:text-white py-2 border-b border-dark-700">Каталог</Link>
          <Link href="/parts?category=dvigatel" onClick={() => setOpen(false)} className="text-gray-300 hover:text-white py-2 border-b border-dark-700">Двигатели</Link>
          <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer"
            className="text-center bg-green-600 text-white font-semibold py-3 rounded-lg">
            💬 Пиши в WhatsApp
          </a>
        </div>
      )}
    </nav>
  )
}
