import type { ProductSpec } from '@/components/productSpecs'
import {
  extractNameParts,
  preferYoLabel,
  subcategoryGroupKey,
  subcategoryLabelFromFirstWord,
} from './name-parts'
import { normalizeContainerValue } from './normalize-container'
import { buildOfferSizes, specsWithoutVariantAxes } from './offer-sizes'
import { uniqueSlug } from './slugify'
import type {
  PriceCatalogCategory,
  PriceCatalogGroup,
  PriceCatalogProduct,
  PriceCatalogSnapshot,
  PriceCatalogSubcategory,
  PriceOffer,
  ProductCardFromPrice,
} from './types'

type ColumnMap = {
  tag?: number
  name?: number
  availability?: number
  latin?: number
  description?: number
  adultSize?: number
  flowering?: number
  color?: number
  leaves?: number
  planting?: number
  container?: number
  plantSize?: number
  sizeAlt?: number
  price?: number
}

type ParsedRow = {
  rowNumber: number
  tag?: string
  name?: string
  availability?: string
  latin?: string
  description?: string
  adultSize?: string
  flowering?: string
  color?: string
  leaves?: string
  planting?: string
  container?: string
  plantSize?: string
  sizeAlt?: string
  priceRubles?: number
}

const serviceLine =
  /^(адрес|e-mail|instagram|вконтакте|телефон|садовый центр|прайс-лист|уважаемые|по позициям)/i

function cellText(value: unknown) {
  if (value == null) {
    return ''
  }

  return String(value).replace(/\s+/g, ' ').trim()
}

function parsePrice(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
    return Math.round(value)
  }

  const text = cellText(value).replace(/\s/g, '').replace(',', '.')

  if (!text) {
    return undefined
  }

  const parsed = Number(text)

  if (!Number.isFinite(parsed) || parsed < 0) {
    return undefined
  }

  return Math.round(parsed)
}

function rowHasData(row: unknown[]) {
  return row.some((cell) => cellText(cell) !== '')
}

function isServiceRow(a: string, b: string) {
  const probe = (a || b).toLowerCase()

  if (!probe) {
    return false
  }

  return (
    serviceLine.test(probe) ||
    probe.includes('@') ||
    probe.includes('http') ||
    probe.includes('mail.ru')
  )
}

function findHeaderRow(rows: unknown[][]) {
  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index] ?? []

    for (let col = 0; col < row.length; col += 1) {
      const text = cellText(row[col]).toLowerCase()

      if (
        text === 'наименование' ||
        text.startsWith('наименование') ||
        text === 'название' ||
        text.startsWith('название')
      ) {
        const columns: ColumnMap = { name: col }

        for (let scan = 0; scan < row.length; scan += 1) {
          const header = cellText(row[scan]).toLowerCase()

          if (!header) {
            continue
          }

          if (header === 'тег' || header === 'теги') {
            columns.tag = scan
          } else if (header.includes('латин')) {
            columns.latin = scan
          } else if (header.includes('описан')) {
            columns.description = scan
          } else if (header.includes('налич')) {
            columns.availability = scan
          } else if (header.includes('взросл')) {
            columns.adultSize = scan
          } else if (header.includes('цветен')) {
            columns.flowering = scan
          } else if (header === 'цвет соцветий' || header === 'цвет хвои' || header === 'цвет') {
            columns.color = scan
          } else if (header.includes('лист')) {
            columns.leaves = scan
          } else if (header.includes('посад') || header.includes('уход')) {
            columns.planting = scan
          } else if (header.includes('контейнер')) {
            columns.container = scan
          } else if (header.includes('высота')) {
            columns.plantSize = scan
          } else if (header === 'размер' || header.startsWith('размер ')) {
            columns.sizeAlt = scan
          } else if (header.includes('цена')) {
            columns.price = scan
          }
        }

        return { rowIndex: index, columns }
      }
    }
  }

  return null
}

function readRow(row: unknown[], rowNumber: number, columns: ColumnMap): ParsedRow {
  const read = (key: keyof ColumnMap) => {
    const index = columns[key]

    if (index == null) {
      return ''
    }

    return cellText(row[index])
  }

  return {
    rowNumber,
    tag: read('tag') || undefined,
    name: read('name') || undefined,
    availability: read('availability') || undefined,
    latin: read('latin') || undefined,
    description: read('description') || undefined,
    adultSize: read('adultSize') || undefined,
    flowering: read('flowering') || undefined,
    color: read('color') || undefined,
    leaves: read('leaves') || undefined,
    planting: read('planting') || undefined,
    container: read('container') || undefined,
    plantSize: read('plantSize') || read('sizeAlt') || undefined,
    sizeAlt: read('sizeAlt') || undefined,
    priceRubles: parsePrice(columns.price == null ? undefined : row[columns.price]),
  }
}

