import { describe, expect, it } from 'vitest'
import {
  isFlatCatalogCategory,
  listCatalogGroupEntries,
  listCatalogGroupNavEntries,
  relatedCategoryFixture,
} from './flat-catalog-categories'

describe('isFlatCatalogCategory', () => {
  it('marks hydrangeas and roses as flat', () => {
    expect(isFlatCatalogCategory({ label: 'Гортензии' })).toBe(true)
    expect(isFlatCatalogCategory({ label: 'Розы' })).toBe(true)
  })

  it('keeps other categories nested', () => {
    expect(isFlatCatalogCategory({ label: 'Хвойные' })).toBe(false)
    expect(isFlatCatalogCategory({ label: 'Плодово-ягодные' })).toBe(false)
    expect(isFlatCatalogCategory({ label: 'Сопутствующие товары' })).toBe(false)
  })
})

describe('listCatalogGroupEntries', () => {
  it('expands related goods into section cards', () => {
    const entries = listCatalogGroupEntries({
      title: 'Сопутствующие товары',
      items: [
        relatedCategoryFixture([
          { slug: 'sadovyy-dekor', label: 'Садовый декор', productCount: 3 },
          { slug: 'sadovaya-odezhda', label: 'Садовая одежда', productCount: 2 },
        ]),
      ],
    })

    expect(entries).toEqual([
      {
        key: 'soputstvuyuschie-tovary/sadovyy-dekor',
        label: 'Садовый декор',
        href: '/catalog/soputstvuyuschie-tovary/sadovyy-dekor',
        productCount: 3,
      },
      {
        key: 'soputstvuyuschie-tovary/sadovaya-odezhda',
        label: 'Садовая одежда',
        href: '/catalog/soputstvuyuschie-tovary/sadovaya-odezhda',
        productCount: 2,
      },
    ])
  })

  it('keeps plant categories as single cards', () => {
    const entries = listCatalogGroupEntries({
      title: 'Растения',
      items: [
        {
          slug: 'hvoynye',
          label: 'Хвойные',
          href: '/catalog/hvoynye',
          subcategories: [],
        },
      ],
    })

    expect(entries).toEqual([
      {
        key: 'hvoynye',
        label: 'Хвойные',
        href: '/catalog/hvoynye',
      },
    ])
  })
})

describe('listCatalogGroupNavEntries', () => {
  it('supports information groups without a title', () => {
    expect(
      listCatalogGroupNavEntries({
        items: [{ label: 'Доставка', href: '/delivery' }],
      }),
    ).toEqual([{ label: 'Доставка', href: '/delivery' }])
  })
})
