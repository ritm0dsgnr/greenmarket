import { cardTagFromLabel, toProductCards } from '@/import/greenmarket-price/parse-workbook'
import type { PriceCatalogProduct } from '@/import/greenmarket-price/types'
import {
  catalogCategories,
  getCategoryBySlug,
  getProductById,
  getSubcategory,
} from './price-catalog'
import { isFlatCatalogCategory } from '@/catalog/flat-catalog-categories'
import { selectHomeCatalogCategories } from '@/catalog/home-catalog-categories'
import {
  categoryListingPath,
  subcategoryListingPath,
  withListingTagQuery,
} from '@/catalog/name-tag-url'
import { buildOfferSizes, minOfferPrice, specsWithoutVariantAxes, type ProductOfferSize } from '@/import/greenmarket-price/offer-sizes'
import type { ProductCardTag } from '@/components/ProductCard'
import type { ProductSpec } from '@/components/productSpecs'

export {
  catalogCategories,
  catalogGroups,
  canonicalSubcategorySlug,
  getCategoryBySlug,
  getProductById,
  getSubcategory,
  listProductIds,
  priceCatalogSnapshot,
} from './price-catalog'

export { isFlatCatalogCategory, listCatalogGroupEntries, listCatalogGroupNavEntries } from '@/catalog/flat-catalog-categories'

export const homeCatalogCategories = selectHomeCatalogCategories(catalogCategories)

export {
  categoryListingPath,
  listCategoryNameTags,
  listSubcategoryNameTags,
  nameTagListingPath,
  parseNameTagQuery,
  parsePromoTagQuery,
  promoTagListingPath,
  resolveNameTagLabel,
  subcategoryListingPath,
  withListingTagQuery,
  withNameTagQuery,
} from '@/catalog/name-tag-url'
export type { ListingPromoTag } from '@/catalog/name-tag-url'
export {
  listingSpecParamKey,
  parseListingSort,
  parseListingSpecFilters,
  replaceListingUrl,
  withListingQuery,
} from '@/catalog/listing-filters-url'
export {
  catalogSearchPath,
  filterProductsBySearch,
  parseSearchQuery,
  SEARCH_QUERY_MAX_LENGTH,
  SEARCH_QUERY_MIN_LENGTH,
} from '@/catalog/search-catalog'
export type { ListingSpecFilter, ListingSortId } from '@/catalog/listing-filters-url'
export { subcategoryCardTitle } from './subcategory-card-title'

export function getProductCardsForSubcategory(categorySlug: string, subcategorySlug: string) {
  const match = getSubcategory(categorySlug, subcategorySlug)

  if (!match) {
    return []
  }

  return toProductCards(match.subcategory.products)
}

export function getProductCardsForCategory(categorySlug: string) {
  const category = getCategoryBySlug(categorySlug)

  if (!category) {
    return []
  }

  return toProductCards(category.subcategories.flatMap((subcategory) => subcategory.products))
}

export function getAllProductCards() {
  return catalogCategories.flatMap((category) =>
    category.subcategories.flatMap((subcategory) =>
      toProductCards(subcategory.products).map((card) => ({
        ...card,
        categoryLabel: category.label,
        categoryHref: category.href,
      })),
    ),
  )
}

export { getHomeNoveltyCards, selectHomeNoveltyCards } from '@/catalog/home-novelties'
export { homeNoveltiesListingPath } from '@/catalog/home-novelties'
export {
  buildPromoCatalogListing,
  filterProductCardsByPromoTags,
  withFirstWordNameTags,
} from '@/catalog/promo-catalog-listing'

export type ProductViewSize = ProductOfferSize

export type ProductViewData = {
  id: string
  name: string
  latin?: string
  tag: ProductCardTag | null
  tagHref: string | null
  groupTags: Array<{ label: string; href: string }>
  available: boolean
  priceRubles: number
  sizes: ProductViewSize[]
  specs: ProductSpec[]
  description: string[]
  breadcrumbs: Array<{ href?: string; label: string }>
  relatedCards: ReturnType<typeof toProductCards>
}

function buildDescription(product: PriceCatalogProduct) {
  if (product.description?.trim()) {
    return product.description
      .split(/\n+/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean)
  }

  return [
    `${product.name} — позиция из демонстрационного каталога Грин Маркет. Характеристики и цена взяты из прайса для приёмки вёрстки.`,
    'Фотографии и финальные описания появятся после загрузки медиа в админке. Наличие и стоимость перед заказом подтверждает менеджер.',
  ]
}

export function getProductViewData(productId: string): ProductViewData | null {
  const match = getProductById(productId)

  if (!match) {
    return null
  }

  const { category, subcategory, product } = match
  const sizes = buildOfferSizes(product)
  const priceRubles = minOfferPrice(sizes, product.priceRubles ?? 0)
  const flat = isFlatCatalogCategory(category)
  const relatedSource = flat
    ? category.subcategories.flatMap((item) => item.products)
    : subcategory.products
  const related = relatedSource
    .filter((item) => item.id !== product.id && item.available)
    .slice(0, 8)
  const promoTag = cardTagFromLabel(product.tagLabel)
  const listingPath = flat
    ? categoryListingPath(category.slug)
    : subcategoryListingPath(category.slug, subcategory.slug)
  const breadcrumbs = [
    { href: '/', label: 'Главная' },
    { href: '/catalog', label: 'Каталог' },
    { href: category.href, label: category.label },
    ...(flat ? [] : [{ href: `${category.href}/${subcategory.slug}`, label: subcategory.label }]),
    { label: product.name },
  ]

  return {
    id: product.id,
    name: product.name,
    latin: product.latin,
    tag: promoTag,
    tagHref: promoTag ? withListingTagQuery(listingPath, { promoTags: [promoTag] }) : null,
    groupTags: product.nameTag
      ? [
          {
            label: product.nameTag,
            href: withListingTagQuery(listingPath, { nameTags: [product.nameTag] }),
          },
        ]
      : [],
    available: product.available,
    priceRubles,
    sizes,
    specs: specsWithoutVariantAxes(product.specs, product.offers),
    description: buildDescription(product),
    breadcrumbs,
    relatedCards: toProductCards(related),
  }
}
