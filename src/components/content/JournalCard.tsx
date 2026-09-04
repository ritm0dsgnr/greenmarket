'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useState } from 'react'
import { bindHangingWords } from '@/components/bindHangingWords'
import { HeroSignupPopup } from '@/components/HeroSignupPopup'
import { Icon } from '@/components/Icon'
import {
  getJournalEventTags,
  journalKindLabels,
  type JournalItem,
  type JournalKind,
} from '@/content/journal'

export function JournalCard({ item }: { item: JournalItem }) {
  const href = item.href ?? `#${item.id}`
  const titleId = `${item.id}-title`
  const highlights = item.highlights?.length
    ? item.highlights
    : item.excerpt
      ? [item.excerpt]
      : []
  const showEventMeta = item.kind === 'events'
  const eventTags = getJournalEventTags(item)
  const whenLabel = eventTags.timeLabel ?? formatJournalDate(item.date)
  const [signupOpen, setSignupOpen] = useState(false)
  const closeSignup = useCallback(() => setSignupOpen(false), [])

  const body = (
    <>
      <div className="event-card__media">
        <Image
          src={item.imageSrc ?? '/img/placeholder.svg'}
          alt={item.imageAlt ?? ''}
          width={320}
          height={320}
        />
      </div>

      <div className="event-card__body">
        <div className="event-card__top">
          <ul className="event-card__sections" aria-label="Тип материала">
            <li>
              <span className="event-card__section">{journalKindLabels[item.kind]}</span>
            </li>
          </ul>
          <span className="event-card__corner" aria-hidden="true">
            <Icon name="arrow-corner" className="event-card__corner-icon" />
          </span>
        </div>

        <h2 className="event-card__title" id={titleId}>
          {bindHangingWords(item.title)}
        </h2>

        {highlights.length > 0 ? (
          <ul
            className={['event-card__highlights', item.excerpt ? 'event-card__highlights--text' : '']
              .filter(Boolean)
              .join(' ')}
          >
            {highlights.map((line) => (
              <li key={line}>{bindHangingWords(line)}</li>
            ))}
          </ul>
        ) : null}

        <div className="event-card__footer">
          <ul className="event-card__tags" aria-label={showEventMeta ? 'Детали мероприятия' : 'Дата'}>
            <li>
              <span
                className={[
                  'event-card__tag',
                  showEventMeta ? 'event-card__tag--date' : 'event-card__tag--date-muted',
                ].join(' ')}
              >
                <time dateTime={item.date}>{whenLabel}</time>
              </span>
            </li>
            {showEventMeta && eventTags.priceLabel ? (
              <li>
                <span className="event-card__tag event-card__tag--price">{eventTags.priceLabel}</span>
              </li>
            ) : null}
          </ul>
          {showEventMeta ? (
            <button
              className="event-card__more"
              type="button"
              onClick={() => setSignupOpen(true)}
            >
              Записаться
            </button>
          ) : (
            <span className="event-card__more event-card__more--light">Подробнее</span>
          )}
        </div>
      </div>
    </>
  )

  if (showEventMeta) {
    return (
      <>
        <article className="event-card event-card--event" id={item.id} aria-labelledby={titleId}>
          {body}
        </article>
        <HeroSignupPopup
          open={signupOpen}
          title={item.title}
          details={{
            lead: item.signup?.lead,
            points: item.signup?.points,
            place: item.signup?.place ?? item.address,
            callToAction: item.signup?.callToAction,
            timeLabel: eventTags.timeLabel ?? undefined,
            dateLabel: formatJournalDate(item.date),
            priceLabel: eventTags.priceLabel ?? undefined,
          }}
          onClose={closeSignup}
        />
      </>
    )
  }

  return (
    <Link className="event-card" href={href} id={item.id} aria-labelledby={titleId}>
      {body}
    </Link>
  )
}

export function formatJournalDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)

  if (!match) {
    return value
  }

  const [, year, month, day] = match
  return `${day}.${month}.${year}`
}

export type { JournalKind }
