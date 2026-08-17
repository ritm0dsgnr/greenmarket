import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { SiteCart } from '@/components/SiteCart'

export const metadata: Metadata = {
  title: 'Корзина — Green Market',
  description: 'Корзина садового центра Green Market.',
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
