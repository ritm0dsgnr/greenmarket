import type { ProductSpec } from './productSpecs'
import { normalizeSpecFilterValue } from '../import/greenmarket-price/normalize-container'

type LayoutProductTag = 'new' | 'sale' | 'hit'

const layoutQualifiers = [
  'компактная зеленая',
  'компактная желтая',
  'карликовая зеленая',
  'карликовая желтая',
  'штамбовая красная',
  'штамбовая белая',
  'колоновидная зеленая',
  'колоновидная желтая',
  'крупномер зеленая',
  'крупномер желтая',
  'садовая красная',
  'садовая белая',
  'декоративная зеленая',
  'декоративная розовая',
  'каскадная белая',
  'каскадная розовая',
  'стелющаяся зеленая',
  'стелющаяся желтая',
  'раскидистая красная',
  'раскидистая белая',
  'почвопокровная',
  'махоровая',
  'узколистная',
  'широколистная',
  'зимостойкая',
] as const

const layoutTags: Array<LayoutProductTag | null> = [
  'new',
  'sale',
  null,
  'new',
  'sale',
  'hit',
  null,
  'new',
  'hit',
  'sale',
]

const layoutSpecs: ProductSpec[][] = [
  [
    { label: 'Высота взрослого растения', value: 'h до 60 см' },
    { label: 'Контейнер', value: 'C3' },
    { label: 'Период цветения', value: 'май-июнь' },
    { label: 'Цвет', value: 'белый' },
    { label: 'Посадка', value: 'солнце' },
  ],
  [
    { label: 'Высота взрослого растения', value: 'h до 80 см' },
    { label: 'Контейнер', value: 'C5' },
    { label: 'Цвет', value: 'розовый' },
  ],
  [
    { label: 'Высота взрослого растения', value: 'h до 60 см' },
    { label: 'Контейнер', value: 'C3' },
    { label: 'Цвет', value: 'красный' },
    { label: 'Посадка', value: 'солнце' },
  ],
  [
    { label: 'Высота взрослого растения', value: 'h до 80 см' },
    { label: 'Контейнер', value: 'C5' },
    { label: 'Период цветения', value: 'май-июнь' },
    { label: 'Цвет', value: 'белый' },
  ],
  [
    { label: 'Высота взрослого растения', value: 'h до 60 см' },
    { label: 'Контейнер', value: 'C7' },
    { label: 'Цвет', value: 'розовый' },
    { label: 'Посадка', value: 'полутень' },
  ],
  [
    { label: 'Высота взрослого растения', value: 'h до 120 см' },
    { label: 'Контейнер', value: 'C7' },
    { label: 'Период цветения', value: 'июнь-июль' },
    { label: 'Посадка', value: 'полутень' },
  ],
  [
    { label: 'Высота взрослого растения', value: 'h до 2 м' },
    { label: 'Контейнер', value: 'C10' },
    { label: 'Период цветения', value: 'июль-август' },
    { label: 'Цвет', value: 'красный' },
    { label: 'Посадка', value: 'тень' },
  ],
  [
    { label: 'Высота взрослого растения', value: 'h до 120 см' },
    { label: 'Контейнер', value: 'C5' },
    { label: 'Цвет', value: 'белый' },
    { label: 'Посадка', value: 'солнце' },
  ],
  [
    { label: 'Высота взрослого растения', value: 'h до 2 м' },
    { label: 'Контейнер', value: 'C7' },
    { label: 'Период цветения', value: 'июнь-июль' },
    { label: 'Цвет', value: 'желтый' },
  ],
  [
    { label: 'Высота взрослого растения', value: 'h до 120 см' },
    { label: 'Контейнер', value: 'C10' },
    { label: 'Цвет', value: 'розовый' },
    { label: 'Посадка', value: 'полутень' },
  ],
  [
    { label: 'Высота взрослого растения', value: 'h до 60 см' },
    { label: 'Контейнер', value: 'C5' },
    { label: 'Цвет', value: 'белый' },
    { label: 'Посадка', value: 'полутень' },
  ],
  [
    { label: 'Высота взрослого растения', value: 'h до 80 см' },
    { label: 'Период цветения', value: 'май-июнь' },
    { label: 'Цвет', value: 'розовый' },
  ],
  [
    { label: 'Контейнер', value: 'C3' },
    { label: 'Период цветения', value: 'июнь-июль' },
    { label: 'Посадка', value: 'солнце' },
    { label: 'Цвет', value: 'красный' },
  ],
  [
    { label: 'Высота взрослого растения', value: 'h до 120 см' },
    { label: 'Контейнер', value: 'C7' },
    { label: 'Период цветения', value: 'июль-август' },
    { label: 'Цвет', value: 'белый' },
    { label: 'Посадка', value: 'солнце' },
  ],
  [
    { label: 'Высота взрослого растения', value: 'h до 2 м' },
    { label: 'Контейнер', value: 'C10' },
    { label: 'Посадка', value: 'тень' },
  ],
  [
    { label: 'Высота взрослого растения', value: 'h до 80 см' },
    { label: 'Контейнер', value: 'C5' },
    { label: 'Период цветения', value: 'май-июнь' },
    { label: 'Цвет', value: 'розовый' },
    { label: 'Посадка', value: 'полутень' },
  ],
  [
    { label: 'Высота взрослого растения', value: 'h до 60 см' },
    { label: 'Контейнер', value: 'C3' },
    { label: 'Цвет', value: 'белый' },
  ],
  [
    { label: 'Высота взрослого растения', value: 'h до 80 см' },
    { label: 'Контейнер', value: 'C5' },
    { label: 'Период цветения', value: 'июнь-июль' },
    { label: 'Посадка', value: 'солнце' },
  ],
  [
    { label: 'Контейнер', value: 'C7' },
    { label: 'Цвет', value: 'розовый' },
    { label: 'Посадка', value: 'полутень' },
  ],
  [
    { label: 'Высота взрослого растения', value: 'h до 120 см' },
    { label: 'Контейнер', value: 'C10' },
    { label: 'Период цветения', value: 'май-июнь' },
    { label: 'Цвет', value: 'красный' },
    { label: 'Посадка', value: 'тень' },
  ],
  [
    { label: 'Высота взрослого растения', value: 'h до 2 м' },
    { label: 'Контейнер', value: 'C5' },
    { label: 'Цвет', value: 'белый' },
  ],
  [
    { label: 'Высота взрослого растения', value: 'h до 60 см' },
    { label: 'Период цветения', value: 'июль-август' },
    { label: 'Посадка', value: 'солнце' },
  ],
  [
    { label: 'Контейнер', value: 'C3' },
    { label: 'Цвет', value: 'розовый' },
    { label: 'Посадка', value: 'полутень' },
    { label: 'Период цветения', value: 'июнь-июль' },
  ],
  [
    { label: 'Высота взрослого растения', value: 'h до 80 см' },
    { label: 'Контейнер', value: 'C7' },
    { label: 'Цвет', value: 'красный' },
    { label: 'Посадка', value: 'тень' },
  ],
  [
    { label: 'Высота взрослого растения', value: 'h до 120 см' },
    { label: 'Контейнер', value: 'C5' },
    { label: 'Период цветения', value: 'май-июнь' },
    { label: 'Цвет', value: 'белый' },
  ],
  [
    { label: 'Контейнер', value: 'C7' },
    { label: 'Цвет', value: 'розовый' },
    { label: 'Посадка', value: 'полутень' },
  ],
  [
    { label: 'Высота взрослого растения', value: 'h до 2 м' },
    { label: 'Контейнер', value: 'C10' },
    { label: 'Период цветения', value: 'июль-август' },
    { label: 'Посадка', value: 'солнце' },
  ],
]

