import { describe, expect, it } from 'vitest'
import { catalogCardImageSrc } from './catalog-card-images'

describe('catalogCardImageSrc', () => {
  it('resolves known category and subcategory photos', () => {
    expect(catalogCardImageSrc('/catalog/hvoynye')).toBe('/img/catalog/hvoynye.png')
    expect(catalogCardImageSrc('/catalog/liany/knyazhik')).toBe('/img/catalog/knyazhik.png')
    expect(catalogCardImageSrc('/catalog/mnogoletniki/pion')).toBe('/img/catalog/pion.png')
  })

  it('falls back to placeholder', () => {
    expect(catalogCardImageSrc('/catalog/unknown')).toBe('/img/placeholder.svg')
  })
})
