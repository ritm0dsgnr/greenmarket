import type { PriceCatalogCategory } from '@/import/greenmarket-price/types'

/** Preferred home «Каталог» order; missing ones are skipped, then filled from catalog order. */
export const HOME_CATALOG_PREFERRED_LABELS = [
  'Плодово-ягодные',
  'Гортензии',
  'Пряные травы',
  'Многолетники',
  'Хвойные',
  'Розы',
] as const

const PREFERRED_ALIASES: Record<string, readonly string[]> = {
  'Плодово-ягодные': ['Плодово-ягодные', 'Плодовые'],
  Гортензии: ['Гортензии'],
  'Пряные травы': ['Пряные травы'],
  Многолетники: ['Многолетники'],
  Хвойные: ['Хвойные'],
  Розы: ['Розы'],
}

function findPreferred(
  categories: readonly PriceCatalogCategory[],
  preferredLabel: string,
  used: Set<string>,
) {
  const aliases = PREFERRED_ALIASES[preferredLabel] ?? [preferredLabel]

  return categories.find(
    (category) => !used.has(category.slug) && aliases.includes(category.label),
  )
}

export function selectHomeCatalogCategories(
  categories: readonly PriceCatalogCategory[],
  limit = 6,
): PriceCatalogCategory[] {
  if (limit <= 0 || categories.length === 0) {
    return []
  }

  const selected: PriceCatalogCategory[] = []
  const used = new Set<string>()

  for (const preferredLabel of HOME_CATALOG_PREFERRED_LABELS) {
    if (selected.length >= limit) {
      break
    }

    const match = findPreferred(categories, preferredLabel, used)

    if (!match) {
      continue
    }

    selected.push(match)
    used.add(match.slug)
  }

  for (const category of categories) {
    if (selected.length >= limit) {
      break
    }

    if (used.has(category.slug)) {
      continue
    }

    selected.push(category)
    used.add(category.slug)
  }

  return selected
}
