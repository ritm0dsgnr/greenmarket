import type { ProductCardData } from '@/components/ProductCard'
import { ProductCardSlider } from '@/components/ProductCardSlider'

const noveltySpecs = [
  { label: 'Высота взрослого растения', value: 'h до 60 см' },
  { label: 'Контейнер', value: 'C3' },
  { label: 'Цвет', value: 'розовый' },
] as const

const noveltySpecsSingle = [
  { label: 'Высота взрослого растения', value: 'h до 60 см' },
  { label: 'Цвет', value: 'розовый' },
  { label: 'Посадка', value: 'солнце' },
] as const

const cards: ProductCardData[] = [
  { id: '1', tag: 'new', available: true, name: 'Роза флорибунда', latin: 'Rosa Jubile du Prince de Monaco', priceRubles: 1900, specs: [...noveltySpecsSingle] },
  { id: '2', tag: 'sale', available: true, name: 'Роза флорибунда', latin: 'Rosa Jubile du Prince de Monaco', priceRubles: 2400, specs: [...noveltySpecs] },
  { id: '3', tag: null, available: false, name: 'Роза флорибунда', latin: 'Rosa Jubile du Prince de Monaco', priceRubles: 2800, specs: [...noveltySpecs] },
  { id: '4', tag: 'new', available: true, name: 'Роза флорибунда', latin: 'Rosa Jubile du Prince de Monaco', priceRubles: 3600, specs: [...noveltySpecsSingle] },
  { id: '5', tag: 'sale', available: true, name: 'Роза флорибунда', latin: 'Rosa Jubile du Prince de Monaco', priceRubles: 4500, specs: [...noveltySpecs] },
  { id: '6', tag: 'hit', available: true, name: 'Роза флорибунда', latin: 'Rosa Jubile du Prince de Monaco', priceRubles: 5200, specs: [...noveltySpecs] },
  { id: '7', tag: null, available: false, name: 'Роза флорибунда', latin: 'Rosa Jubile du Prince de Monaco', priceRubles: 6800, specs: [...noveltySpecsSingle] },
  { id: '8', tag: 'new', available: true, name: 'Роза флорибунда', latin: 'Rosa Jubile du Prince de Monaco', priceRubles: 8500, specs: [...noveltySpecs] },
]

export function HomeNovelties() {
  return (
    <ProductCardSlider
      block="novelties"
      title="Новинки сезона"
      titleId="novelties-title"
      cards={cards}
      prevLabel="Предыдущие новинки сезона"
      nextLabel="Следующие новинки сезона"
      pagesLabel="Пагинация новинок сезона"
      pageName="Новинка"
    />
  )
}
