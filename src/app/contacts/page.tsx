import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { SiteContacts } from '@/components/SiteContactsSection'

export const metadata: Metadata = {
  title: 'Контакты — Green Market',
  description: 'Телефон, адрес и режим работы садового центра Green Market в Березовском.',
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
