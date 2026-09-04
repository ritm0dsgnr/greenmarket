import type { Metadata } from 'next'
import { SiteNotFound } from '@/components/SiteNotFound'
import { siteBrand } from '@/components/siteContacts'

export const metadata: Metadata = {
  title: `Страница не найдена — ${siteBrand}`,
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
