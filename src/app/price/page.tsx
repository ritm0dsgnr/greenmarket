import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { PriceList } from '@/components/PriceList'
import { siteBrand } from '@/components/siteContacts'

export const metadata: Metadata = {
  title: `Прайс | ${siteBrand}`,
  description: `Запросите актуальный прайс-лист садового центра ${siteBrand}.`,
}

export default function PricePage() {
  return (
    <main className="page">
      <div className="container">
        <Breadcrumbs items={[{ href: '/', label: 'Главная' }, { label: 'Прайс' }]} />
        <PriceList />
      </div>
    </main>
  )
}
