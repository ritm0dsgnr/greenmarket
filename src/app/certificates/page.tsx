import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { GiftCertificate } from '@/components/GiftCertificate'
import { siteBrand } from '@/components/siteContacts'

export const metadata: Metadata = {
  title: `Подарочный сертификат | ${siteBrand}`,
  description: `Подарочный сертификат садового центра ${siteBrand}. Выберите номинал и оставьте заявку.`,
}

export default function CertificatesPage() {
  return (
    <main className="page">
      <div className="container">
        <Breadcrumbs items={[{ href: '/', label: 'Главная' }, { label: 'Сертификаты' }]} />
        <GiftCertificate />
      </div>
    </main>
  )
}
