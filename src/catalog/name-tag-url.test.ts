import { describe, expect, it } from 'vitest'
import {
  categoryListingPath,
  nameTagListingPath,
  parseNameTagQuery,
  parsePromoTagQuery,
  promoTagListingPath,
  resolveNameTagLabel,
  subcategoryListingPath,
  withListingTagQuery,
} from './name-tag-url'

describe('name-tag-url', () => {
  it('builds listing paths for subcategory and name tags', () => {
    expect(subcategoryListingPath('hvoynye', 'el')).toBe('/catalog/hvoynye/el')
    expect(categoryListingPath('gortenzii')).toBe('/catalog/gortenzii')
    expect(nameTagListingPath('hvoynye', 'el', 'колючая')).toBe('/catalog/hvoynye/el?tag=kolyuchaya')
    expect(nameTagListingPath('hvoynye', 'el', ['обыкновенная', 'колючая'])).toBe(
      '/catalog/hvoynye/el?tag=kolyuchaya&tag=obyknovennaya',
    )
  })

  it('builds listing paths for promo tags and combined filters', () => {
    expect(promoTagListingPath('hvoynye', 'el', 'new')).toBe('/catalog/hvoynye/el?promo=new')
    expect(
      withListingTagQuery('/catalog/hvoynye/el', {
        promoTags: ['sale', 'new'],
        nameTags: ['колючая'],
      }),
    ).toBe('/catalog/hvoynye/el?promo=new&promo=sale&tag=kolyuchaya')
  })

  it('parses multiple name and promo tags from query', () => {
    const available = ['колючая', 'обыкновенная', 'Бордюр']

    expect(parseNameTagQuery(available, 'kolyuchaya')).toEqual(['колючая'])
    expect(parseNameTagQuery(available, ['kolyuchaya', 'obyknovennaya'])).toEqual([
      'колючая',
      'обыкновенная',
    ])
    expect(parsePromoTagQuery(['new', 'sale'])).toEqual(['new', 'sale'])
    expect(parsePromoTagQuery('hit,new')).toEqual(['hit', 'new'])
    expect(parsePromoTagQuery('unknown')).toEqual([])
    expect(resolveNameTagLabel(available, 'bordyur')).toBe('Бордюр')
  })
})
