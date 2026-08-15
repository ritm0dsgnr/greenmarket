import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { CatalogCard } from '@/components/CatalogCard'
import { catalogGroups } from '@/components/catalogCategories'

export const metadata: Metadata = {
  title: 'Каталог — Green Market',
  description: 'Каталог растений и сопутствующих товаров садового центра Green Market.',
}

export default function CatalogPage() {
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
                  {group.items.map((category) => (
                    <li className="catalog__item" key={category.label}>
                      <CatalogCard href={category.href} title={category.label} />
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
