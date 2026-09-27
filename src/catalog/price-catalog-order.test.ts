import { describe, expect, it } from 'vitest'
import { catalogCategories } from './price-catalog'

describe('catalog subcategory order', () => {
  it('lists every category grid alphabetically', () => {
    for (const category of catalogCategories) {
      const labels = category.subcategories.map((item) => item.label)
      const sorted = [...labels].sort((left, right) => left.localeCompare(right, 'ru'))

      expect(labels, category.slug).toEqual(sorted)
    }
  })
})
