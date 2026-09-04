'use client'

import { useMemo, useState } from 'react'
import { JournalCard } from '@/components/content/JournalCard'
import {
  journalKindLabels,
  journalKinds,
  withJournalTypeQuery,
  type JournalItem,
  type JournalKind,
} from '@/content/journal'

type JournalFeedProps = {
  items: readonly JournalItem[]
  initialKinds?: readonly JournalKind[]
}

export function JournalFeed({ items, initialKinds = [] }: JournalFeedProps) {
  const [selectedKind, setSelectedKind] = useState<JournalKind | null>(
    initialKinds[0] ?? null,
  )

  const visibleItems = useMemo(() => {
    const kindOrder = new Map(journalKinds.map((kind, index) => [kind, index]))
    const filtered = selectedKind
      ? items.filter((item) => item.kind === selectedKind)
      : items

    return [...filtered].sort((left, right) => {
      const kindDiff = (kindOrder.get(left.kind) ?? 0) - (kindOrder.get(right.kind) ?? 0)

      if (kindDiff !== 0) {
        return kindDiff
      }

      return right.date.localeCompare(left.date)
    })
  }, [items, selectedKind])

  function selectKind(kind: JournalKind) {
    setSelectedKind((current) => {
      const next = current === kind ? null : kind
      replaceJournalUrl(next)
      return next
    })
  }

  return (
    <section className="events-feed" aria-labelledby="journal-feed-title">
      <header className="events-feed__head">
        <p className="events-feed__eyebrow">Зелёный журнал · Грин Маркет</p>
        <h1 className="events-feed__title" id="journal-feed-title">
          Журнал
        </h1>
        <p className="events-feed__lead">
          Мероприятия, новости и статьи садового центра — в одной ленте с фильтрами по типу
          материала.
        </p>

        <div className="blog-section-tabs" role="radiogroup" aria-label="Фильтр по типу">
          {journalKinds.map((kind) => {
            const isActive = selectedKind === kind

            return (
              <button
                key={kind}
                className={['blog-section-tabs__item', isActive ? 'is-active' : '']
                  .filter(Boolean)
                  .join(' ')}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => selectKind(kind)}
              >
                {journalKindLabels[kind]}
              </button>
            )
          })}
        </div>
      </header>

      {visibleItems.length > 0 ? (
        <ul className="events-feed__list">
          {visibleItems.map((item) => (
            <li key={item.id}>
              <JournalCard item={item} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="events-feed__empty">Нет материалов для выбранного фильтра.</p>
      )}
    </section>
  )
}

function replaceJournalUrl(kind: JournalKind | null) {
  if (typeof window === 'undefined') {
    return
  }

  window.history.replaceState(
    window.history.state,
    '',
    withJournalTypeQuery('/blog', kind ? [kind] : []),
  )
}
