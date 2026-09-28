import Link from 'next/link'
import type { ReactNode } from 'react'
import { bindHangingWords } from '@/components/bindHangingWords'
import { siteBrand } from '@/components/siteContacts'

export type ContentCard = {
  title: string
  text: string
}

export type ContentSection = {
  id: string
  eyebrow?: string
  title: string
  lead?: string
  cards?: readonly ContentCard[]
  paragraphs?: readonly string[]
  links?: readonly { href: string; label: string }[]
}

type ContentPageProps = {
  title: string
  lead: string
  highlight?: { value: string; text: string }
  sections: readonly ContentSection[]
  fixtureNote?: boolean
  children?: ReactNode
}

const t = bindHangingWords

export function ContentPage({
  title,
  lead,
  highlight,
  sections,
  fixtureNote = false,
  children,
}: ContentPageProps) {
  return (
    <section className="content-page" aria-labelledby="content-page-title">
      <header className="content-page__hero">
        <div className="content-page__intro">
          <p className="content-page__eyebrow">{siteBrand}</p>
          <h1 className="content-page__title" id="content-page-title">
            {t(title)}
          </h1>
          <p className="content-page__lead">{t(lead)}</p>
        </div>
        {highlight ? (
          <div className="content-page__highlight">
            <span className="content-page__highlight-value">{highlight.value}</span>
            <span className="content-page__highlight-text">{t(highlight.text)}</span>
          </div>
        ) : null}
      </header>

      {sections.map((section) => (
        <section
          key={section.id}
          className="content-page__section"
          aria-labelledby={`${section.id}-title`}
        >
          <div className="content-page__section-head">
            {section.eyebrow ? <p className="content-page__eyebrow">{t(section.eyebrow)}</p> : null}
            <h2 className="content-page__section-title" id={`${section.id}-title`}>
              {t(section.title)}
            </h2>
            {section.lead ? <p className="content-page__section-lead">{t(section.lead)}</p> : null}
          </div>

          {section.paragraphs?.length ? (
            <div className="content-page__copy">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="content-page__paragraph">
                  {t(paragraph)}
                </p>
              ))}
            </div>
          ) : null}

          {section.cards?.length ? (
            <ul className="content-page__cards">
              {section.cards.map((card) => (
                <li key={card.title} className="content-page__card">
                  <h3 className="content-page__card-title">{t(card.title)}</h3>
                  <p className="content-page__card-text">{t(card.text)}</p>
                </li>
              ))}
            </ul>
          ) : null}

          {section.links?.length ? (
            <div className="content-page__actions">
              {section.links.map((link) => (
                <Link key={link.href} className="content-page__action" href={link.href}>
                  {t(link.label)}
                </Link>
              ))}
            </div>
          ) : null}
        </section>
      ))}

      {children}

      {fixtureNote ? (
        <p className="content-page__fixture-note">
          {t(
            'Материалы раздела показаны для приёмки вёрстки. Публикация контента будет подключена на следующем этапе.',
          )}
        </p>
      ) : null}
    </section>
  )
}
