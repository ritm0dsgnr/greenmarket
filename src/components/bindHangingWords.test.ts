import { describe, expect, it } from 'vitest'
import { bindHangingWords } from './bindHangingWords'

describe('bindHangingWords', () => {
  it('glues conjunctions and prepositions to the next word', () => {
    expect(bindHangingWords('Аллейно-парковые и другие деревья')).toBe(
      'Аллейно-парковые и\u00A0другие деревья',
    )
    expect(bindHangingWords('Пряные и лекарственные травы')).toBe(
      'Пряные и\u00A0лекарственные травы',
    )
    expect(bindHangingWords('Растения для сада и огорода')).toBe(
      'Растения для\u00A0сада и\u00A0огорода',
    )
  })

  it('leaves titles without hanging words unchanged', () => {
    expect(bindHangingWords('Декоративные кустарники')).toBe('Декоративные кустарники')
  })
})
