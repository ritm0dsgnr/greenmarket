import { describe, expect, it } from 'vitest'
import {
  listingSpecParamKey,
  parseListingSort,
  parseListingSpecFilters,
  withListingQuery,
} from './listing-filters-url'

const groups = [
  { label: 'Контейнер', values: ['C3', 'C5', 'C10'] },
  { label: 'Цвет', values: ['белый', 'голубой'] },
]

describe('listing-filters-url', () => {
  it('uses short keys for known labels', () => {
    expect(listingSpecParamKey('Контейнер')).toBe('c')
    expect(listingSpecParamKey('Цвет')).toBe('color')
    expect(listingSpecParamKey('Свой параметр')).toBe('svoy-parametr')
  })

  it('parses sort and ignores featured default', () => {
    expect(parseListingSort('cheap')).toBe('cheap')
    expect(parseListingSort(['expensive'])).toBe('expensive')
    expect(parseListingSort('featured')).toBe('featured')
    expect(parseListingSort(undefined)).toBe('featured')
    expect(parseListingSort('nope')).toBe('featured')
  })

  it('parses spec filters from compact query values', () => {
    expect(
      parseListingSpecFilters(groups, {
        c: 'C3,C10',
        color: 'belyy',
      }),
    ).toEqual([
      { label: 'Контейнер', value: 'C3' },
      { label: 'Контейнер', value: 'C10' },
      { label: 'Цвет', value: 'белый' },
    ])
    expect(parseListingSpecFilters(groups, { c: 'unknown' })).toEqual([])
  })

  it('builds a compact listing URL with tags, filters and sort', () => {
    expect(
      withListingQuery('/catalog/hvoynye/el', {
        promoTags: ['sale'],
        nameTags: ['колючая'],
        specFilters: [
          { label: 'Цвет', value: 'белый' },
          { label: 'Контейнер', value: 'C5' },
          { label: 'Контейнер', value: 'C3' },
        ],
        sort: 'cheap',
      }),
    ).toBe('/catalog/hvoynye/el?promo=sale&tag=kolyuchaya&c=C3%2CC5&color=belyy&sort=cheap')

    expect(withListingQuery('/catalog/hvoynye/el', {})).toBe('/catalog/hvoynye/el')
  })
})
