import { bindHangingWords } from '@/components/bindHangingWords'
import { ProductsCatalog } from '@/components/ProductsCatalog'
import type { ProductCardData } from '@/components/ProductCard'

export function SubcategoryProducts({
  title,
  products,
}: {
  title: string
  products: ProductCardData[]
}) {
  return (
    <section className="products" aria-labelledby="products-title">
      <div className="products__layout">
        <ProductsCatalog products={products} categoryLabel={title}>
          <div className="products__head">
            <h1 className="products__title" id="products-title">
              {bindHangingWords(title)}
            </h1>
            <p className="products__lead">
              {bindHangingWords(
                `${title} садового центра Green Market. Саженцы для посадки в сад и на участок: районированные сорта, разные формы кроны, контейнеры и возраста. Поможем выбрать растение под размер участка, почву, освещение и желаемый срок плодоношения. Посадка, полив и формировка зависят от сорта и сезона, поэтому к каждому саженцу даём понятные рекомендации по уходу.`,
              )}
            </p>
          </div>
        </ProductsCatalog>
      </div>
    </section>
  )
}
