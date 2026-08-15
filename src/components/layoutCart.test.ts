import { describe, expect, it } from 'vitest'
import {
  addLayoutCartLines,
  layoutCartCount,
  layoutCartDiscount,
  layoutCartTotal,
  setLayoutCartQuantity,
  type LayoutCartLine,
} from './layoutCart'

const rose: LayoutCartLine = {
  id: '1:C3',
  productId: '1',
  name: 'Роза',
  priceRubles: 1900,
  quantity: 2,
}

const saleApple: LayoutCartLine = {
  id: 'similar-1:C3',
  productId: 'similar-1',
  name: 'Яблоня',
  tag: 'sale',
  priceRubles: 2400,
  quantity: 1,
}

describe('layoutCart', () => {
  it('merges the same line and sums quantity', () => {
    const items = addLayoutCartLines([rose], [{ ...rose, quantity: 1 }])

    expect(items).toHaveLength(1)
    expect(items[0]?.quantity).toBe(3)
    expect(layoutCartCount(items)).toBe(3)
    expect(layoutCartTotal(items)).toBe(5700)
  })

  it('adds a new line and removes it at zero', () => {
    const withNew = addLayoutCartLines([rose], [
      { id: '2', productId: '2', name: 'Грунт', priceRubles: 650, quantity: 1 },
    ])

    expect(withNew).toHaveLength(2)
    expect(layoutCartCount(withNew)).toBe(3)

    const removed = setLayoutCartQuantity(withNew, '2', 0)
    expect(removed).toEqual([rose])
  })

  it('sums sale discount from old prices', () => {
    expect(layoutCartDiscount([rose, saleApple])).toBe(600)
  })
})