export const layoutTagFilters = [
  { id: 'new' as const, label: 'New' },
  { id: 'sale' as const, label: 'Sale' },
  { id: 'hit' as const, label: 'Hit' },
]

export const layoutSortOptions = [
  { id: 'featured' as const, label: 'По умолчанию' },
  { id: 'alpha' as const, label: 'По алфавиту' },
  { id: 'cheap' as const, label: 'Дешевле' },
  { id: 'expensive' as const, label: 'Дороже' },
]

export type LayoutSortId = (typeof layoutSortOptions)[number]['id']

function tagRank(tag: LayoutProductTag | null) {
  if (tag === 'sale') {
    return 0
  }

  if (tag === 'hit') {
    return 1
  }

  if (tag === 'new') {
    return 2
  }

  return 3
}

function compareNames(left: string, right: string) {
  return left.localeCompare(right, 'ru')
}

export function sortLayoutProducts<
  T extends {
    name: string
    tag: LayoutProductTag | null
    available: boolean
    priceRubles?: number
  },
>(products: T[], sort: LayoutSortId) {
  return [...products].sort((left, right) => {
    if (left.available !== right.available) {
      return left.available ? -1 : 1
    }

    if (sort === 'featured') {
      const byTag = tagRank(left.tag) - tagRank(right.tag)

      if (byTag !== 0) {
        return byTag
      }
    }

    if (sort === 'cheap' || sort === 'expensive') {
      const byPrice = (left.priceRubles ?? 0) - (right.priceRubles ?? 0)

      if (byPrice !== 0) {
        return sort === 'cheap' ? byPrice : -byPrice
      }
    }

    return compareNames(left.name, right.name)
  })
}

