import { describe, expect, it } from 'vitest'
import {
  buildOfferSizes,
  firstAvailableSizeId,
  offerPricesVary,
  offerSizesHaveChoices,
  specsWithoutVariantAxes,
} from './offer-sizes'

describe('offer-sizes', () => {
  it('builds one size per unique priced offer', () => {
    const sizes = buildOfferSizes({
      priceRubles: 900,
      offers: [
        { sourceRowNumber: 1, container: 'C3', plantSize: '20-40', available: true, priceRubles: 900 },
        {
          sourceRowNumber: 2,
          container: 'C10',
          plantSize: 'St150',
          available: true,
          priceRubles: 11500,
        },
        { sourceRowNumber: 3, container: 'C3', plantSize: '20-40', available: true, priceRubles: 900 },
      ],
    })

    expect(sizes).toEqual([
      { id: 'offer-0', label: 'C3 · 20-40', priceRubles: 900, hint: '20-40', available: true },
      { id: 'offer-1', label: 'C10 · St150', priceRubles: 11500, hint: 'St150', available: true },
    ])
    expect(offerSizesHaveChoices(sizes)).toBe(true)
    expect(offerPricesVary(sizes)).toBe(true)
  })

  it('omits shared container from variant labels', () => {
    const sizes = buildOfferSizes({
      priceRubles: 13000,
      offers: [
        { sourceRowNumber: 7, container: 'ком', plantSize: '110-120', available: true, priceRubles: 13000 },
        { sourceRowNumber: 8, container: 'ком', plantSize: '140-150', available: true, priceRubles: 18000 },
        { sourceRowNumber: 9, container: 'ком', plantSize: '170-180', available: true, priceRubles: 22500 },
      ],
    })

    expect(sizes.map((size) => size.label)).toEqual(['110-120', '140-150', '170-180'])
  })

  it('keeps unavailable sizes in the picker with availability flags', () => {
    const sizes = buildOfferSizes({
      priceRubles: 7900,
      offers: [
        { sourceRowNumber: 14, container: 'C20', plantSize: '80-100', available: true, priceRubles: 7900 },
        {
          sourceRowNumber: 15,
          available: false,
          availabilityRaw: 'нет в наличии',
          priceRubles: 15500,
        },
      ],
    })

    expect(sizes).toEqual([
      {
        id: 'offer-0',
        label: 'C20 · 80-100',
        priceRubles: 7900,
        hint: '80-100',
        available: true,
      },
      {
        id: 'offer-1',
        label: 'Нет в наличии',
        priceRubles: 15500,
        hint: 'Нет в наличии',
        available: false,
      },
    ])
    expect(firstAvailableSizeId(sizes)).toBe('offer-0')
    expect(offerSizesHaveChoices(sizes)).toBe(false)
    expect(offerPricesVary(sizes)).toBe(false)
  })

  it('skips picker when only one offer is in stock', () => {
    const sizes = buildOfferSizes({
      priceRubles: 1600,
      offers: [
        {
          sourceRowNumber: 51,
          available: false,
          availabilityRaw: 'нет в наличии',
          priceRubles: 700,
        },
        { sourceRowNumber: 52, container: 'C5/C7,5', available: true, priceRubles: 1600 },
      ],
    })

    expect(sizes.map((size) => size.available)).toEqual([false, true])
    expect(offerSizesHaveChoices(sizes)).toBe(false)
    expect(offerPricesVary(sizes)).toBe(false)
  })

  it('hides differentiating size specs from characteristics', () => {
    const specs = specsWithoutVariantAxes(
      [
        { label: 'Контейнер', value: 'ком' },
        { label: 'Размер', value: '110-120' },
        { label: 'Размер', value: '140-150' },
        { label: 'Цвет', value: 'Голубая' },
      ],
      [
        { sourceRowNumber: 7, container: 'ком', plantSize: '110-120', available: true, priceRubles: 13000 },
        { sourceRowNumber: 8, container: 'ком', plantSize: '140-150', available: true, priceRubles: 18000 },
      ],
    )

    expect(specs).toEqual([
      { label: 'Контейнер', value: 'ком' },
      { label: 'Цвет', value: 'Голубая' },
    ])
  })

  it('falls back to a single base price without offers', () => {
    expect(buildOfferSizes({ priceRubles: 2800, offers: [] })).toEqual([
      {
        id: 'default',
        label: '1 шт',
        priceRubles: 2800,
        hint: 'Базовая позиция',
        available: true,
      },
    ])
    expect(offerSizesHaveChoices(buildOfferSizes({ priceRubles: 2800, offers: [] }))).toBe(false)
  })
})
