import type { ProductSpec } from './productSpecs'

export const layoutSizeIds = ['C3', 'C5', 'C7', 'C10'] as const

export type LayoutSizeId = (typeof layoutSizeIds)[number]

const layoutSizeSteps: Array<{ id: LayoutSizeId; extra: number }> = [
  { id: 'C3', extra: 0 },
  { id: 'C5', extra: 800 },
  { id: 'C7', extra: 1600 },
  { id: 'C10', extra: 2800 },
]

export function formatLayoutPrice(rubles: number) {
  return `${String(rubles).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0')}\u00a0₽`
}

export function layoutSaleOldPrice(
  priceRubles: number,
  tag: 'sale' | 'new' | 'hit' | null | undefined,
  oldPriceRubles?: number,
) {
  if (tag !== 'sale') {
    return undefined
  }

  if (oldPriceRubles !== undefined && oldPriceRubles > priceRubles) {
    return oldPriceRubles
  }

  return priceRubles + Math.max(500, Math.round((priceRubles * 0.25) / 100) * 100)
}

function isLayoutSizeId(value: string): value is LayoutSizeId {
  return (layoutSizeIds as readonly string[]).includes(value)
}

export function hasLayoutSizeVariants(specs: ProductSpec[] | undefined) {
  return Boolean(specs?.some((spec) => spec.label === 'Контейнер' && isLayoutSizeId(spec.value)))
}

export function layoutCardSizes(priceRubles: number, specs?: ProductSpec[]) {
  if (!hasLayoutSizeVariants(specs)) {
    return []
  }

  return layoutSizeSteps.map((step) => ({
    id: step.id,
    label: step.id,
    priceRubles: priceRubles + step.extra,
  }))
}

export function emptySizeQuantities(): Record<LayoutSizeId, number> {
  return {
    C3: 0,
    C5: 0,
    C7: 0,
    C10: 0,
  }
}

export function layoutQuantityTotal(quantities: Record<LayoutSizeId, number>) {
  return layoutSizeIds.reduce((sum, id) => sum + (quantities[id] ?? 0), 0)
}

export function layoutLinePrice(
  sizes: Array<{ id: LayoutSizeId; priceRubles: number }>,
  quantities: Record<LayoutSizeId, number>,
) {
  return sizes.reduce((sum, size) => sum + size.priceRubles * (quantities[size.id] ?? 0), 0)
}

export function defaultLayoutSizeId(specs: ProductSpec[] | undefined): LayoutSizeId {
  const container = specs?.find((spec) => spec.label === 'Контейнер')?.value

  for (const id of layoutSizeIds) {
    if (container === id) {
      return id
    }
  }

  return 'C3'
}
