import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { DeliveryInfo } from '@/components/DeliveryInfo'
import { siteBrand, siteStreet } from '@/components/siteContacts'

const pickupAddress = `г. Березовский, ${siteStreet}`

export const metadata: Metadata = {
  title: `Доставка и оплата — ${siteBrand}`,
  description: `Доставка, самовывоз, оплата и возврат в садовом центре ${siteBrand}. Адрес: ${pickupAddress}.`,
}

export default function DeliveryPage() {
  return (
    <main className="page">
      <div className="container">
        <Breadcrumbs items={[{ href: '/', label: 'Главная' }, { label: 'Доставка и оплата' }]} />
        <DeliveryInfo />
      </div>
    </main>
  )
}
