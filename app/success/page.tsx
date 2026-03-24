import Link from 'next/link'
import { Navbar } from '@/components/Navbar'

export default function SuccessPage() {
  return (
    <div className="grain min-h-screen">
      <Navbar />
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-md">
          <div className="text-7xl mb-6">✅</div>
          <h1 className="font-display text-5xl font-bold uppercase mb-4">Поръчката е успешна!</h1>
          <p className="text-gray-400 mb-8 leading-relaxed">
            Плащането е потвърдено. Ще получиш имейл с потвърждение и ще се свържем с теб скоро.
          </p>
          <Link href="/parts" className="btn-primary inline-block">
            Към каталога
          </Link>
        </div>
      </div>
    </div>
  )
}