function isSubcategoryRow(row: unknown[], columns: ColumnMap, headerIndex: number, rowIndex: number) {
  if (rowIndex <= headerIndex) {
    return false
  }

  const a = cellText(row[0])
  const name = columns.name == null ? '' : cellText(row[columns.name])

  if (!a || name) {
    return false
  }

  if (isServiceRow(a, name)) {
    return false
  }

  const hasPrice = columns.price != null && parsePrice(row[columns.price]) != null
  const hasContainer = columns.container != null && cellText(row[columns.container]) !== ''

  return !hasPrice && !hasContainer
}

function detectSubcategoryLabels(rows: unknown[][], columns: ColumnMap, headerIndex: number) {
  const labels: Array<{ rowIndex: number; label: string }> = []

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index] ?? []
    const a = cellText(row[0])

    if (index < headerIndex && a && !isServiceRow(a, cellText(row[1]))) {
      const name = columns.name == null ? '' : cellText(row[columns.name])

      if (!name) {
        labels.push({ rowIndex: index, label: a })
      }
    }

    if (isSubcategoryRow(row, columns, headerIndex, index)) {
      labels.push({ rowIndex: index, label: a })
    }
  }

  return labels
}

function availabilityFromParts(...parts: Array<string | undefined>) {
  const probe = parts.filter(Boolean).join(' ').toLowerCase()

  if (!probe.trim()) {
    return true
  }

  return !probe.includes('нет в наличии')
}

function resolveOfferAvailability(parsed: ParsedRow) {
  return availabilityFromParts(
    parsed.availability,
    parsed.container,
    parsed.plantSize,
    parsed.sizeAlt,
  )
}

function isAvailabilityNote(value?: string) {
  if (!value) {
    return false
  }

  const normalized = value.trim().toLowerCase()

  return (
    normalized.includes('нет в наличии') ||
    normalized.startsWith('с ') ||
    normalized === 'под заказ' ||
    normalized.includes('ожидается')
  )
}

function isContainerValue(value?: string) {
  if (!value || isAvailabilityNote(value)) {
    return false
  }

  return true
}

function buildSpecs(parsed: ParsedRow): ProductSpec[] {
  const specs: ProductSpec[] = []

  const push = (label: string, value?: string) => {
    if (value) {
      specs.push({ label, value })
    }
  }

  push('Высота взрослого растения', parsed.adultSize)
  if (isContainerValue(parsed.container) && parsed.container) {
    push('Контейнер', normalizeContainerValue(parsed.container))
  }
  const plantSize = parsed.plantSize ?? parsed.sizeAlt
  if (plantSize && !isAvailabilityNote(plantSize)) {
    push('Размер', plantSize)
  }
  push('Период цветения', parsed.flowering)
  push('Цвет', parsed.color)
  push('Листья', parsed.leaves)
  push('Посадка', parsed.planting)

  return specs
}

export function cardTagFromLabel(tag?: string): 'new' | 'sale' | 'hit' | null {
  if (!tag) {
    return null
  }

  const normalized = tag.toLowerCase()

  if (normalized.includes('хит')) {
    return 'hit'
  }

  if (normalized.includes('new') || normalized.includes('нов')) {
    return 'new'
  }

  if (normalized.includes('sale') || normalized.includes('акц')) {
    return 'sale'
  }

  return null
}

