import { describe, expect, it } from 'vitest'
import {
  defaultLayoutSizeId,
  emptySizeQuantities,
  hasLayoutSizeVariants,
  layoutCardSizes,
  layoutLinePrice,
  layoutQuantityTotal,
  layoutSaleOldPrice,
} from './productCardSizes'

describe('productCardSizes', () => {
  const containerSpecs = [{ label: 'Контейнер', value: 'C3' }]

  it('gives each container size its own price', () => {
    const sizes = layoutCardSizes(1200, containerSpecs)
    const prices = sizes.map((size) => size.priceRubles)

    expect(sizes.map((size) => size.id)).toEqual(['C3', 'C5', 'C7', 'C10'])
    expect(new Set(prices).size).toBe(4)
    expect(prices).toEqual([...prices].sort((left, right) => left - right))
  })

  it('has no size variants without a container spec', () => {
    expect(hasLayoutSizeVariants(undefined)).toBe(false)
    expect(layoutCardSizes(1200)).toEqual([])
    expect(layoutCardSizes(1200, [{ label: 'Цвет', value: 'белый' }])).toEqual([])
  })

  it('uses the card container spec as the default size', () => {
    expect(defaultLayoutSizeId([{ label: 'Контейнер', value: 'C7' }])).toBe('C7')
    expect(defaultLayoutSizeId([{ label: 'Цвет', value: 'белый' }])).toBe('C3')
  })

  it('sums prices across several sizes', () => {
    const sizes = layoutCardSizes(1000, containerSpecs)
    const quantities = emptySizeQuantities()
    quantities.C3 = 2
    quantities.C5 = 1

    expect(layoutLinePrice(sizes, quantities)).toBe(1000 * 2 + 1800)
    expect(layoutQuantityTotal(quantities)).toBe(3)
  })

  it('shows an old price only for sale items', () => {
    expect(layoutSaleOldPrice(2400, 'new')).toBeUndefined()
    expect(layoutSaleOldPrice(2400, 'hit')).toBeUndefined()
    expect(layoutSaleOldPrice(2400, null)).toBeUndefined()
    expect(layoutSaleOldPrice(2400, 'sale')).toBe(3000)
    expect(layoutSaleOldPrice(2400, 'sale', 4000)).toBe(4000)
    expect(layoutSaleOldPrice(2400, 'sale', 2000)).toBe(3000)
  })
})
