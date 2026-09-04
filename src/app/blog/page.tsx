import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { JournalFeed } from '@/components/content/JournalFeed'
import { journalItems, parseJournalTypeQuery } from '@/content/journal'
import { siteBrand } from '@/components/siteContacts'

export const metadata: Metadata = {
  title: `Журнал — ${siteBrand}`,
  description: `Мероприятия, новости и статьи садового центра ${siteBrand}.`,
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const query = await searchParams
  const initialKinds = parseJournalTypeQuery(query.type)

  return (
    <main className="page">
      <div className="container">
        <Breadcrumbs
          items={[
            { href: '/', label: 'Главная' },
            { href: '/blog', label: 'Журнал' },
          ]}
        />
        <JournalFeed items={journalItems} initialKinds={initialKinds} />
      </div>
    </main>
  )
}