function mergeProductOffer(product: PriceCatalogProduct, parsed: ParsedRow) {
  const plantSizeRaw = parsed.plantSize ?? parsed.sizeAlt
  const available = resolveOfferAvailability(parsed)
  const availabilityRaw =
    parsed.availability ||
    (isAvailabilityNote(parsed.container) ? parsed.container : undefined) ||
    (isAvailabilityNote(plantSizeRaw) ? plantSizeRaw : undefined)

  const offer: PriceOffer = {
    sourceRowNumber: parsed.rowNumber,
    container:
      isContainerValue(parsed.container) && parsed.container
        ? normalizeContainerValue(parsed.container)
        : undefined,
    plantSize: plantSizeRaw && !isAvailabilityNote(plantSizeRaw) ? plantSizeRaw : undefined,
    availabilityRaw,
    available,
    priceRubles: parsed.priceRubles,
  }

  product.offers.push(offer)

  // Card/product is in stock when at least one size/offer is available.
  product.available = product.offers.some((item) => item.available)

  const availablePrices = product.offers
    .filter((item) => item.available && item.priceRubles != null)
    .map((item) => item.priceRubles!)
  const anyPrices = product.offers
    .filter((item) => item.priceRubles != null)
    .map((item) => item.priceRubles!)

  product.priceRubles =
    availablePrices.length > 0
      ? Math.min(...availablePrices)
      : anyPrices.length > 0
        ? Math.min(...anyPrices)
        : undefined

  for (const spec of buildSpecs(parsed)) {
    const exists = product.specs.some(
      (item) => item.label === spec.label && item.value === spec.value,
    )

    if (!exists) {
      product.specs.push(spec)
    }
  }
}

function createProduct(
  parsed: ParsedRow,
  sheetSlug: string,
  nameTagSource: 'first' | 'second' = 'second',
): PriceCatalogProduct {
  const name = parsed.name ?? 'Без названия'
  const parts = extractNameParts(name)
  const nameTag = nameTagSource === 'first' ? parts.firstWord : parts.secondWord

  const product: PriceCatalogProduct = {
    id: `${sheetSlug}-${parsed.rowNumber}`,
    sourceRowNumber: parsed.rowNumber,
    name,
    nameTag: nameTag || undefined,
    latin: parsed.latin,
    description: parsed.description,
    tagLabel: parsed.tag,
    available: resolveOfferAvailability(parsed),
    priceRubles: undefined,
    specs: [],
    offers: [],
  }

  mergeProductOffer(product, parsed)
  return product
}

function parseProductRows(
  rows: unknown[][],
  header: { rowIndex: number; columns: ColumnMap },
  sheetSlug: string,
  start: number,
  end: number,
  nameTagSource: 'first' | 'second' = 'second',
) {
  const products: PriceCatalogProduct[] = []
  let currentProduct: PriceCatalogProduct | null = null

  for (let rowIndex = start; rowIndex < end; rowIndex += 1) {
    const row = rows[rowIndex] ?? []

    if (!rowHasData(row)) {
      continue
    }

    if (isSubcategoryRow(row, header.columns, header.rowIndex, rowIndex)) {
      continue
    }

    const parsed = readRow(row, rowIndex + 1, header.columns)
    const hasName = Boolean(parsed.name)
    const hasOffer = parsed.priceRubles != null || parsed.container || parsed.plantSize

    if (!hasName && !hasOffer) {
      continue
    }

    if (hasName) {
      currentProduct = createProduct(parsed, sheetSlug, nameTagSource)
      products.push(currentProduct)
      continue
    }

    if (currentProduct) {
      mergeProductOffer(currentProduct, parsed)
    }
  }

  return products.filter(
    (product) => product.name && (product.priceRubles != null || product.offers.length > 0),
  )
}

function groupProductsByFirstWord(products: PriceCatalogProduct[]) {
  const groups = new Map<string, { label: string; products: PriceCatalogProduct[] }>()

  for (const product of products) {
    const { firstWord } = extractNameParts(product.name)

    if (!firstWord) {
      continue
    }

    const key = subcategoryGroupKey(firstWord)
    const existing = groups.get(key)
    const label = subcategoryLabelFromFirstWord(firstWord, product.name)

    if (existing) {
      existing.products.push(product)
      existing.label = preferYoLabel([existing.label, label])
      continue
    }

    groups.set(key, {
      label,
      products: [product],
    })
  }

  return [...groups.values()].sort((left, right) => left.label.localeCompare(right.label, 'ru'))
}

function buildSubcategoriesFromSections(
  sheetSlug: string,
  rows: unknown[][],
  header: { rowIndex: number; columns: ColumnMap },
  sections: Array<{ label: string; start: number; end: number }>,
  nameTagSource: 'first' | 'second' = 'second',
) {
  const subcategories: PriceCatalogSubcategory[] = []
  const subSlugSet = new Set<string>()

  for (const section of sections) {
    const products = parseProductRows(
      rows,
      header,
      sheetSlug,
      section.start,
      section.end,
      nameTagSource,
    )

    if (products.length === 0) {
      continue
    }

    subcategories.push({
      slug: uniqueSlug(section.label, subSlugSet),
      label: section.label,
      products,
    })
  }

  return subcategories.sort((left, right) => left.label.localeCompare(right.label, 'ru'))
}

