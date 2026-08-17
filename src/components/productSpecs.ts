export type ProductSpec = {
  label: string
  value: string
}

export const PRODUCT_CARD_SPECS_MAX = 3

export function visibleProductSpecs(specs: ProductSpec[]) {
  return specs.slice(0, PRODUCT_CARD_SPECS_MAX)
}
