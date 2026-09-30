import { describe, expect, it } from 'vitest'
import { stripQuotedNameParts, subcategoryCardTitle } from './subcategory-card-title'

describe('subcategoryCardTitle', () => {
  it('uses the product name when the subcategory has one item', () => {
    expect(
      subcategoryCardTitle({
        label: 'Вяз',
        products: [{ name: 'Вяз мелколистный' }],
      }),
    ).toBe('Вяз мелколистный')
  })

  it('drops cultivar quotes from a single product title', () => {
    expect(
      subcategoryCardTitle({
        label: 'Ель',
        products: [{ name: 'Ель колючая "Bialobok"' }],
      }),
    ).toBe('Ель колючая')
    expect(stripQuotedNameParts('Актинидия коломикта "Ароматная" (женская)')).toBe(
      'Актинидия коломикта (женская)',
    )
  })

  it('keeps the genus label when there are several products', () => {
    expect(
      subcategoryCardTitle({
        label: 'Клён',
        products: [{ name: 'Клён Гиннала (приречный)' }, { name: 'Клен Моно (многоствольный)' }],
      }),
    ).toBe('Клён')
  })

  it('prefers a multiline display label over a single product name', () => {
    expect(
      subcategoryCardTitle({
        label: 'Родиола розовая\n(золотой корень)',
        products: [{ name: 'Родиола розовая (золотой корень)' }],
      }),
    ).toBe('Родиола розовая\n(золотой корень)')
  })
})
