import { extractNameParts, subcategoryLabelFromFirstWord } from '../import/greenmarket-price/name-parts'
import type { ListingPromoTag } from './name-tag-url'
import type { ProductCardData } from '@/components/ProductCard'

/** Name-group tags from the first word of each product title. */
export function withFirstWordNameTags<T extends { name: string; nameTag?: string }>(products: readonly T[]): T[] {
  return products.map((product) => {
    const firstWord = extractNameParts(product.name).firstWord
    const label = subcategoryLabelFromFirstWord(firstWord, product.name)

    return {
      ...product,
      nameTag: label || undefined,
    }
  })
}

export function filterProductCardsByPromoTags<T extends { tag: ListingPromoTag | null }>(
  products: readonly T[],
  promoTags: readonly ListingPromoTag[],
) {
  if (promoTags.length === 0) {
    return [...products]
  }

  return products.filter((product) => product.tag != null && promoTags.includes(product.tag))
}

/** Promo listing at /catalog?promo=…: matching cards with first-word name tags. */
export function buildPromoCatalogListing(
  products: readonly ProductCardData[],
  promoTags: readonly ListingPromoTag[],
) {
  return withFirstWordNameTags(filterProductCardsByPromoTags(products, promoTags))
}
