import type { ProductCardData } from '@/components/ProductCard'
import { ProductCardSlider } from '@/components/ProductCardSlider'

const plantSpecs = [
  { label: 'Высота взрослого растения', value: 'h до 60 см' },
  { label: 'Контейнер', value: 'C3' },
  { label: 'Посадка', value: 'солнце' },
] as const

const plantSpecsShort = [
  { label: 'Высота взрослого растения', value: 'h до 60 см' },
  { label: 'Цвет', value: 'белый' },
  { label: 'Посадка', value: 'солнце' },
] as const

const similarCards: ProductCardData[] = [
  { id: 'similar-1', tag: 'new', available: true, name: 'Яблоня колоновидная', latin: 'Malus domestica', priceRubles: 1900, specs: [...plantSpecsShort] },
  { id: 'similar-2', tag: 'sale', available: true, name: 'Яблоня карликовая', latin: 'Malus domestica', priceRubles: 2400, specs: [...plantSpecs] },
  { id: 'similar-3', tag: null, available: false, name: 'Яблоня медовая', latin: 'Malus domestica', priceRubles: 2800, specs: [...plantSpecs] },
  { id: 'similar-4', tag: 'hit', available: true, name: 'Яблоня зимняя', latin: 'Malus domestica', priceRubles: 3600, specs: [...plantSpecsShort] },
  { id: 'similar-5', tag: 'new', available: true, name: 'Груша компактная', latin: 'Pyrus communis', priceRubles: 4100, specs: [...plantSpecs] },
  { id: 'similar-6', tag: null, available: true, name: 'Слива домашняя', latin: 'Prunus domestica', priceRubles: 3200, specs: [...plantSpecsShort] },
  { id: 'similar-7', tag: 'sale', available: false, name: 'Вишня войлочная', latin: 'Prunus tomentosa', priceRubles: 2600, specs: [...plantSpecs] },
  { id: 'similar-8', tag: 'hit', available: true, name: 'Айва японская', latin: 'Chaenomeles japonica', priceRubles: 2900, specs: [...plantSpecsShort] },
]

const accessoryCards: ProductCardData[] = [
  { id: 'extra-1', tag: 'new', available: true, name: 'Грунт универсальный', priceRubles: 650, specs: [] },
  { id: 'extra-2', tag: 'sale', available: true, name: 'Удобрение для плодовых', priceRubles: 890, specs: [] },
  { id: 'extra-3', tag: null, available: true, name: 'Кашпо садовое', priceRubles: 1400, specs: [] },
  { id: 'extra-4', tag: 'hit', available: true, name: 'Опора для саженца', priceRubles: 420, specs: [] },
  { id: 'extra-5', tag: null, available: false, name: 'Мульча декоративная', priceRubles: 780, specs: [] },
  { id: 'extra-6', tag: 'new', available: true, name: 'Средство защиты', priceRubles: 560, specs: [] },
  { id: 'extra-7', tag: 'sale', available: true, name: 'Секатор садовый', priceRubles: 1250, specs: [] },
  { id: 'extra-8', tag: null, available: true, name: 'Лейка садовая', priceRubles: 980, specs: [] },
]

export function ProductRelated() {
  return (
    <div className="related-feeds">
      <ProductCardSlider title="Похожие товары" titleId="related-similar" cards={similarCards} />
      <ProductCardSlider title="Сопутствующие товары" titleId="related-accessories" cards={accessoryCards} />
    </div>
  )
}
