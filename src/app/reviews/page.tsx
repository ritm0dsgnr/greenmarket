import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Reviews } from '@/components/Reviews'
import { siteBrand } from '@/components/siteContacts'

export const metadata: Metadata = {
  title: `Отзывы — ${siteBrand}`,
  description: `Отзывы покупателей садового центра ${siteBrand}.`,
}

export default function ReviewsPage() {
  return (
    <main className="page">
      <div className="container">
        <Breadcrumbs items={[{ href: '/', label: 'Главная' }, { label: 'Отзывы' }]} />
        <Reviews />
      </div>
    </main>
  )
}