function buildSubcategoriesFromFirstWord(sheetSlug: string, products: PriceCatalogProduct[]) {
  const subSlugSet = new Set<string>()

  return groupProductsByFirstWord(products).map((group) => ({
    slug: uniqueSlug(group.label, subSlugSet),
    label: group.label,
    products: group.products,
  }))
}

const RELATED_SHEET = 'Сопутствующие товары'

function parseSheet(sheetName: string, sheetSlug: string, rows: unknown[][]) {
  const header = findHeaderRow(rows)

  if (!header) {
    return null
  }

  let subcategories: PriceCatalogSubcategory[]

  if (sheetName === RELATED_SHEET) {
    const subcategoryLabels = detectSubcategoryLabels(rows, header.columns, header.rowIndex)
    const sections: Array<{ label: string; start: number; end: number }> = []

    if (subcategoryLabels.length === 0) {
      sections.push({
        label: sheetName,
        start: header.rowIndex + 1,
        end: rows.length,
      })
    } else {
      for (let index = 0; index < subcategoryLabels.length; index += 1) {
        const current = subcategoryLabels[index]!
        const next = subcategoryLabels[index + 1]

        sections.push({
          label: current.label,
          start: Math.max(current.rowIndex + 1, header.rowIndex + 1),
          end: next?.rowIndex ?? rows.length,
        })
      }
    }

    subcategories = buildSubcategoriesFromSections(sheetSlug, rows, header, sections, 'first')
  } else {
    const products = parseProductRows(rows, header, sheetSlug, header.rowIndex + 1, rows.length)
    subcategories = buildSubcategoriesFromFirstWord(sheetSlug, products)
  }

  if (subcategories.length === 0) {
    return null
  }

  return {
    slug: sheetSlug,
    label: sheetName,
    href: `/catalog/${sheetSlug}`,
    subcategories,
  }
}

export function parseWorkbookSheets(sheetNames: string[], sheetRows: Map<string, unknown[][]>) {
  const categories: PriceCatalogCategory[] = []
  const categorySlugSet = new Set<string>()

  for (const sheetName of sheetNames) {
    const rows = sheetRows.get(sheetName)

    if (!rows) {
      continue
    }

    const parsed = parseSheet(sheetName, uniqueSlug(sheetName, categorySlugSet), rows)

    if (!parsed) {
      continue
    }

    categories.push(parsed)
  }

  const related = categories.filter((category) => category.label === 'Сопутствующие товары')
  const plants = categories.filter((category) => category.label !== 'Сопутствующие товары')

  const groups: PriceCatalogGroup[] = []

  if (plants.length > 0) {
    groups.push({ title: 'Растения', items: plants })
  }

  if (related.length > 0) {
    groups.push({ title: 'Сопутствующие товары', items: related })
  }

  const productCount = categories.reduce(
    (total, category) =>
      total +
      category.subcategories.reduce(
        (subTotal, subcategory) => subTotal + subcategory.products.length,
        0,
      ),
    0,
  )

  return { categories, groups, productCount }
}

export function toProductCards(products: PriceCatalogProduct[]): ProductCardFromPrice[] {
  return products.map((product) => ({
    id: product.id,
    tag: cardTagFromLabel(product.tagLabel),
    available: product.available,
    name: product.name,
    nameTag: product.nameTag,
    latin: product.latin,
    href: `/product/${product.id}`,
    specs: specsWithoutVariantAxes(product.specs, product.offers),
    priceRubles: product.priceRubles,
    sizes: buildOfferSizes(product),
  }))
}

export function buildSnapshot(input: {
  sourceFile: string
  sheetNames: string[]
  sheetRows: Map<string, unknown[][]>
}): PriceCatalogSnapshot {
  const { categories, groups, productCount } = parseWorkbookSheets(input.sheetNames, input.sheetRows)

  return {
    sourceFile: input.sourceFile,
    generatedAt: new Date().toISOString(),
    sheetCount: input.sheetNames.length,
    productCount,
    groups,
    categories,
  }
}
