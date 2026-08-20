import { describe, expect, it } from 'vitest'
import { slideLayout } from './slideLayout'

describe('slideLayout', () => {
  const span = 345
  const gap = 16

  it('keeps four desktop cards when the viewport is wide enough', () => {
    expect(slideLayout(1428, span, gap, 1920)).toEqual({ visible: 4, span })
  })

  it('fits two cards on a tablet-width window', () => {
    expect(slideLayout(720, span, gap, 900)).toEqual({ visible: 2, span: (720 - gap) / 2 })
  })

  it('uses the full viewport for a single phone card', () => {
    expect(slideLayout(343, span, gap, 390)).toEqual({ visible: 1, span: 343 })
  })

  it('falls back from four desktop cards when the measured viewport is too narrow', () => {
    expect(slideLayout(720, span, gap, 1280)).toEqual({ visible: 2, span: (720 - gap) / 2 })
  })
})
