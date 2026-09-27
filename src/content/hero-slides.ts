import { homeNoveltiesListingPath } from '../catalog/home-novelties'
import { getJournalItemById } from './journal'

export type HeroSlideCta =
  | {
      kind: 'link'
      label: string
      href: string
    }
  | {
      kind: 'signup'
      label: string
      /** Pull long copy from a journal event for the signup popup. */
      journalId?: string
    }

export type HeroSlide = {
  id: string
  title: string
  text: string
  imageSrc: string
  imageAlt?: string
  /** Optional event meta chips (date / price). */
  dateLabel?: string
  dateTime?: string
  priceLabel?: string
  cta: HeroSlideCta
}

/**
 * Homepage hero slider fixtures (manual CMS stand-in).
 * Each slide: photo, title, text, CTA (page link or signup popup).
 * Events may add date and price.
 */
export const heroSlides: readonly HeroSlide[] = [
  {
    id: 'hero-event-botanical-relief',
    title: 'Ботанический барельеф',
    text: 'Мастер-класс 3 августа в 12:00 — живые растения, глина и гипс. Мест немного.',
    imageSrc: '/img/hero/slides/relief.png',
    imageAlt: 'Глина, гипс и живые растения на столе мастер-класса',
    dateLabel: '3 августа, 12:00',
    dateTime: '2026-08-03',
    priceLabel: '2500₽',
    cta: {
      kind: 'signup',
      label: 'Записаться',
      journalId: 'event-botanical-relief',
    },
  },
  {
    id: 'hero-novelties',
    title: 'Новинки сезона',
    text: 'Свежие поступления растений — смотрите подборку новинок в каталоге.',
    imageSrc: '/img/hero/slides/novelties.png',
    imageAlt: 'Новые растения в контейнерах на площадке садового центра',
    cta: {
      kind: 'link',
      label: 'Смотреть новинки',
      href: homeNoveltiesListingPath,
    },
  },
  {
    id: 'hero-event-open-day',
    title: 'День открытых дверей',
    text: 'Экскурсия по питомнику, консультации по посадке и подбор растений для участка.',
    imageSrc: '/img/hero/slides/open-day.png',
    imageAlt: 'Дорожка между рядами саженцев в питомнике',
    dateLabel: '8 июня',
    dateTime: '2026-06-08',
    priceLabel: 'бесплатно',
    cta: {
      kind: 'link',
      label: 'Подробнее',
      href: '/blog?type=events',
    },
  },
]

export function getHeroSignupDetails(slide: HeroSlide) {
  if (slide.cta.kind !== 'signup') {
    return null
  }

  const journal = slide.cta.journalId ? getJournalItemById(slide.cta.journalId) : null

  if (journal?.signup) {
    return {
      ...journal.signup,
      timeLabel: journal.timeLabel,
      dateLabel: slide.dateLabel,
      priceLabel: slide.priceLabel ?? journal.priceLabel,
    }
  }

  return {
    timeLabel: journal?.timeLabel,
    dateLabel: slide.dateLabel,
    priceLabel: slide.priceLabel ?? journal?.priceLabel,
    place: journal?.address,
  }
}
