import { describe, expect, it } from 'vitest'
import { getHomeNoveltyCards, homeNoveltiesListingPath, selectHomeNoveltyCards } from './home-novelties'
import type { ProductCardFromPrice } from '../import/greenmarket-price/types'

describe('selectHomeNoveltyCards', () => {
  it('keeps only available new tags', () => {
    const cards = [
      { id: '1', tag: 'new', available: true, name: 'A' },
      { id: '2', tag: 'new', available: false, name: 'B' },
      { id: '3', tag: 'sale', available: true, name: 'C' },
      { id: '4', tag: null, available: true, name: 'D' },
    ] as ProductCardFromPrice[]

    expect(selectHomeNoveltyCards(cards).map((card) => card.id)).toEqual(['1'])
  })
})

describe('homeNoveltiesListingPath', () => {
  it('points to catalog filtered by promo=new', () => {
    expect(homeNoveltiesListingPath).toBe('/catalog?promo=new')
  })
})

describe('getHomeNoveltyCards', () => {
  it('reads available new products from price catalog fixtures', () => {
    const cards = getHomeNoveltyCards()

    expect(cards.length).toBeGreaterThan(0)
    expect(cards.every((card) => card.tag === 'new' && card.available)).toBe(true)
  })
})
