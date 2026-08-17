import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { bindHangingWords } from '@/components/bindHangingWords'
import { CatalogCard } from '@/components/CatalogCard'
import {
  catalogCategories,
  getCategoryBySlug,
} from '@/components/catalogCategories'

const layoutCounts = [12, 4, 27, 8, 1, 15, 3, 42, 9, 6] as const

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
    return { title: 'Каталог — Green Market' }
  }

  return {
    title: `${category.label} — Green Market`,
    description: `${category.label} садового центра Green Market.`,
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category: categorySlug } = await params
  const category = getCategoryBySlug(categorySlug)

  if (!category) {
    notFound()
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
          <h1 className="catalog__title" id="category-title">
            {bindHangingWords(category.label)}
          </h1>
          <ul className="catalog__grid">
            {Array.from({ length: 10 }, (_, index) => {
              const subcategory = category.subcategories[index % category.subcategories.length]

              if (!subcategory) {
                return null
              }

              return (
                <li className="catalog__item" key={`${subcategory.slug}-${index}`}>
                  <CatalogCard
                    href={`/catalog/${category.slug}/${subcategory.slug}`}
                    title={subcategory.label}
                    variant="sub"
                    count={layoutCounts[index] ?? 0}
                  />
                </li>
              )
            })}
          </ul>
        </div>
      </section>
    </main>
  )
}
