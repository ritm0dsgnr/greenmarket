import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { SiteCart } from '@/components/SiteCart'
import { siteBrand } from '@/components/siteContacts'

export const metadata: Metadata = {
  title: `Корзина — ${siteBrand}`,
  description: `Корзина садового центра ${siteBrand}.`,
}

export default function CartPage() {
  return (
    <main className="page">
      <div className="container">
        <Breadcrumbs
          items={[
            { href: '/', label: 'Главная' },
            { label: 'Корзина' },
          ]}
        />
        <SiteCart />
      </div>
    </main>
  )
}
