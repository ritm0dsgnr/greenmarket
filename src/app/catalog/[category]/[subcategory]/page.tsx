import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { SubcategoryProducts } from '@/components/SubcategoryProducts'
import { catalogCategories, getSubcategory } from '@/components/catalogCategories'
import { buildLayoutProducts } from '@/components/productListingLayout'

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
    return { title: 'Каталог — Green Market' }
  }

  return {
    title: `${match.subcategory.label} — Green Market`,
    description: `${match.subcategory.label} садового центра Green Market.`,
  }
}

export default async function SubcategoryPage({
  params,
}: {
  params: Promise<{ category: string; subcategory: string }>
}) {
  const { category: categorySlug, subcategory: subcategorySlug } = await params
  const match = getSubcategory(categorySlug, subcategorySlug)

  if (!match) {
    notFound()
  }

  return (
    <main className="page">
      <div className="container">
        <Breadcrumbs
          items={[
            { href: '/', label: 'Главная' },
            { href: '/catalog', label: 'Каталог' },
            { href: match.category.href, label: match.category.label },
            { label: match.subcategory.label },
          ]}
        />
        <SubcategoryProducts
          title={match.subcategory.label}
          products={buildLayoutProducts(match.subcategory.label)}
        />
      </div>
    </main>
  )
}
