import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { JournalEntry, journalEntryKindCrumb } from '@/components/content/JournalEntry'
import { siteBrand } from '@/components/siteContacts'
import { getJournalEntry, listJournalEntryIds } from '@/content/journal'

export function generateStaticParams() {
  return listJournalEntryIds().map((id) => ({ id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const item = getJournalEntry(id)

  if (!item) {
    return { title: `Журнал — ${siteBrand}` }
  }

  return {
    title: `${item.title} — ${siteBrand}`,
    description: item.excerpt ?? `${item.title}. Журнал садового центра ${siteBrand}.`,
  }
}

export default async function JournalEntryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const item = getJournalEntry(id)

  if (!item) {
    notFound()
  }

  const kindCrumb = journalEntryKindCrumb(item)

  return (
    <main className="page page--journal-entry">
      <div className="container">
        <Breadcrumbs
          items={[
            { href: '/', label: 'Главная' },
            { href: '/blog', label: 'Журнал' },
            { href: kindCrumb.href, label: kindCrumb.label },
            { label: item.title },
          ]}
        />
        <JournalEntry item={item} />
      </div>
    </main>
  )
}
