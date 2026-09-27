import { describe, expect, it } from 'vitest'
import { mergeYoTwinSubcategories, resolveSubcategorySlug } from './merge-yo-subcategories'

const mono = {
  id: 'derevya-24',
  sourceRowNumber: 24,
  name: 'Клен Моно (многоствольный)',
  available: true,
  specs: [],
  offers: [],
}

const ginnala = {
  id: 'derevya-20',
  sourceRowNumber: 20,
  name: 'Клён Гиннала (приречный)',
  available: true,
  specs: [],
  offers: [],
}

describe('mergeYoTwinSubcategories', () => {
  it('joins Клен and Клён into one card', () => {
    const { items, aliases } = mergeYoTwinSubcategories([
      { slug: 'klen', label: 'Клен', products: [mono] },
      { slug: 'klen-2', label: 'Клён', products: [ginnala] },
    ])

    expect(items).toHaveLength(1)
    expect(items[0]?.slug).toBe('klen')
    expect(items[0]?.label).toBe('Клён')
    expect(items[0]?.products.map((product) => product.id)).toEqual(['derevya-20', 'derevya-24'])
    expect(aliases).toEqual({ 'klen-2': 'klen' })
    expect(resolveSubcategorySlug({ derevya: aliases }, 'derevya', 'klen-2')).toBe('klen')
  })

  it('orders cards by Russian alphabet', () => {
    const { items } = mergeYoTwinSubcategories([
      { slug: 'yasen', label: 'Ясень', products: [mono] },
      { slug: 'bereza', label: 'Берёза', products: [ginnala] },
      { slug: 'klen', label: 'Клён', products: [mono] },
    ])

    expect(items.map((item) => item.label)).toEqual(['Берёза', 'Клён', 'Ясень'])
  })
})
