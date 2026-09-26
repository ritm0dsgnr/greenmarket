import { describe, expect, it } from 'vitest'
import {
  extractNameParts,
  foldYo,
  preferYoLabel,
  subcategoryGroupKey,
  subcategoryLabelFromFirstWord,
} from './name-parts'

describe('extractNameParts', () => {
  it('splits plant names into first word subcategory and second word tag', () => {
    expect(extractNameParts('Ель колючая "Bialobok"')).toEqual({
      firstWord: 'Ель',
      secondWord: 'колючая',
    })

    expect(extractNameParts('Можжевельник горизонтальный "Andorra Compakta"')).toEqual({
      firstWord: 'Можжевельник',
      secondWord: 'горизонтальный',
    })
  })

  it('preserves subcategory casing from the source name', () => {
    expect(subcategoryLabelFromFirstWord('ель', 'Ель колючая')).toBe('Ель')
  })

  it('treats е and ё as the same subcategory key', () => {
    expect(foldYo('Клён')).toBe('клен')
    expect(subcategoryGroupKey('Клен')).toBe(subcategoryGroupKey('Клён'))
    expect(preferYoLabel(['Клен', 'Клён'])).toBe('Клён')
  })

  it('strips trailing punctuation from words', () => {
    expect(extractNameParts('Бордюр ландшафтный, черный')).toEqual({
      firstWord: 'Бордюр',
      secondWord: 'ландшафтный',
    })
  })
})
