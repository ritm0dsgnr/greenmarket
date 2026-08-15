import { describe, expect, it } from 'vitest'
import { PRODUCT_CARD_SPECS_MAX, visibleProductSpecs } from './productSpecs'
import { buildLayoutProducts, collectNameGroupTags, collectSpecFilters, filterLayoutProducts, layoutFiltersEqual, sortLayoutProducts } from './productListingLayout'

describe('productListingLayout', () => {
  it('keeps at most three specs on the card', () => {
    const products = buildLayoutProducts('Яблони')
    const longSpecs = products.find((product) => product.specs && product.specs.length > 3)

    expect(longSpecs?.specs?.length).toBeGreaterThan(PRODUCT_CARD_SPECS_MAX)
    expect(visibleProductSpecs(longSpecs?.specs ?? [])).toHaveLength(PRODUCT_CARD_SPECS_MAX)
  })

  it('collects every spec value for filters, including those hidden on the card', () => {
    const products = buildLayoutProducts('Яблони')
    const filters = collectSpecFilters(products.filter((product) => product.specs).map((product) => ({
      specs: product.specs ?? [],
    })))
    const planting = filters.find((group) => group.label === 'Посадка')
    const firstProductValues = visibleProductSpecs(products[0]?.specs ?? []).map((spec) => spec.value)

    expect(filters.map((group) => group.label)).toEqual([
      'Высота взрослого растения',
      'Контейнер',
      'Период цветения',
      'Цвет',
      'Посадка',
    ])
    expect(planting?.values).toEqual(['солнце', 'полутень', 'тень'])
    expect(products[0]?.specs?.some((spec) => spec.label === 'Посадка')).toBe(true)
    expect(firstProductValues).not.toContain('солнце')
  })

  it('puts unavailable products last for every sort', () => {
    const products = [
      { id: '1', name: 'Аура', tag: 'new' as const, available: false },
      { id: '2', name: 'Белла', tag: 'sale' as const, available: true },
      { id: '3', name: 'Виола', tag: null, available: true },
    ]

    expect(sortLayoutProducts(products, 'featured').map((product) => product.name)).toEqual([
      'Белла',
      'Виола',
      'Аура',
    ])
    expect(sortLayoutProducts(products, 'alpha').map((product) => product.name)).toEqual([
      'Белла',
      'Виола',
      'Аура',
    ])
  })

  it('orders featured as sale, hit, new, then the rest alphabetically', () => {
    const products = [
      { id: '1', name: 'Вишня', tag: 'new' as const, available: true },
      { id: '2', name: 'Груша', tag: null, available: true },
      { id: '3', name: 'Айва', tag: 'hit' as const, available: true },
      { id: '4', name: 'Слива', tag: 'sale' as const, available: true },
      { id: '5', name: 'Яблоня', tag: 'sale' as const, available: true },
      { id: '6', name: 'Алыча', tag: null, available: true },
    ]

    expect(sortLayoutProducts(products, 'featured').map((product) => product.name)).toEqual([
      'Слива',
      'Яблоня',
      'Айва',
      'Вишня',
      'Алыча',
      'Груша',
    ])
  })

  it('sorts every available product alphabetically in alpha mode', () => {
    const products = [
      { id: '1', name: 'Вишня', tag: 'new' as const, available: true },
      { id: '2', name: 'Слива', tag: 'sale' as const, available: true },
      { id: '3', name: 'Айва', tag: 'hit' as const, available: true },
      { id: '4', name: 'Груша', tag: null, available: true },
    ]

    expect(sortLayoutProducts(products, 'alpha').map((product) => product.name)).toEqual([
      'Айва',
      'Вишня',
      'Груша',
      'Слива',
    ])
  })

  it('sorts available products by price in cheap and expensive modes', () => {
    const products = [
      { id: '1', name: 'Вишня', tag: 'new' as const, available: true, priceRubles: 4500 },
      { id: '2', name: 'Слива', tag: 'sale' as const, available: true, priceRubles: 1200 },
      { id: '3', name: 'Айва', tag: 'hit' as const, available: true, priceRubles: 2800 },
      { id: '4', name: 'Груша', tag: null, available: false, priceRubles: 900 },
    ]

    expect(sortLayoutProducts(products, 'cheap').map((product) => product.name)).toEqual([
      'Слива',
      'Айва',
      'Вишня',
      'Груша',
    ])
    expect(sortLayoutProducts(products, 'expensive').map((product) => product.name)).toEqual([
      'Вишня',
      'Айва',
      'Слива',
      'Груша',
    ])
  })

  it('turns a duplicated second word into a group tag with a count', () => {
    const products = [
      { name: 'Яблони карликовая зеленая' },
      { name: 'Яблони карликовая желтая' },
      { name: 'Яблони компактная' },
      { name: 'Яблони штамбовая красная' },
      { name: 'Яблони штамбовая белая' },
    ]

    expect(collectNameGroupTags(products, 'Яблони')).toEqual([
      { label: 'карликовая', count: 2 },
      { label: 'штамбовая', count: 2 },
    ])
  })

  it('counts products that match selected spec filters', () => {
    const products = [
      { name: 'A', specs: [{ label: 'Контейнер', value: 'C3' }, { label: 'Посадка', value: 'солнце' }] },
      { name: 'B', specs: [{ label: 'Контейнер', value: 'C5' }, { label: 'Посадка', value: 'солнце' }] },
      { name: 'C', specs: [{ label: 'Контейнер', value: 'C3' }, { label: 'Посадка', value: 'тень' }] },
    ]

    expect(filterLayoutProducts(products, [{ label: 'Контейнер', value: 'C3' }]).map((product) => product.name)).toEqual([
      'A',
      'C',
    ])
    expect(
      filterLayoutProducts(products, [
        { label: 'Контейнер', value: 'C3' },
        { label: 'Контейнер', value: 'C5' },
      ]).map((product) => product.name),
    ).toEqual(['A', 'B', 'C'])
    expect(
      filterLayoutProducts(products, [
        { label: 'Контейнер', value: 'C3' },
        { label: 'Посадка', value: 'солнце' },
      ]).map((product) => product.name),
    ).toEqual(['A'])
  })

  it('treats the same spec filters as equal regardless of order', () => {
    expect(
      layoutFiltersEqual(
        [
          { label: 'Контейнер', value: 'C5' },
          { label: 'Контейнер', value: 'C3' },
        ],
        [
          { label: 'Контейнер', value: 'C3' },
          { label: 'Контейнер', value: 'C5' },
        ],
      ),
    ).toBe(true)
    expect(
      layoutFiltersEqual([{ label: 'Контейнер', value: 'C3' }], [{ label: 'Контейнер', value: 'C5' }]),
    ).toBe(false)
  })
})
