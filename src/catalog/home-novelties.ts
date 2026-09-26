import { toProductCards } from '../import/greenmarket-price/parse-workbook'
import type { ProductCardFromPrice } from '../import/greenmarket-price/types'
import { catalogCategories } from './price-catalog'
import { withListingTagQuery } from './name-tag-url'

export function selectHomeNoveltyCards(cards: readonly ProductCardFromPrice[]) {
  return cards.filter((card) => card.tag === 'new' && card.available)
}

/** Catalog listing with promo=new — all novelty products across categories. */
export const homeNoveltiesListingPath = withListingTagQuery('/catalog', { promoTags: ['new'] })

/** Home «Новинки сезона»: available catalog products marked as new. */
export function getHomeNoveltyCards() {
  const products = catalogCategories.flatMap((category) =>
    category.subcategories.flatMap((subcategory) => subcategory.products),
  )

  return selectHomeNoveltyCards(toProductCards(products))
}
