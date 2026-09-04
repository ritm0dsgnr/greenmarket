import type { ProductCardData } from '@/components/ProductCard'
import { ProductCardSlider } from '@/components/ProductCardSlider'

export function ProductRelated({ cards = [] }: { cards?: ProductCardData[] }) {
  if (cards.length === 0) {
    return null
  }

  return (
    <div className="related-feeds">
      <ProductCardSlider title="Похожие товары" titleId="related-similar" cards={cards} />
    </div>
  )
}
