import { describe, expect, it } from 'vitest'
import { heroSlides } from './hero-slides'

describe('heroSlides', () => {
  it('has manual fixture slides with photo, copy and cta', () => {
    expect(heroSlides.length).toBeGreaterThan(0)

    for (const slide of heroSlides) {
      expect(slide.id).toBeTruthy()
      expect(slide.title).toBeTruthy()
      expect(slide.text).toBeTruthy()
      expect(slide.imageSrc).toMatch(/^\//)
      expect(slide.cta.label).toBeTruthy()

      if (slide.cta.kind === 'link') {
        expect(slide.cta.href).toMatch(/^\//)
      } else {
        expect(slide.cta.kind).toBe('signup')
      }
    }
  })

  it('includes a novelties catalog link and an event signup popup', () => {
    expect(
      heroSlides.some(
        (slide) => slide.cta.kind === 'link' && slide.cta.href.includes('promo=new'),
      ),
    ).toBe(true)
    expect(heroSlides.some((slide) => slide.cta.kind === 'signup')).toBe(true)
    expect(heroSlides.some((slide) => Boolean(slide.dateLabel && slide.priceLabel))).toBe(true)
  })
})
