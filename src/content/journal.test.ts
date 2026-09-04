import { describe, expect, it } from 'vitest'
import {
  getHomeJournalSliderItems,
  getJournalItemById,
  parseJournalTypeQuery,
  withJournalTypeQuery,
  journalItems,
  type JournalItem,
} from './journal'

describe('journal filters', () => {
  it('parses type query values as exclusive or', () => {
    expect(parseJournalTypeQuery('events')).toEqual(['events'])
    expect(parseJournalTypeQuery(['news', 'articles'])).toEqual(['news'])
    expect(parseJournalTypeQuery('events,news')).toEqual(['events'])
    expect(parseJournalTypeQuery('unknown')).toEqual([])
  })

  it('builds filter urls', () => {
    expect(withJournalTypeQuery('/blog', [])).toBe('/blog')
    expect(withJournalTypeQuery('/blog', ['articles', 'events'])).toBe('/blog?type=articles')
  })
})

describe('home journal slider picks', () => {
  const sample: JournalItem[] = [
    {
      id: 'a1',
      kind: 'articles',
      date: '2026-04-01',
      title: 'Article',
      inHomeSlider: true,
      homeSliderOrder: 3,
    },
    {
      id: 'e1',
      kind: 'events',
      date: '2026-01-01',
      title: 'Event',
      inHomeSlider: true,
      homeSliderOrder: 1,
    },
    {
      id: 'n1',
      kind: 'news',
      date: '2026-03-01',
      title: 'News',
      inHomeSlider: true,
      homeSliderOrder: 2,
    },
    {
      id: 'e2',
      kind: 'events',
      date: '2026-05-01',
      title: 'Hidden event',
    },
  ]

  it('uses marked items and admin order', () => {
    expect(getHomeJournalSliderItems(sample).map((item) => item.id)).toEqual(['e1', 'n1', 'a1'])
  })

  it('falls back to events then news then articles', () => {
    const unmarked: JournalItem[] = [
      { id: 'a', kind: 'articles', date: '2026-04-01', title: 'A' },
      { id: 'n', kind: 'news', date: '2026-03-01', title: 'N' },
      { id: 'e', kind: 'events', date: '2026-02-01', title: 'E' },
    ]

    expect(getHomeJournalSliderItems(unmarked).map((item) => item.id)).toEqual(['e', 'n', 'a'])
  })
})

describe('botanical relief masterclass fixture', () => {
  it('keeps signup details for the popup', () => {
    const item = getJournalItemById('event-botanical-relief')

    expect(item?.priceLabel).toBe('2500₽')
    expect(item?.timeLabel).toBe('3 августа, 12:00')
    expect(item?.signup?.place).toContain('Рассветная')
    expect(item?.signup?.points?.length).toBe(2)
    expect(journalItems.some((entry) => entry.id === 'event-botanical-relief')).toBe(true)
  })
})
