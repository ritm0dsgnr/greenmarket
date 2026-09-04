export type ProductSpec = {
  label: string
  value: string
}

export const PRODUCT_CARD_SPECS_MAX = 3

const cardHiddenSpecLabels = new Set(['Посадка', 'Листья'])

export function visibleProductSpecs(specs: ProductSpec[]) {
  return specs.filter((spec) => !cardHiddenSpecLabels.has(spec.label)).slice(0, PRODUCT_CARD_SPECS_MAX)
}
