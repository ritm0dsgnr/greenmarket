import Link from 'next/link'
import { CatalogCard } from '@/components/CatalogCard'
import { Icon } from '@/components/Icon'
import { HOME_CATALOG_DESKTOP_LIMIT, homeCatalogCategories } from '@/catalog'

export function HomeCatalog() {
  return (
    <section className="catalog" aria-labelledby="catalog-title">
      <div className="container">
        <div className="catalog__head">
          <h2 className="catalog__title" id="catalog-title">
            Каталог
          </h2>
          <Link className="catalog__more" href="/catalog">
            Весь каталог
            <Icon name="chevron-down" className="catalog__more-arrow" />
          </Link>
        </div>
        <ul className="catalog__grid">
          {homeCatalogCategories.map((category, index) => (
            <li
              className={
                index >= HOME_CATALOG_DESKTOP_LIMIT
                  ? 'catalog__item catalog__item--extra'
                  : 'catalog__item'
              }
              key={category.label}
            >
              <CatalogCard href={category.href} title={category.label} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
