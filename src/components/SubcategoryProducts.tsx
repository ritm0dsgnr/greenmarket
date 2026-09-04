import { bindHangingWords } from '@/components/bindHangingWords'
import { ProductsCatalog } from '@/components/ProductsCatalog'
import type { ProductCardData, ProductCardTag } from '@/components/ProductCard'
import type { ListingSortId, ListingSpecFilter } from '@/catalog/listing-filters-url'
import { siteBrand } from '@/components/siteContacts'

export function SubcategoryProducts({
  title,
  products,
  listingPath,
  activeNameTags = [],
  activePromoTags = [],
  initialSpecFilters = [],
  initialSort = 'featured',
  showFilters = true,
}: {
  title: string
  products: ProductCardData[]
  listingPath: string
  activeNameTags?: string[]
  activePromoTags?: ProductCardTag[]
  initialSpecFilters?: ListingSpecFilter[]
  initialSort?: ListingSortId
  showFilters?: boolean
}) {
  return (
    <section
      className={['products', showFilters ? '' : 'products--no-filters'].filter(Boolean).join(' ')}
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
        >
          <div className="products__head">
            <h1 className="products__title" id="products-title">
              {bindHangingWords(title)}
            </h1>
            <p className="products__lead">
              {bindHangingWords(
                `${title} садового центра ${siteBrand}. Параметры и цены показаны из прайса для приёмки вёрстки. Перед заказом менеджер подтвердит наличие и стоимость.`,
              )}
            </p>
          </div>
        </ProductsCatalog>
      </div>
    </section>
  )
}