export function filterLayoutProducts<T extends { specs?: ProductSpec[] }>(
  products: T[],
  selected: Array<{ label: string; value: string }>,
) {
  if (selected.length === 0) {
    return products
  }

  const groups = new Map<string, string[]>()

  for (const item of selected) {
    const values = groups.get(item.label) ?? []

    if (!values.includes(item.value)) {
      values.push(item.value)
    }

    groups.set(item.label, values)
  }

  return products.filter((product) => {
    const specs = product.specs ?? []

    for (const [label, values] of groups) {
      const selected = values.map((value) => normalizeSpecFilterValue(label, value))
      const matchesGroup = specs.some(
        (spec) =>
          spec.label === label &&
          selected.includes(normalizeSpecFilterValue(spec.label, spec.value)),
      )

      if (!matchesGroup) {
        return false
      }
    }

    return true
  })
}

export function filterProductsByTags<
  T extends {
    tag: LayoutProductTag | null
    nameTag?: string
  },
>(products: T[], promoTags: readonly LayoutProductTag[], nameTags: readonly string[]) {
  return products.filter((product) => {
    if (promoTags.length > 0 && (!product.tag || !promoTags.includes(product.tag))) {
      return false
    }

    if (nameTags.length > 0 && (!product.nameTag || !nameTags.includes(product.nameTag))) {
      return false
    }

    return true
  })
}

export function layoutFiltersEqual(
  left: Array<{ label: string; value: string }>,
  right: Array<{ label: string; value: string }>,
) {
  const serialize = (items: Array<{ label: string; value: string }>) =>
    [...items]
      .map((item) => `${item.label}\t${item.value}`)
      .sort()
      .join('\n')

  return serialize(left) === serialize(right)
}

function toCentimeters(amount: number, unit: string | undefined) {
  if (unit?.startsWith('м')) {
    return amount * 100
  }

  return amount
}

function measureInCm(normalized: string, axis: 'h' | 'd') {
  const match = normalized.match(
    new RegExp(`${axis}\\s*(?:до\\s*)?(\\d+(?:\\.\\d+)?)(?:\\s*-\\s*(\\d+(?:\\.\\d+)?))?\\s*(см|м)?`),
  )

  if (!match?.[1]) {
    return null
  }

  const unit = match[3]
  const first = parseFloat(match[1])
  const second = match[2] ? parseFloat(match[2]) : first

  return toCentimeters(Math.max(first, second), unit)
}

