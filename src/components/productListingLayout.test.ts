import { describe, expect, it } from 'vitest'
import { PRODUCT_CARD_SPECS_MAX, visibleProductSpecs } from './productSpecs'
import { buildLayoutProducts, collectNameGroupTags, collectSpecFilters, compareSpecFilterValues, filterLayoutProducts, filterProductsByTags, layoutFiltersEqual, listingNameGroupTags, sortLayoutProducts } from './productListingLayout'

describe('productListingLayout', () => {
  it('keeps at most three specs on the card and hides planting and leaves', () => {
    const products = buildLayoutProducts('Яблони')
    const longSpecs = products.find((product) => product.specs && product.specs.length > 3)
    const visible = visibleProductSpecs(longSpecs?.specs ?? [])

    expect(longSpecs?.specs?.length).toBeGreaterThan(PRODUCT_CARD_SPECS_MAX)
    expect(visible).toHaveLength(PRODUCT_CARD_SPECS_MAX)
    expect(visible.some((spec) => spec.label === 'Посадка')).toBe(false)
    expect(visible.some((spec) => spec.label === 'Листья')).toBe(false)
  })

  it('has no filter groups when only size, planting or leaves remain', () => {
    expect(
      collectSpecFilters([
        {
          specs: [
            { label: 'Размер', value: '40-60' },
            { label: 'Посадка', value: 'солнце' },
            { label: 'Листья', value: 'зелёные' },
          ],
        },
        { specs: [] },
      ]),
    ).toEqual([])
  })

  it('collects filterable specs and skips leaves, planting and size', () => {
    const products = buildLayoutProducts('Яблони')
    const filters = collectSpecFilters(products.filter((product) => product.specs).map((product) => ({
      specs: product.specs ?? [],
    })))
    const firstProductValues = visibleProductSpecs(products[0]?.specs ?? []).map((spec) => spec.value)

    expect(filters.map((group) => group.label)).toEqual([
      'Высота взрослого растения',
      'Контейнер',
      'Период цветения',
      'Цвет',
    ])
    expect(filters.find((group) => group.label === 'Посадка')).toBeUndefined()
    expect(filters.find((group) => group.label === 'Листья')).toBeUndefined()
    expect(filters.find((group) => group.label === 'Размер')).toBeUndefined()
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

  it('groups products by the second word tag', () => {

    expect(collectNameGroupTags([
      { name: 'Яблони карликовая зеленая', nameTag: 'карликовая' },
      { name: 'Яблони карликовая желтая', nameTag: 'карликовая' },
      { name: 'Яблони компактная', nameTag: 'компактная' },
      { name: 'Яблони шtамбовая красная', nameTag: 'штамбовая' },
      { name: 'Яблони шtамбовая белая', nameTag: 'штамбовая' },
      { name: 'Пион / красный', nameTag: '/' },
      { name: 'Пион и белый', nameTag: 'и' },
      { name: 'Лилейник #1', nameTag: '#1' },
      { name: 'Лилейник #2', nameTag: '#2' },
      { name: 'Лилейник 12', nameTag: '12' },
    ])).toEqual([
      { label: 'карликовая', count: 2 },
      { label: 'компактная', count: 1 },
      { label: 'штамбовая', count: 2 },
    ])
  })

  it('recounts name tags after spec filters and hides a single remaining tag', () => {
    const products = [
      { name: 'Сосна горная A', nameTag: 'горная', tag: null, specs: [{ label: 'Контейнер', value: 'C3' }] },
      { name: 'Сосна горная B', nameTag: 'горная', tag: null, specs: [{ label: 'Контейнер', value: 'C10' }] },
      { name: 'Сосна горная C', nameTag: 'горная', tag: null, specs: [{ label: 'Контейнер', value: 'C3' }] },
      { name: 'Сосна обыкновенная A', nameTag: 'обыкновенная', tag: null, specs: [{ label: 'Контейнер', value: 'C5' }] },
      { name: 'Сосна обыкновенная B', nameTag: 'обыкновенная', tag: null, specs: [{ label: 'Контейнер', value: 'C3' }] },
    ]

    expect(listingNameGroupTags(products, [], [])).toEqual([
      { label: 'горная', count: 3 },
      { label: 'обыкновенная', count: 2 },
    ])
    expect(listingNameGroupTags(products, [{ label: 'Контейнер', value: 'C10' }], [])).toEqual([])
    expect(listingNameGroupTags(products, [{ label: 'Контейнер', value: 'C3' }], [])).toEqual([
      { label: 'горная', count: 2 },
      { label: 'обыкновенная', count: 1 },
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

  it('filters products by promo and name tags', () => {
    const products = [
      { name: 'Ель колючая', tag: 'new' as const, nameTag: 'колючая' },
      { name: 'Ель обыкновенная', tag: null, nameTag: 'обыкновенная' },
      { name: 'Ель голубая', tag: 'sale' as const, nameTag: 'голубая' },
    ]

    expect(filterProductsByTags(products, ['new'], []).map((product) => product.name)).toEqual([
      'Ель колючая',
    ])
    expect(filterProductsByTags(products, [], ['колючая', 'голубая']).map((product) => product.name)).toEqual([
      'Ель колючая',
      'Ель голубая',
    ])
    expect(
      filterProductsByTags(products, ['sale'], ['голубая']).map((product) => product.name),
    ).toEqual(['Ель голубая'])
  })

  it('sorts spec filter values from smallest to largest', () => {
    const filters = collectSpecFilters([
      {
        specs: [
          { label: 'Контейнер', value: 'C3' },
          { label: 'Контейнер', value: 'C20' },
          { label: 'Контейнер', value: 'C10' },
          { label: 'Контейнер', value: 'ком' },
          { label: 'Контейнер', value: 'C7,5' },
          { label: 'Высота взрослого растения', value: 'h до 2 м, d до 2 м' },
          { label: 'Высота взрослого растения', value: 'h до 30 м, d до 10 м' },
          { label: 'Высота взрослого растения', value: 'h до 50 см, d до 2 м' },
          { label: 'Размер', value: '60-70' },
          { label: 'Посадка', value: 'солнце' },
          { label: 'Листья', value: 'зелёные' },
        ],
      },
    ])

    expect(filters.map((group) => group.label)).toEqual([
      'Контейнер',
      'Высота взрослого растения',
    ])
    expect(filters.find((group) => group.label === 'Контейнер')?.values).toEqual([
      'C3',
      'C7,5',
      'C10',
      'C20',
      'ком',
    ])
    expect(filters.find((group) => group.label === 'Высота взрослого растения')?.values).toEqual([
      'h до 50 см, d до 2 м',
      'h до 2 м, d до 2 м',
      'h до 30 м, d до 10 м',
    ])
    expect(compareSpecFilterValues('C3', 'C10')).toBeLessThan(0)
    expect(compareSpecFilterValues('C10', 'C3')).toBeGreaterThan(0)
    expect(compareSpecFilterValues('30', '60-70')).toBeLessThan(0)
  })

  it('dedupes Cyrillic and Latin container lookalikes in filters', () => {
    const filters = collectSpecFilters([
      {
        specs: [
          { label: 'Контейнер', value: 'С2' },
          { label: 'Контейнер', value: 'C2' },
          { label: 'Контейнер', value: 'С3' },
          { label: 'Контейнер', value: 'C3' },
          { label: 'Контейнер', value: 'Р9' },
          { label: 'Контейнер', value: 'P9' },
          { label: 'Контейнер', value: 'C10/С15' },
          { label: 'Контейнер', value: 'С3/С5' },
        ],
      },
    ])

    expect(filters.find((group) => group.label === 'Контейнер')?.values).toEqual([
      'C2',
      'C3',
      'C10/C15',
      'C3/C5',
      'P9',
    ])
  })

  it('matches products when filter uses Latin and spec has Cyrillic container', () => {
    const products = [
      { name: 'A', specs: [{ label: 'Контейнер', value: 'С3' }] },
      { name: 'B', specs: [{ label: 'Контейнер', value: 'C5' }] },
    ]

    expect(
      filterLayoutProducts(products, [{ label: 'Контейнер', value: 'C3' }]).map((product) => product.name),
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
