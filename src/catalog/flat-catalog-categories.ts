import type { PriceCatalogCategory, PriceCatalogGroup } from '@/import/greenmarket-price/types'

/** Categories that list products directly without a subcategory grid. */
export const FLAT_CATALOG_CATEGORY_LABELS = ['Гортензии', 'Розы'] as const

export function isFlatCatalogCategory(category: { label: string }) {
  return (FLAT_CATALOG_CATEGORY_LABELS as readonly string[]).includes(
    category.label as (typeof FLAT_CATALOG_CATEGORY_LABELS)[number],
  )
}

export type CatalogGroupEntry = {
  key: string
  label: string
  href: string
  /** Present when the entry is a subcategory card on the catalog index. */
  productCount?: number
}

type CatalogNavGroup = {
  title?: string
  items: ReadonlyArray<{
    label: string
    href: string
    slug?: string
    subcategories?: PriceCatalogCategory['subcategories']
  }>
}

/**
 * Cards/links for a catalog group.
 * «Сопутствующие товары» expands to real sections (декор, одежда…),
 * so the index does not stop on a nested category with the same title.
 */
export function listCatalogGroupEntries(group: PriceCatalogGroup): CatalogGroupEntry[] {
  if (group.title === 'Сопутствующие товары') {
    return group.items
      .flatMap((category) =>
        category.subcategories.map((subcategory) => ({
          key: `${category.slug}/${subcategory.slug}`,
          label: subcategory.label,
          href: `${category.href}/${subcategory.slug}`,
          productCount: subcategory.products.length,
        })),
      )
      .sort((left, right) => left.label.localeCompare(right.label, 'ru'))
  }

  return group.items.map((category) => ({
    key: category.slug,
    label: category.label,
    href: category.href,
  }))
}

export function listCatalogGroupNavEntries(group: CatalogNavGroup): Array<{ label: string; href: string }> {
  if (group.title === 'Сопутствующие товары') {
    return group.items.flatMap((category) => {
      if (!category.subcategories?.length) {
        return [{ label: category.label, href: category.href }]
      }

      return [...category.subcategories]
        .sort((left, right) => left.label.localeCompare(right.label, 'ru'))
        .map((subcategory) => ({
          label: subcategory.label,
          href: `${category.href}/${subcategory.slug}`,
        }))
    })
  }

  return group.items.map((entry) => ({
    label: entry.label,
    href: entry.href,
  }))
}

/** @internal for tests */
export function relatedCategoryFixture(
  subcategories: Array<{ slug: string; label: string; productCount?: number }>,
): PriceCatalogCategory {
  return {
    slug: 'soputstvuyuschie-tovary',
    label: 'Сопутствующие товары',
    href: '/catalog/soputstvuyuschie-tovary',
    subcategories: subcategories.map((item) => ({
      slug: item.slug,
      label: item.label,
      products: Array.from({ length: item.productCount ?? 1 }, (_, index) => ({
        id: `${item.slug}-${index}`,
        sourceRowNumber: index + 1,
        name: `${item.label} ${index + 1}`,
        available: true,
        specs: [],
        offers: [],
      })),
    })),
  }
}
