import type { Metadata } from 'next'
import { SiteNotFound } from '@/components/SiteNotFound'

export const metadata: Metadata = {
  title: 'Страница не найдена — Green Market',
  robots: {
    index: false,
    follow: true,
  },
}

export default function NotFoundPage() {
  return (
    <main className="page page--not-found">
      <div className="container">
        <SiteNotFound />
      </div>
    </main>
  )
}