function specFilterSortKey(value: string) {
  const normalized = value.replace(/,/g, '.').trim().toLowerCase()

  const containerMatch = normalized.match(/^[cс](\d+(?:\.\d+)?)$/)
  if (containerMatch?.[1]) {
    return parseFloat(containerMatch[1])
  }

  const heightCm = measureInCm(normalized, 'h')
  if (heightCm !== null) {
    return heightCm
  }

  const diameterCm = measureInCm(normalized, 'd')
  if (diameterCm !== null) {
    return diameterCm
  }

  const embeddedRange = normalized.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/)
  if (embeddedRange?.[1] && embeddedRange[2]) {
    return Math.max(parseFloat(embeddedRange[1]), parseFloat(embeddedRange[2]))
  }

  const rangeMatch = normalized.match(/^(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)$/)
  if (rangeMatch?.[1] && rangeMatch[2]) {
    return Math.max(parseFloat(rangeMatch[1]), parseFloat(rangeMatch[2]))
  }

  const singleMatch = normalized.match(/^(\d+(?:\.\d+)?)$/)
  if (singleMatch?.[1]) {
    return parseFloat(singleMatch[1])
  }

  return null
}

export function compareSpecFilterValues(left: string, right: string) {
  const leftKey = specFilterSortKey(left)
  const rightKey = specFilterSortKey(right)

  if (leftKey !== null && rightKey !== null) {
    if (leftKey !== rightKey) {
      return leftKey - rightKey
    }

    return left.localeCompare(right, 'ru')
  }

  if (leftKey !== null) {
    return -1
  }

  if (rightKey !== null) {
    return 1
  }

  return left.localeCompare(right, 'ru')
}

export function collectSpecFilters(products: Array<{ specs: ProductSpec[] }>) {
  const groups = new Map<string, string[]>()
  const excludedLabels = new Set(['Листья', 'Посадка', 'Размер'])

  for (const product of products) {
    for (const spec of product.specs) {
      if (excludedLabels.has(spec.label)) {
        continue
      }

      const value = normalizeSpecFilterValue(spec.label, spec.value)
      const values = groups.get(spec.label) ?? []

      if (!values.includes(value)) {
        values.push(value)
      }

      groups.set(spec.label, values)
    }
  }

  return [...groups].map(([label, values]) => ({
    label,
    values: [...values].sort(compareSpecFilterValues),
  }))
}

export function isListingNameTag(value: string) {
  const letters = value.trim().match(/\p{L}/gu) ?? []

  return letters.length >= 2
}

export function collectNameGroupTags(products: Array<{ name: string; nameTag?: string }>) {
  const counts = new Map<string, number>()

  for (const product of products) {
    const group = product.nameTag?.trim()

    if (!group || !isListingNameTag(group)) {
      continue
    }

    counts.set(group, (counts.get(group) ?? 0) + 1)
  }

  return [...counts]
    .sort(([left], [right]) => left.localeCompare(right, 'ru'))
    .map(([label, count]) => ({ label, count }))
}

/** Name tags for the listing toolbar: after spec + promo facets, not the full category. */
export function listingNameGroupTags<
  T extends { name: string; nameTag?: string; specs?: ProductSpec[]; tag: LayoutProductTag | null },
>(
  products: T[],
  specFilters: Array<{ label: string; value: string }>,
  promoTags: readonly LayoutProductTag[],
  selectedNameTags: readonly string[] = [],
) {
  const groups = collectNameGroupTags(
    filterProductsByTags(filterLayoutProducts(products, specFilters), promoTags, []),
  )

  if (groups.length < 2) {
    return []
  }

  const present = new Set(groups.map((group) => group.label))
  const selectedEmpty = selectedNameTags
    .filter((label) => !present.has(label))
    .map((label) => ({ label, count: 0 }))

  return [...groups, ...selectedEmpty].sort((left, right) => left.label.localeCompare(right.label, 'ru'))
}

const layoutPrices = [
  1200, 1650, 1900, 2400, 2800, 3200, 3600, 4100, 4500, 5200, 5800, 6400, 7200, 8500, 9800, 11000,
  12500, 14800, 16200, 18500, 21000, 24600, 28000, 32500, 36000,
] as const

export function buildLayoutProducts(label: string) {
  return layoutQualifiers.map((qualifier, index) => ({
    id: String(index + 1),
    tag: layoutTags[index] ?? null,
    available: index !== 2 && index !== 6,
    name: `${label} ${qualifier}`,
    latin: label,
    specs: layoutSpecs[index] ?? [],
    priceRubles: layoutPrices[index] ?? layoutPrices[index % layoutPrices.length],
  }))
}
