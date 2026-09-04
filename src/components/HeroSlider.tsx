'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useState } from 'react'
import { bindHangingWords } from '@/components/bindHangingWords'
import { HeroSignupPopup } from '@/components/HeroSignupPopup'
import { Icon } from '@/components/Icon'
import { useSwipePager } from '@/components/useSwipePager'
import { getHeroSignupDetails, heroSlides, type HeroSlide } from '@/content/hero-slides'

function formatSlideIndex(value: number) {
  return String(value).padStart(2, '0')
}

function HeroSlideCta({
  slide,
  onSignup,
}: {
  slide: HeroSlide
  onSignup: (slide: HeroSlide) => void
}) {
  if (slide.cta.kind === 'signup') {
    return (
      <button className="hero__slide-cta" type="button" onClick={() => onSignup(slide)}>
        {slide.cta.label}
        <Icon name="arrow-right" className="hero__slide-cta-arrow" />
      </button>
    )
  }

  return (
    <Link className="hero__slide-cta" href={slide.cta.href}>
      {slide.cta.label}
      <Icon name="arrow-right" className="hero__slide-cta-arrow" />
    </Link>
  )
}

export function HeroSlider() {
  const slides = heroSlides
  const [index, setIndex] = useState(0)
  const [signupSlide, setSignupSlide] = useState<HeroSlide | null>(null)
  const lastIndex = slides.length - 1

  const goTo = useCallback(
    (nextIndex: number) => {
      if (slides.length === 0) {
        return
      }

      if (nextIndex < 0) {
        setIndex(lastIndex)
        return
      }

      if (nextIndex > lastIndex) {
        setIndex(0)
        return
      }

      setIndex(nextIndex)
    },
    [lastIndex, slides.length],
  )

  const swipe = useSwipePager((direction) => goTo(index + direction))
  const closeSignup = useCallback(() => setSignupSlide(null), [])

  if (slides.length === 0) {
    return null
  }

  return (
    <>
      <div className="hero__slider">
        <div
          className={['hero__viewport', swipe.dragging ? 'is-dragging' : '']
            .filter(Boolean)
            .join(' ')}
          {...swipe.bind}
        >
          <ul className="hero__track hero__track--fade">
            {slides.map((slide, slideIndex) => {
              const current = slideIndex === index
              const titleId = `hero-slide-title-${slide.id}`

              return (
                <li
                  className={['hero__slide', current ? 'is-active' : ''].filter(Boolean).join(' ')}
                  key={slide.id}
                  aria-hidden={!current}
                  inert={!current ? true : undefined}
                >
                  <Image
                    className="hero__slide-image"
                    src={slide.imageSrc}
                    alt={slide.imageAlt ?? ''}
                    width={1200}
                    height={1600}
                    priority={slideIndex === 0}
                  />
                  <div className="hero__slide-veil" aria-hidden="true" />
                  <div className="hero__slide-panel" aria-labelledby={titleId}>
                    {(slide.dateLabel || slide.priceLabel) && (
                      <ul className="hero__slide-meta" aria-label="Детали">
                        {slide.dateLabel ? (
                          <li>
                            <span className="hero__slide-chip hero__slide-chip--date">
                              {slide.dateTime ? (
                                <time dateTime={slide.dateTime}>{slide.dateLabel}</time>
                              ) : (
                                slide.dateLabel
                              )}
                            </span>
                          </li>
                        ) : null}
                        {slide.priceLabel ? (
                          <li>
                            <span className="hero__slide-chip hero__slide-chip--price">
                              {slide.priceLabel}
                            </span>
                          </li>
                        ) : null}
                      </ul>
                    )}
                    <h2 className="hero__slide-title" id={titleId}>
                      {bindHangingWords(slide.title)}
                    </h2>
                    <p className="hero__slide-text">{bindHangingWords(slide.text)}</p>
                    <HeroSlideCta slide={slide} onSignup={setSignupSlide} />
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="hero__rail">
          <p className="hero__index" aria-live="polite">
            <span className="hero__index-current">{formatSlideIndex(index + 1)}</span>
            <span className="hero__index-sep" aria-hidden="true">
              /
            </span>
            <span className="hero__index-total">{formatSlideIndex(slides.length)}</span>
          </p>

          <div className="hero__dots" role="tablist" aria-label="Слайды">
            {slides.map((slide, slideIndex) => (
              <button
                className={['hero__dot', slideIndex === index ? 'is-active' : '']
                  .filter(Boolean)
                  .join(' ')}
                type="button"
                role="tab"
                aria-selected={slideIndex === index}
                aria-label={`Слайд ${slideIndex + 1}: ${slide.title}`}
                key={slide.id}
                onClick={() => goTo(slideIndex)}
              />
            ))}
          </div>

          <div className="hero__controls">
            <button
              className="hero__control hero__control--prev"
              type="button"
              aria-label="Предыдущий слайд"
              onClick={() => goTo(index - 1)}
            >
              <Icon name="arrow-right" />
            </button>
            <button
              className="hero__control hero__control--next"
              type="button"
              aria-label="Следующий слайд"
              onClick={() => goTo(index + 1)}
            >
              <Icon name="arrow-right" />
            </button>
          </div>
        </div>
      </div>

      <HeroSignupPopup
        open={signupSlide != null}
        title={signupSlide?.title ?? 'Запись'}
        details={signupSlide ? getHeroSignupDetails(signupSlide) : null}
        onClose={closeSignup}
      />
    </>
  )
}
