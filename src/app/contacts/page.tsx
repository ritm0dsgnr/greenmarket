import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { SiteContacts } from '@/components/SiteContactsSection'
import { siteBrand } from '@/components/siteContacts'

export const metadata: Metadata = {
  title: `Контакты — ${siteBrand}`,
  description: `Телефон, адрес и режим работы садового центра ${siteBrand} в Березовском.`,
}

export default function ContactsPage() {
  return (
    <main className="page">
      <div className="container">
        <Breadcrumbs
          items={[
            { href: '/', label: 'Главная' },
            { label: 'Контакты' },
          ]}
        />
        <SiteContacts />
      </div>
    </main>
  )
}
