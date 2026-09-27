import { describe, expect, it } from 'vitest'
import { catalogCardImageSrc } from './catalog-card-images'

describe('catalogCardImageSrc', () => {
  it('resolves known category and subcategory photos', () => {
    expect(catalogCardImageSrc('/catalog/hvoynye')).toBe('/img/catalog/hvoynye.20260904.png')
    expect(catalogCardImageSrc('/catalog/plodovo-yagodnye')).toBe(
      '/img/catalog/plodovo-yagodnye.20260926.png',
    )
    expect(catalogCardImageSrc('/catalog/rozy')).toBe('/img/catalog/rozy.20260925c.png')
    expect(catalogCardImageSrc('/catalog/pryanye-travy')).toBe('/img/catalog/pryanye-travy.20260925.png')
    expect(catalogCardImageSrc('/catalog/zlaki-i-travy')).toBe('/img/catalog/zlaki-i-travy.20260925.png')
    expect(catalogCardImageSrc('/catalog/vereskovye')).toBe('/img/catalog/vereskovye.20260925.png')
    expect(catalogCardImageSrc('/catalog/derevya')).toBe('/img/catalog/derevya.20260925.png')
    expect(catalogCardImageSrc('/catalog/dekorativnye-kustarniki')).toBe(
      '/img/catalog/dekorativnye-kustarniki.20260925b.png',
    )
    expect(catalogCardImageSrc('/catalog/liany')).toBe('/img/catalog/liany.20260925.png')
    expect(catalogCardImageSrc('/catalog/vereskovye/rododendron')).toBe(
      '/img/catalog/rododendron.20260925.png',
    )
    expect(catalogCardImageSrc('/catalog/vereskovye/erika')).toBe('/img/catalog/erika.20260925.png')
    expect(catalogCardImageSrc('/catalog/dekorativnye-kustarniki/spireya')).toBe(
      '/img/catalog/spireya.20260925b.png',
    )
    expect(catalogCardImageSrc('/catalog/liany/knyazhik')).toBe('/img/catalog/knyazhik.20260904.png')
    expect(catalogCardImageSrc('/catalog/mnogoletniki/pion')).toBe('/img/catalog/pion.20260904.png')
    expect(catalogCardImageSrc('/catalog/plodovo-yagodnye/grusha')).toBe('/img/catalog/grusha.20260904.png')
    expect(catalogCardImageSrc('/catalog/hvoynye/sosna')).toBe('/img/catalog/sosna.20260926c.png')
    expect(catalogCardImageSrc('/catalog/mnogoletniki/hosta')).toBe('/img/catalog/hosta.20260904.png')
    expect(catalogCardImageSrc('/catalog/plodovo-yagodnye/golubika')).toBe(
      '/img/catalog/golubika.20260926.png',
    )
    expect(catalogCardImageSrc('/catalog/derevya/dub')).toBe('/img/catalog/dub.20260926.png')
    expect(catalogCardImageSrc('/catalog/hvoynye/el')).toBe('/img/catalog/el.20260926.png')
    expect(catalogCardImageSrc('/catalog/pryanye-travy/lavanda')).toBe(
      '/img/catalog/lavanda.20260926.png',
    )
    expect(catalogCardImageSrc('/catalog/plodovo-yagodnye/klubnika')).toBe(
      '/img/catalog/klubnika.20260926c.png',
    )
    expect(catalogCardImageSrc('/catalog/derevya/klen')).toBe('/img/catalog/klen.20260926c.png')
    expect(catalogCardImageSrc('/catalog/lukovichnye/muskari')).toBe(
      '/img/catalog/muskari.20260926c.png',
    )
    expect(catalogCardImageSrc('/catalog/soputstvuyuschie-tovary/sadovaya-odezhda')).toBe(
      '/img/catalog/sadovaya-odezhda.20260926.png',
    )
    expect(catalogCardImageSrc('/catalog/liany/aktinidiya')).toBe(
      '/img/catalog/aktinidiya.20260926d.png',
    )
    expect(catalogCardImageSrc('/catalog/soputstvuyuschie-tovary/sadovaya-mebel')).toBe(
      '/img/catalog/sadovaya-mebel.20260926d.png',
    )
    expect(catalogCardImageSrc('/catalog/dekorativnye-kustarniki/zhimolost')).toBe(
      '/img/catalog/zhimolost.20260926d.png',
    )
    expect(catalogCardImageSrc('/catalog/derevya/vyaz')).toBe('/img/catalog/vyaz.20260927.png')
    expect(catalogCardImageSrc('/catalog/mnogoletniki/astra')).toBe('/img/catalog/astra.20260927.png')
    expect(catalogCardImageSrc('/catalog/soputstvuyuschie-tovary')).toBe(
      '/img/catalog/soputstvuyuschie-tovary.20260927.png',
    )
  })

  it('falls back to placeholder', () => {
    expect(catalogCardImageSrc('/catalog/unknown')).toBe('/img/placeholder.svg')
  })
})
