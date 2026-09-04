import { describe, expect, it } from 'vitest'
import { catalogCardImageSrc } from './catalog-card-images'

describe('catalogCardImageSrc', () => {
  it('resolves known category and subcategory photos', () => {
    expect(catalogCardImageSrc('/catalog/hvoynye')).toBe('/img/catalog/hvoynye.20260904.png')
    expect(catalogCardImageSrc('/catalog/rozy')).toBe('/img/catalog/rozy.20260904.png')
    expect(catalogCardImageSrc('/catalog/pryanye-travy')).toBe('/img/catalog/pryanye-travy.20260904.png')
    expect(catalogCardImageSrc('/catalog/zlaki-i-travy')).toBe('/img/catalog/zlaki-i-travy.20260904.png')
    expect(catalogCardImageSrc('/catalog/liany/knyazhik')).toBe('/img/catalog/knyazhik.20260904.png')
    expect(catalogCardImageSrc('/catalog/mnogoletniki/pion')).toBe('/img/catalog/pion.20260904.png')
    expect(catalogCardImageSrc('/catalog/plodovo-yagodnye/grusha')).toBe('/img/catalog/grusha.20260904.png')
    expect(catalogCardImageSrc('/catalog/hvoynye/sosna')).toBe('/img/catalog/sosna.20260904.png')
    expect(catalogCardImageSrc('/catalog/mnogoletniki/hosta')).toBe('/img/catalog/hosta.20260904.png')
  })

  it('falls back to placeholder', () => {
    expect(catalogCardImageSrc('/catalog/unknown')).toBe('/img/placeholder.svg')
  })
})
