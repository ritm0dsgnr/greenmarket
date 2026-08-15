import { layoutSaleOldPrice } from './productCardSizes'

export type LayoutCartLine = {
  id: string
  productId: string
  name: string
  latin?: string
  sizeLabel?: string
  tag?: 'sale' | 'new' | 'hit' | null
  oldPriceRubles?: number
  priceRubles: number
  quantity: number
  href?: string
}

export function layoutCartCount(items: LayoutCartLine[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0)
}

export function layoutCartTotal(items: LayoutCartLine[]) {
  return items.reduce((sum, item) => sum + item.priceRubles * item.quantity, 0)
}

export function layoutCartLineOldPrice(item: LayoutCartLine) {
  return layoutSaleOldPrice(item.priceRubles, item.tag, item.oldPriceRubles)
}

export function layoutCartDiscount(items: LayoutCartLine[]) {
  return items.reduce((sum, item) => {
    const oldPrice = layoutCartLineOldPrice(item)

    if (oldPrice === undefined) {
      return sum
    }

    return sum + (oldPrice - item.priceRubles) * item.quantity
  }, 0)
}

export function addLayoutCartLines(items: LayoutCartLine[], incoming: LayoutCartLine[]) {
  let next = items

  for (const line of incoming) {
    if (line.quantity <= 0) {
      continue
    }

    const current = next.find((item) => item.id === line.id)

    if (current) {
      next = next.map((item) =>
        item.id === line.id ? { ...item, quantity: item.quantity + line.quantity } : item,
      )
      continue
    }

    next = [...next, line]
  }

  return next
}

export function setLayoutCartQuantity(items: LayoutCartLine[], id: string, quantity: number) {
  if (quantity <= 0) {
    return items.filter((item) => item.id !== id)
  }

  return items.map((item) => (item.id === id ? { ...item, quantity } : item))
}
