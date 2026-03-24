import type { Metadata } from 'next'
import { Barlow_Condensed, Barlow } from 'next/font/google'
import './globals.css'

const display = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
})

const body = Barlow({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
})

export const metadata: Metadata = {
  title: 'АвтоПазар — Авточасти на добра цена',
  description: 'Качествени авточасти — нови и употребявани. Бърза доставка из цяла България.',
  keywords: 'авточасти, части за коли, BMW части, Mercedes части, VW части, авточасти България',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bg" className={`${display.variable} ${body.variable}`}>
      <body className="bg-dark-900 text-white font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
