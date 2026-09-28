import { describe, expect, it } from 'vitest'
import { getCategoryCopy } from './category-copy'

describe('getCategoryCopy', () => {
  it('returns grasses copy with the decorative heading', () => {
    const copy = getCategoryCopy('zlaki-i-travy')

    expect(copy?.heading).toBe('Декоративные злаки и травы')
    expect(copy?.lead).toContain('Сад, который дышит вместе с вами')
    expect(copy?.paragraphs).toHaveLength(3)
  })

  it('keeps vine wrapping as full sentences', () => {
    const copy = getCategoryCopy('liany')

    expect(copy?.points).toEqual([
      'Кто-то цепляется усиками;',
      'Кто-то держится воздушными корнями;',
      'Кто-то обвивает опору побегами;',
      'А кому-то нужна ваша помощь в виде подвязки.',
    ])
    expect(copy?.afterPoints?.[0]).toContain('проект')
  })

  it('returns nothing for a category without copy', () => {
    expect(getCategoryCopy('rozy')).toBeUndefined()
  })
})
