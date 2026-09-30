import { bindHangingWords } from '@/components/bindHangingWords'
import { ProductsCatalog } from '@/components/ProductsCatalog'
import type { ProductCardData, ProductCardTag } from '@/components/ProductCard'
import type { ListingSortId, ListingSpecFilter } from '@/catalog/listing-filters-url'
import { collectSpecFilters } from '@/components/productListingLayout'
import { flattenCatalogLabel } from '@/catalog/subcategory-label-overrides'
import { siteBrand } from '@/components/siteContacts'

function productCountLabel(count: number) {
  const mod10 = count % 10
  const mod100 = count % 100

  if (mod10 === 1 && mod100 !== 11) {
    return `${count} товар`
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${count} товара`
  }

  return `${count} товаров`
}

export function SubcategoryProducts({
  title,
  products,
  listingPath,
  activeNameTags = [],
  activePromoTags = [],
  initialSpecFilters = [],
  initialSort = 'featured',
  searchQuery = '',
  showFilters = true,
}: {
  title: string
  products: ProductCardData[]
  listingPath: string
  activeNameTags?: string[]
  activePromoTags?: ProductCardTag[]
  initialSpecFilters?: ListingSpecFilter[]
  initialSort?: ListingSortId
  searchQuery?: string
  showFilters?: boolean
}) {
  const showFilterRail =
    showFilters &&
    collectSpecFilters(products.map((product) => ({ specs: product.specs ?? [] }))).length > 0

  return (
    <section
      className={['products', showFilterRail ? '' : 'products--no-filters'].filter(Boolean).join(' ')}
      aria-labelledby="products-title"
    >
      <div className="products__layout">
        <ProductsCatalog
          products={products}
          showFilters={showFilters}
          listingPath={listingPath}
          activeNameTags={activeNameTags}
          activePromoTags={activePromoTags}
          initialSpecFilters={initialSpecFilters}
          initialSort={initialSort}
          searchQuery={searchQuery}
        >
          <div className="products__head">
            <h1 className="products__title" id="products-title">
              {bindHangingWords(title)}
            </h1>
            {searchQuery ? (
              <p className="products__count">{productCountLabel(products.length)}</p>
            ) : (
              <p className="products__lead">
                {bindHangingWords(
                  `${flattenCatalogLabel(title)} садового центра ${siteBrand}. Параметры и цены показаны из прайса для приёмки вёрстки. Перед заказом менеджер подтвердит наличие и стоимость.`,
                )}
              </p>
            )}
          </div>
        </ProductsCatalog>
      </div>
    </section>
  )
}
