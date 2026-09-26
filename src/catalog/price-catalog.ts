import { priceCatalogSnapshot as generatedSnapshot } from './generated-price-catalog'
import { mergeYoTwinSnapshot, resolveSubcategorySlug } from './merge-yo-subcategories'

const merged = mergeYoTwinSnapshot(generatedSnapshot)

export const priceCatalogSnapshot = merged.snapshot
export const catalogGroups = priceCatalogSnapshot.groups
export const catalogCategories = priceCatalogSnapshot.categories
const subcategoryAliases = merged.aliases

export function getCategoryBySlug(slug: string) {
  return catalogCategories.find((category) => category.slug === slug)
}

export function getSubcategory(categorySlug: string, subcategorySlug: string) {
  const category = getCategoryBySlug(categorySlug)

  if (!category) {
    return null
  }

  const resolvedSlug = resolveSubcategorySlug(subcategoryAliases, categorySlug, subcategorySlug)
  const subcategory = category.subcategories.find((item) => item.slug === resolvedSlug)

  if (!subcategory) {
    return null
  }

  return { category, subcategory, resolvedSlug }
}

export function getProductById(productId: string) {
  for (const category of catalogCategories) {
    for (const subcategory of category.subcategories) {
      const product = subcategory.products.find((item) => item.id === productId)

      if (product) {
        return { category, subcategory, product }
      }
    }
  }

  return null
}

export function listProductIds() {
  return catalogCategories.flatMap((category) =>
    category.subcategories.flatMap((subcategory) => subcategory.products.map((product) => product.id)),
  )
}

export function canonicalSubcategorySlug(categorySlug: string, subcategorySlug: string) {
  return resolveSubcategorySlug(subcategoryAliases, categorySlug, subcategorySlug)
}
