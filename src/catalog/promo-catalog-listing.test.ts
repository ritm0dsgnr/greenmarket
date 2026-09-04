import { describe, expect, it } from 'vitest'
import {
  buildPromoCatalogListing,
  filterProductCardsByPromoTags,
  withFirstWordNameTags,
} from './promo-catalog-listing'
import type { ProductCardData } from '@/components/ProductCard'

describe('promo-catalog-listing', () => {
  const cards = [
    { id: '1', tag: 'new', available: true, name: 'Андромеда "Blue Ice"' },
    { id: '2', tag: 'new', available: true, name: 'Рододендрон даурский', nameTag: 'даурский' },
    { id: '3', tag: 'sale', available: true, name: 'Ель колючая', nameTag: 'колючая' },
    { id: '4', tag: null, available: true, name: 'Туя западная' },
  ] as ProductCardData[]

  it('keeps only matching promo cards', () => {
    expect(filterProductCardsByPromoTags(cards, ['new']).map((card) => card.id)).toEqual(['1', '2'])
  })

  it('replaces name tags with the first word of the title', () => {
    expect(withFirstWordNameTags(cards).map((card) => card.nameTag)).toEqual([
      'Андромеда',
      'Рододендрон',
      'Ель',
      'Туя',
    ])
  })

  it('builds a novelty listing with first-word tags only', () => {
    const listing = buildPromoCatalogListing(cards, ['new'])

    expect(listing.map((card) => card.id)).toEqual(['1', '2'])
    expect(listing.map((card) => card.nameTag)).toEqual(['Андромеда', 'Рододендрон'])
  })
})
