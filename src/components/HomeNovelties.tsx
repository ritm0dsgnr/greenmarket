import { ProductCardSlider } from '@/components/ProductCardSlider'
import { getHomeNoveltyCards, homeNoveltiesListingPath } from '@/catalog/home-novelties'

export function HomeNovelties() {
  const cards = getHomeNoveltyCards()

  if (cards.length === 0) {
    return null
  }

  return (
    <ProductCardSlider
      block="novelties"
      title="Новинки сезона"
      titleId="novelties-title"
      titleHref={homeNoveltiesListingPath}
      cards={cards}
      prevLabel="Предыдущие новинки сезона"
      nextLabel="Следующие новинки сезона"
      pagesLabel="Пагинация новинок сезона"
      pageName="Новинка"
    />
  )
}
