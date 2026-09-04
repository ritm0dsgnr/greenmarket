import { slugify } from '../import/greenmarket-price/slugify'
import {
  isListingPromoTag,
  type ListingPromoTag,
} from './name-tag-url'

export type ListingSpecFilter = { label: string; value: string }

export type ListingSpecGroup = { label: string; values: string[] }

export const listingSortIds = ['featured', 'alpha', 'cheap', 'expensive'] as const

export type ListingSortId = (typeof listingSortIds)[number]

/** Short stable query keys for known filter labels; others use slugify(label). */
const specLabelKeys: Record<string, string> = {
  Контейнер: 'c',
  Цвет: 'color',
  'Период цветения': 'bloom',
  'Высота взрослого растения': 'h',
}

const reservedQueryKeys = new Set(['tag', 'promo', 'sort'])

export function listingSpecParamKey(label: string) {
  return specLabelKeys[label] ?? slugify(label)
}

export function isListingSortId(value: string): value is ListingSortId {
  return (listingSortIds as readonly string[]).includes(value)
}

export function parseListingSort(raw: string | string[] | undefined): ListingSortId {
  const value = Array.isArray(raw) ? raw[0] : raw
  const normalized = value?.trim().toLowerCase() ?? ''

  if (normalized && isListingSortId(normalized) && normalized !== 'featured') {
    return normalized
  }

  return 'featured'
}

function splitQueryValues(raw: string | string[] | undefined) {
  const chunks = Array.isArray(raw) ? raw : raw ? [raw] : []

  return chunks.flatMap((chunk) => chunk.split(',')).map((part) => part.trim()).filter(Boolean)
}

function resolveSpecValue(available: readonly string[], raw: string) {
  const exact = available.find((value) => value === raw)
  if (exact) {
    return exact
  }

  const slug = slugify(raw)
  return available.find((value) => slugify(value) === slug) ?? null
}

function readParam(
  query: Record<string, string | string[] | undefined> | URLSearchParams,
  key: string,
): string | string[] | undefined {
  if (query instanceof URLSearchParams) {
    const all = query.getAll(key)
    if (all.length === 0) {
      return undefined
    }
    return all.length === 1 ? all[0] : all
  }

  return query[key]
}

export function parseListingSpecFilters(
  groups: readonly ListingSpecGroup[],
  query: Record<string, string | string[] | undefined> | URLSearchParams,
): ListingSpecFilter[] {
  const selected: ListingSpecFilter[] = []

  for (const group of groups) {
    const key = listingSpecParamKey(group.label)
    const parts = splitQueryValues(readParam(query, key))

    for (const part of parts) {
      const value = resolveSpecValue(group.values, part)

      if (!value) {
        continue
      }

      if (!selected.some((item) => item.label === group.label && item.value === value)) {
        selected.push({ label: group.label, value })
      }
    }
  }

  return selected
}

export function withListingQuery(
  listingPath: string,
  {
    nameTags = [],
    promoTags = [],
    specFilters = [],
    sort = 'featured',
  }: {
    nameTags?: readonly string[]
    promoTags?: readonly ListingPromoTag[]
    specFilters?: readonly ListingSpecFilter[]
    sort?: ListingSortId
  },
) {
  const params = new URLSearchParams()
  const sortedPromo = [...promoTags]
    .filter((tag) => isListingPromoTag(tag))
    .sort((left, right) => left.localeCompare(right))
  const sortedName = [...nameTags].sort((left, right) => slugify(left).localeCompare(slugify(right)))

  for (const promo of sortedPromo) {
    params.append('promo', promo)
  }

  for (const tag of sortedName) {
    params.append('tag', slugify(tag))
  }

  const byLabel = new Map<string, string[]>()

  for (const filter of specFilters) {
    const values = byLabel.get(filter.label) ?? []
    if (!values.includes(filter.value)) {
      values.push(filter.value)
    }
    byLabel.set(filter.label, values)
  }

  const labels = [...byLabel.keys()].sort((left, right) =>
    listingSpecParamKey(left).localeCompare(listingSpecParamKey(right)),
  )

  for (const label of labels) {
    const key = listingSpecParamKey(label)
    if (reservedQueryKeys.has(key)) {
      continue
    }

    const values = [...(byLabel.get(label) ?? [])].sort((left, right) =>
      left.localeCompare(right, 'ru', { numeric: true, sensitivity: 'base' }),
    )

    if (values.length > 0) {
      params.set(
        key,
        values
          .map((value) => {
            // Keep compact codes (C3, WRB40) as-is; slugify longer labels.
            return /^[A-Za-z0-9./+-]+$/.test(value) ? value : slugify(value)
          })
          .join(','),
      )
    }
  }

  if (sort !== 'featured' && isListingSortId(sort)) {
    params.set('sort', sort)
  }

  const query = params.toString()
  return query ? `${listingPath}?${query}` : listingPath
}

/** Update the address bar without a Next.js navigation / RSC refetch. */
export function replaceListingUrl(url: string) {
  if (typeof window === 'undefined') {
    return
  }

  const next = new URL(url, window.location.origin)
  const current = `${window.location.pathname}${window.location.search}`
  const target = `${next.pathname}${next.search}`

  if (current === target) {
    return
  }

  window.history.replaceState(window.history.state, '', target)
}
