import { describe, expect, it } from 'vitest'
import {
  HOME_CATALOG_PREFERRED_LABELS,
  selectHomeCatalogCategories,
} from './home-catalog-categories'
import type { PriceCatalogCategory } from '../import/greenmarket-price/types'

function category(label: string, slug = label): PriceCatalogCategory {
  return { slug, label, href: `/catalog/${slug}`, subcategories: [] }
}

describe('selectHomeCatalogCategories', () => {
  it('puts preferred categories first when all exist', () => {
    const categories = [
      category('Плодово-ягодные', 'fruit'),
      category('Хвойные', 'conifers'),
      category('Вересковые', 'heather'),
      category('Гортензии', 'hydrangea'),
      category('Розы', 'roses'),
      category('Многолетники', 'perennials'),
      category('Пряные травы', 'herbs'),
    ]

    expect(selectHomeCatalogCategories(categories).map((item) => item.label)).toEqual([
      ...HOME_CATALOG_PREFERRED_LABELS,
    ])
  })

  it('accepts Плодовые as alias for fruit', () => {
    const categories = [
      category('Плодовые', 'fruit'),
      category('Гортензии', 'hydrangea'),
      category('Пряные травы', 'herbs'),
      category('Многолетники', 'perennials'),
      category('Хвойные', 'conifers'),
    ]

    expect(selectHomeCatalogCategories(categories).map((item) => item.label)).toEqual([
      'Плодовые',
      'Гортензии',
      'Пряные травы',
      'Многолетники',
      'Хвойные',
    ])
  })

  it('fills missing preferred slots from catalog order', () => {
    const categories = [
      category('Вересковые', 'heather'),
      category('Розы', 'roses'),
      category('Гортензии', 'hydrangea'),
      category('Лианы', 'vines'),
    ]

    expect(selectHomeCatalogCategories(categories, 5).map((item) => item.label)).toEqual([
      'Гортензии',
      'Розы',
      'Вересковые',
      'Лианы',
    ])
  })

  it('keeps catalog order when none preferred exist', () => {
    const categories = [
      category('Вересковые', 'a'),
      category('Розы', 'b'),
      category('Лианы', 'c'),
      category('Луковичные', 'd'),
      category('Злаки и травы', 'e'),
      category('Сопутствующие товары', 'f'),
    ]

    expect(selectHomeCatalogCategories(categories).map((item) => item.label)).toEqual([
      'Розы',
      'Вересковые',
      'Лианы',
      'Луковичные',
      'Злаки и травы',
      'Сопутствующие товары',
    ])
  })
})
