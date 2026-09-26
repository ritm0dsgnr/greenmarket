import { foldYo, preferYoLabel } from '../import/greenmarket-price/name-parts'
import type {
  PriceCatalogCategory,
  PriceCatalogSnapshot,
  PriceCatalogSubcategory,
} from '../import/greenmarket-price/types'

export type SubcategoryAliasMap = Record<string, Record<string, string>>

export function mergeYoTwinSubcategories(subcategories: readonly PriceCatalogSubcategory[]) {
  const buckets = new Map<string, PriceCatalogSubcategory[]>()
  const order: string[] = []

  for (const subcategory of subcategories) {
    const key = foldYo(subcategory.label)
    const existing = buckets.get(key)

    if (existing) {
      existing.push(subcategory)
      continue
    }

    buckets.set(key, [subcategory])
    order.push(key)
  }

  const aliases: Record<string, string> = {}
  const items = order.map((key) => {
    const group = buckets.get(key) ?? []
    const canonical = group[0]

    if (!canonical) {
      throw new Error(`empty subcategory group: ${key}`)
    }

    for (const item of group.slice(1)) {
      aliases[item.slug] = canonical.slug
    }

    return {
      slug: canonical.slug,
      label: preferYoLabel(group.map((item) => item.label)),
      products: group
        .flatMap((item) => item.products)
        .sort((left, right) => left.sourceRowNumber - right.sourceRowNumber),
    }
  })

  return { items, aliases }
}

function mergeCategory(category: PriceCatalogCategory) {
  const { items } = mergeYoTwinSubcategories(category.subcategories)

  return {
    ...category,
    subcategories: items,
  }
}

export function mergeYoTwinSnapshot(snapshot: PriceCatalogSnapshot): {
  snapshot: PriceCatalogSnapshot
  aliases: SubcategoryAliasMap
} {
  const aliases: SubcategoryAliasMap = {}
  const categories = snapshot.categories.map((category) => {
    const merged = mergeYoTwinSubcategories(category.subcategories)
    aliases[category.slug] = merged.aliases

    return {
      ...category,
      subcategories: merged.items,
    }
  })

  return {
    snapshot: {
      ...snapshot,
      categories,
      groups: snapshot.groups.map((group) => ({
        ...group,
        items: group.items.map(mergeCategory),
      })),
    },
    aliases,
  }
}

export function resolveSubcategorySlug(
  aliases: SubcategoryAliasMap,
  categorySlug: string,
  subcategorySlug: string,
) {
  return aliases[categorySlug]?.[subcategorySlug] ?? subcategorySlug
}
