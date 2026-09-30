import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { SubcategoryProducts } from '@/components/SubcategoryProducts'
import { collectSpecFilters } from '@/components/productListingLayout'
import {
  catalogCategories,
  canonicalSubcategorySlug,
  categoryListingPath,
  getProductCardsForSubcategory,
  getSubcategory,
  isFlatCatalogCategory,
  listSubcategoryNameTags,
  parseNameTagQuery,
  parsePromoTagQuery,
  subcategoryListingPath,
} from '@/catalog'
import { flattenCatalogLabel } from '@/catalog/subcategory-label-overrides'
import {
  parseListingSort,
  parseListingSpecFilters,
} from '@/catalog/listing-filters-url'
import { siteBrand } from '@/components/siteContacts'

export function generateStaticParams() {
  return catalogCategories.flatMap((category) =>
    category.subcategories.map((subcategory) => ({
      category: category.slug,
      subcategory: subcategory.slug,
    })),
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; subcategory: string }>
}): Promise<Metadata> {
  const { category: categorySlug, subcategory: subcategorySlug } = await params
  const match = getSubcategory(categorySlug, subcategorySlug)

  if (!match) {
    return { title: `Каталог — ${siteBrand}` }
  }

  if (isFlatCatalogCategory(match.category)) {
    return {
      title: `${match.category.label} — ${siteBrand}`,
      description: `${match.category.label} садового центра ${siteBrand}.`,
    }
  }

  return {
    title: `${flattenCatalogLabel(match.subcategory.label)} — ${siteBrand}`,
    description: `${flattenCatalogLabel(match.subcategory.label)} садового центра ${siteBrand}.`,
  }
}

function searchParamsToQuery(query: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        params.append(key, item)
      }
      continue
    }

    if (typeof value === 'string') {
      params.set(key, value)
    }
  }

  const serialized = params.toString()
  return serialized ? `?${serialized}` : ''
}

export default async function SubcategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string; subcategory: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { category: categorySlug, subcategory: subcategorySlug } = await params
  const query = await searchParams
  const match = getSubcategory(categorySlug, subcategorySlug)

  if (!match) {
    notFound()
  }

  const canonicalSlug = canonicalSubcategorySlug(categorySlug, subcategorySlug)

  if (canonicalSlug !== subcategorySlug) {
    redirect(`${subcategoryListingPath(categorySlug, canonicalSlug)}${searchParamsToQuery(query)}`)
  }

  if (isFlatCatalogCategory(match.category)) {
    redirect(`${categoryListingPath(match.category.slug)}${searchParamsToQuery(query)}`)
  }

  const listingPath = subcategoryListingPath(categorySlug, subcategorySlug)
  const products = getProductCardsForSubcategory(categorySlug, subcategorySlug)
  const showFilters = match.category.label !== 'Сопутствующие товары'
  const activeNameTags = parseNameTagQuery(
    listSubcategoryNameTags(categorySlug, subcategorySlug),
    query.tag,
  )
  const activePromoTags = parsePromoTagQuery(query.promo)
  const specGroups = showFilters
    ? collectSpecFilters(products.map((product) => ({ specs: product.specs ?? [] })))
    : []
  const initialSpecFilters = showFilters ? parseListingSpecFilters(specGroups, query) : []
  const initialSort = parseListingSort(query.sort)

  return (
    <main className="page">
      <div className="container">
        <Breadcrumbs
          items={[
            { href: '/', label: 'Главная' },
            { href: '/catalog', label: 'Каталог' },
            { href: match.category.href, label: match.category.label },
            { label: flattenCatalogLabel(match.subcategory.label) },
          ]}
        />
        <SubcategoryProducts
          title={match.subcategory.label}
          products={products}
          listingPath={listingPath}
          activeNameTags={activeNameTags}
          activePromoTags={activePromoTags}
          initialSpecFilters={initialSpecFilters}
          initialSort={initialSort}
          showFilters={showFilters}
        />
      </div>
    </main>
  )
}
