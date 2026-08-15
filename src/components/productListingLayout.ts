import type { ProductSpec } from './productSpecs'

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
      const matchesGroup = specs.some((spec) => spec.label === label && values.includes(spec.value))

      if (!matchesGroup) {
        return false
      }
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

export function collectSpecFilters(products: Array<{ specs: ProductSpec[] }>) {
  const groups = new Map<string, string[]>()

  for (const product of products) {
    for (const spec of product.specs) {
      const values = groups.get(spec.label) ?? []

      if (!values.includes(spec.value)) {
        values.push(spec.value)
      }

      groups.set(spec.label, values)
    }
  }

  return [...groups].map(([label, values]) => ({ label, values }))
}

export function collectNameGroupTags(
  products: Array<{ name: string }>,
  categoryLabel: string,
) {
  const counts = new Map<string, number>()

  for (const product of products) {
    const rest = product.name.startsWith(categoryLabel)
      ? product.name.slice(categoryLabel.length).trim()
      : product.name.trim()
    const group = rest.split(/\s+/)[0]

    if (!group) {
      continue
    }

    counts.set(group, (counts.get(group) ?? 0) + 1)
  }

  return [...counts]
    .filter(([, count]) => count > 1)
    .sort(([left], [right]) => left.localeCompare(right, 'ru'))
    .map(([label, count]) => ({ label, count }))
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
