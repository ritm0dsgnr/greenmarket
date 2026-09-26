import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { CatalogCard } from '@/components/CatalogCard'
import { SubcategoryProducts } from '@/components/SubcategoryProducts'
import { collectSpecFilters, isListingNameTag } from '@/components/productListingLayout'
import {
  buildPromoCatalogListing,
  catalogGroups,
  filterProductsBySearch,
  getAllProductCards,
  listCatalogGroupEntries,
  parseListingSort,
  parseListingSpecFilters,
  parseNameTagQuery,
  parsePromoTagQuery,
  parseSearchQuery,
  SEARCH_QUERY_MIN_LENGTH,
} from '@/catalog'
import type { ListingPromoTag } from '@/catalog'
import type { ProductCardData } from '@/components/ProductCard'
import { siteBrand } from '@/components/siteContacts'

export const metadata: Metadata = {
  title: `Каталог — ${siteBrand}`,
  description: `Каталог растений и сопутствующих товаров садового центра ${siteBrand}.`,
}

function catalogPromoListingTitle(promoTags: readonly ListingPromoTag[]) {
  if (promoTags.length === 1 && promoTags[0] === 'new') {
    return 'Новинки'
  }

  if (promoTags.length === 1 && promoTags[0] === 'sale') {
    return 'Скидки'
  }

  if (promoTags.length === 1 && promoTags[0] === 'hit') {
    return 'Хиты'
  }

  return 'Каталог'
}

function catalogSearchTitle(query: string) {
  return query ? `По вашему запросу: ${query}` : 'Поиск'
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const query = await searchParams
  const activePromoTags = parsePromoTagQuery(query.promo)
  const searchQuery = parseSearchQuery(query.q)
  const hasSearch = searchQuery.length >= SEARCH_QUERY_MIN_LENGTH

  if (hasSearch || activePromoTags.length > 0) {
    let products: ProductCardData[] =
      activePromoTags.length > 0
        ? buildPromoCatalogListing(getAllProductCards(), activePromoTags)
        : getAllProductCards()

    if (hasSearch) {
      products = filterProductsBySearch(products, searchQuery)
    }

    const availableNameTags = [
      ...new Set(
        products
          .map((product) => product.nameTag?.trim())
          .filter((tag): tag is string => typeof tag === 'string' && isListingNameTag(tag)),
      ),
    ].sort((left, right) => left.localeCompare(right, 'ru'))
    const activeNameTags = parseNameTagQuery(availableNameTags, query.tag)
    const listingPath = '/catalog'
    const title = hasSearch ? catalogSearchTitle(searchQuery) : catalogPromoListingTitle(activePromoTags)
    const crumb = hasSearch ? 'Поиск' : title
    const specGroups = collectSpecFilters(products.map((product) => ({ specs: product.specs ?? [] })))
    const initialSpecFilters = parseListingSpecFilters(specGroups, query)
    const initialSort = parseListingSort(query.sort)

    return (
      <main className="page">
        <div className="container">
          <Breadcrumbs
            items={[
              { href: '/', label: 'Главная' },
              { href: '/catalog', label: 'Каталог' },
              { label: crumb },
            ]}
          />
          <SubcategoryProducts
            title={title}
            products={products}
            listingPath={listingPath}
            activeNameTags={activeNameTags}
            activePromoTags={activePromoTags}
            initialSpecFilters={initialSpecFilters}
            initialSort={initialSort}
            searchQuery={hasSearch ? searchQuery : ''}
          />
        </div>
      </main>
    )
  }

  return (
    <main className="page">
      <div className="catalog">
        <div className="container">
          <Breadcrumbs
            items={[
              { href: '/', label: 'Главная' },
              { label: 'Каталог' },
            ]}
          />
          <h1 className="catalog__title" id="catalog-title">
            Каталог
          </h1>
          {catalogGroups.map((group, groupIndex) => {
            const titleId = `catalog-group-${groupIndex}`

            return (
              <section
                className="catalog__group"
                key={group.title}
                aria-labelledby={titleId}
              >
                <h2 className="catalog__group-title" id={titleId}>
                  {group.title}
                </h2>
                <ul className="catalog__grid">
                  {listCatalogGroupEntries(group).map((entry) => (
                    <li className="catalog__item" key={entry.key}>
                      <CatalogCard
                        href={entry.href}
                        title={entry.label}
                        variant={entry.productCount != null ? 'sub' : 'category'}
                        count={entry.productCount}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      </div>
    </main>
  )
}
