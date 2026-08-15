import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { ProductRelated } from '@/components/ProductRelated'
import { ProductView } from '@/components/ProductView'

export const metadata: Metadata = {
  title: 'Яблони компактная зеленая — Green Market',
  description: 'Яблони компактная зеленая садового центра Green Market.',
}

export default function ProductPage() {
  return (
    <main className="page">
      <div className="container">
        <Breadcrumbs
          items={[
            { href: '/', label: 'Главная' },
            { href: '/catalog', label: 'Каталог' },
            { href: '/catalog/plodovye', label: 'Плодовые' },
            { href: '/catalog/plodovye/yabloni', label: 'Яблони' },
            { label: 'Яблони компактная зеленая' },
          ]}
        />
        <ProductView />
      </div>
      <ProductRelated />
    </main>
  )
}
