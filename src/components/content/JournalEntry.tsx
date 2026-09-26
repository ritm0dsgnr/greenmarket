import Image from 'next/image'
import Link from 'next/link'
import { bindHangingWords } from '@/components/bindHangingWords'
import { JournalCard } from '@/components/content/JournalCard'
import { siteBlogRoute, siteBlogRoutes } from '@/components/siteNav'
import {
  formatJournalDate,
  getRelatedJournalEntries,
  journalEntryBlocks,
  journalKindLabels,
  type JournalBodyBlock,
  type JournalItem,
} from '@/content/journal'

const kindCrumbs = {
  news: { label: 'Новости', href: siteBlogRoutes.news },
  articles: { label: 'Статьи', href: siteBlogRoutes.articles },
} as const

export function journalEntryKindCrumb(item: JournalItem) {
  if (item.kind === 'news' || item.kind === 'articles') {
    return kindCrumbs[item.kind]
  }

  return { label: 'Журнал', href: siteBlogRoute }
}

function JournalEntryBlock({ block }: { block: JournalBodyBlock }) {
  switch (block.type) {
    case 'h2':
      return <h2>{bindHangingWords(block.text)}</h2>
    case 'h3':
      return <h3>{bindHangingWords(block.text)}</h3>
    case 'quote':
      return (
        <blockquote>
          <p>{bindHangingWords(block.text)}</p>
          {block.cite ? <cite>{bindHangingWords(block.cite)}</cite> : null}
        </blockquote>
      )
    case 'note':
      return (
        <aside>
          {block.label ? <p className="journal-entry__kicker">{block.label}</p> : null}
          <p>{bindHangingWords(block.text)}</p>
        </aside>
      )
    case 'ul':
      return (
        <ul>
          {block.items.map((item) => (
            <li key={item}>{bindHangingWords(item)}</li>
          ))}
        </ul>
      )
    default:
      return <p>{bindHangingWords(block.text)}</p>
  }
}

export function JournalEntry({ item }: { item: JournalItem }) {
  const kindCrumb = journalEntryKindCrumb(item)
  const blocks = journalEntryBlocks(item)
  const related = getRelatedJournalEntries(item)
  const cover = item.imageSrc ?? '/img/placeholder.svg'

  return (
    <article className="journal-entry" aria-labelledby="journal-entry-title">
      <header className="journal-entry__head">
        <div className="journal-entry__meta">
          <p className="journal-entry__eyebrow">
            <Link href={kindCrumb.href}>{journalKindLabels[item.kind]}</Link>
          </p>
          <time className="journal-entry__date" dateTime={item.date}>
            {formatJournalDate(item.date)}
          </time>
        </div>
        <h1 className="journal-entry__title" id="journal-entry-title">
          {bindHangingWords(item.title)}
        </h1>
      </header>

      <figure className="journal-entry__cover">
        <Image src={cover} alt={item.imageAlt ?? ''} width={1280} height={860} />
      </figure>

      {item.excerpt ? <p className="journal-entry__lead">{bindHangingWords(item.excerpt)}</p> : null}

      {blocks.length > 0 ? (
        <div className="journal-entry__body">
          {blocks.map((block, index) => (
            <JournalEntryBlock key={`${block.type}-${index}`} block={block} />
          ))}
        </div>
      ) : null}

      <p className="journal-entry__fixture">
        Материал показан для приёмки вёрстки. Публикация через WordPress подключится отдельным этапом.
      </p>

      <p className="journal-entry__back">
        <Link href={kindCrumb.href}>Все {journalKindLabels[item.kind]}</Link>
      </p>

      {related.length > 0 ? (
        <section className="journal-entry__related" aria-labelledby="journal-entry-related">
          <h2 className="journal-entry__related-title" id="journal-entry-related">
            Ещё в журнале
          </h2>
          <ul className="journal-entry__related-list">
            {related.map((entry) => (
              <li key={entry.id}>
                <JournalCard item={entry} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  )
}
