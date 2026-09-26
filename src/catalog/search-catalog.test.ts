import { describe, expect, it } from 'vitest'
import {
  catalogSearchPath,
  filterProductsBySearch,
  parseSearchQuery,
  productMatchesSearch,
} from './search-catalog'

const apple = {
  name: 'Яблоня колоновидная',
  latin: 'Malus domestica',
  nameTag: 'колоновидная',
}

const kiwi = {
  name: 'Актинидия коломикта «Ароматная»',
  latin: 'Actinidia kolomikta',
}

describe('parseSearchQuery', () => {
  it('normalizes case, yo, quotes and extra spaces', () => {
    expect(parseSearchQuery('  Ёлка  «Nidiformis»  ')).toBe('елка nidiformis')
  })

  it('reads the first query value and truncates', () => {
    expect(parseSearchQuery(['туя', 'ignored'])).toBe('туя')
    expect(parseSearchQuery('а'.repeat(90)).length).toBe(80)
    expect(parseSearchQuery(undefined)).toBe('')
  })
})

describe('catalogSearchPath', () => {
  it('builds a catalog URL with the normalized query', () => {
    expect(catalogSearchPath('  Ябланя  ')).toBe('/catalog?q=%D1%8F%D0%B1%D0%BB%D0%B0%D0%BD%D1%8F')
    expect(catalogSearchPath('я')).toBe('/catalog')
  })
})

describe('productMatchesSearch', () => {
  it('matches name, latin and name tag', () => {
    expect(productMatchesSearch(apple, 'яблоня колон')).toBe(true)
    expect(productMatchesSearch(apple, 'malus')).toBe(true)
    expect(productMatchesSearch(apple, 'колоновид')).toBe(true)
    expect(productMatchesSearch(kiwi, 'ароматная')).toBe(true)
  })

  it('ignores one-letter queries', () => {
    expect(productMatchesSearch(apple, 'я')).toBe(false)
    expect(filterProductsBySearch([apple, kiwi], 'я')).toEqual([])
  })

  it('returns only matching products', () => {
    expect(filterProductsBySearch([apple, kiwi], 'malus')).toEqual([apple])
    expect(filterProductsBySearch([apple, kiwi], 'береза')).toEqual([])
  })

  it('tolerates small typos', () => {
    expect(productMatchesSearch(apple, 'ябланя')).toBe(true)
    expect(productMatchesSearch(apple, 'яблона')).toBe(true)
    expect(filterProductsBySearch([apple, kiwi], 'ябланя')).toEqual([apple])
  })

  it('does not treat a 1-letter slip inside another plant name as a hit', () => {
    expect(productMatchesSearch({ name: 'Пихта канадская' }, 'пион')).toBe(false)
    expect(productMatchesSearch({ name: 'Спирея японская' }, 'пион')).toBe(false)
    expect(productMatchesSearch({ name: 'Хионодокса Люцилии' }, 'пион')).toBe(false)
    expect(productMatchesSearch({ name: 'Пион Sarah Bernhardt' }, 'пион')).toBe(true)
    expect(productMatchesSearch({ name: 'Пион Sarah Bernhardt' }, 'пиен')).toBe(true)
  })

  it('puts unavailable matches last', () => {
    const available = { name: 'Пион Sarah Bernhardt', available: true }
    const missing = { name: 'Пион Coral Charm', available: false }
    const alsoAvailable = { name: 'Пион Felix Crousse', available: true }

    expect(filterProductsBySearch([missing, available, alsoAvailable], 'пион')).toEqual([
      alsoAvailable,
      available,
      missing,
    ])
  })
})
