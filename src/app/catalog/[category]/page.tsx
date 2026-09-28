import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { bindHangingWords } from '@/components/bindHangingWords'
import { CatalogCard } from '@/components/CatalogCard'
import { SubcategoryProducts } from '@/components/SubcategoryProducts'
import { collectSpecFilters } from '@/components/productListingLayout'
import {
  catalogCategories,
  categoryListingPath,
  getCategoryBySlug,
  getProductCardsForCategory,
  getCategoryCopy,
  isFlatCatalogCategory,
  listCategoryNameTags,
  parseListingSort,
  parseListingSpecFilters,
  parseNameTagQuery,
  parsePromoTagQuery,
  subcategoryCardTitle,
} from '@/catalog'
import { siteBrand } from '@/components/siteContacts'

export function generateStaticParams() {
  return catalogCategories.map((category) => ({ category: category.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>
}): Promise<Metadata> {
  const { category: categorySlug } = await params
  const category = getCategoryBySlug(categorySlug)

  if (!category) {
    return { title: `Каталог — ${siteBrand}` }
  }

  const copy = getCategoryCopy(category.slug)

  return {
    title: `${copy?.heading ?? category.label} — ${siteBrand}`,
    description: copy?.lead ?? `${category.label} садового центра ${siteBrand}.`,
  }
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { category: categorySlug } = await params
  const query = await searchParams
  const category = getCategoryBySlug(categorySlug)

  if (!category) {
    notFound()
  }

  const copy = getCategoryCopy(category.slug)
  const heading = copy?.heading ?? category.label

  if (isFlatCatalogCategory(category)) {
    const listingPath = categoryListingPath(category.slug)
    const products = getProductCardsForCategory(category.slug)
    const activeNameTags = parseNameTagQuery(listCategoryNameTags(category.slug), query.tag)
    const activePromoTags = parsePromoTagQuery(query.promo)
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
              { label: category.label },
            ]}
          />
          <SubcategoryProducts
            title={heading}
            products={products}
            listingPath={listingPath}
            activeNameTags={activeNameTags}
            activePromoTags={activePromoTags}
            initialSpecFilters={initialSpecFilters}
            initialSort={initialSort}
          />
        </div>
      </main>
    )
  }

  return (
    <main className="page">
      <section className="catalog" aria-labelledby="category-title">
        <div className="container">
          <Breadcrumbs
            items={[
              { href: '/', label: 'Главная' },
              { href: '/catalog', label: 'Каталог' },
              { label: category.label },
            ]}
          />
          <h1 className={['catalog__title', copy ? 'catalog__title--with-intro' : ''].filter(Boolean).join(' ')} id="category-title">
            {bindHangingWords(heading)}
          </h1>
          {copy ? (
            <div className="catalog__intro">
              {copy.lead ? <p className="catalog__lead">{bindHangingWords(copy.lead)}</p> : null}
              {copy.paragraphs.map((paragraph) => (
                <p key={paragraph}>{bindHangingWords(paragraph)}</p>
              ))}
              {copy.points?.length ? (
                <ul className="catalog__points">
                  {copy.points.map((point) => (
                    <li key={point}>{bindHangingWords(point)}</li>
                  ))}
                </ul>
              ) : null}
              {copy.afterPoints?.map((paragraph) => (
                <p key={paragraph}>{bindHangingWords(paragraph)}</p>
              ))}
            </div>
          ) : null}
          <ul className="catalog__grid">
            {[...category.subcategories]
              .sort((left, right) =>
                subcategoryCardTitle(left).localeCompare(subcategoryCardTitle(right), 'ru'),
              )
              .map((subcategory) => (
                <li className="catalog__item" key={subcategory.slug}>
                  <CatalogCard
                    href={`/catalog/${category.slug}/${subcategory.slug}`}
                    title={subcategoryCardTitle(subcategory)}
                    variant="sub"
                    count={subcategory.products.length}
                  />
                </li>
              ))}
          </ul>
        </div>
      </section>
    </main>
  )
}
