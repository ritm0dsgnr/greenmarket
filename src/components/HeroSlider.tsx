'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useRef, useState } from 'react'
import type { Swiper as SwiperInstance } from 'swiper'
import { A11y, EffectFade } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { bindHangingWords } from '@/components/bindHangingWords'
import { HeroSignupPopup } from '@/components/HeroSignupPopup'
import { Icon } from '@/components/Icon'
import { getHeroSignupDetails, heroSlides, type HeroSlide } from '@/content/hero-slides'
import 'swiper/css'
import 'swiper/css/effect-fade'

function formatSlideIndex(value: number) {
  return String(value).padStart(2, '0')
}

function motionSpeed() {
  if (typeof window === 'undefined') {
    return 550
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 550
}

function pointerX(event: MouseEvent | TouchEvent | PointerEvent) {
  if ('clientX' in event) {
    return event.clientX
  }

  return event.changedTouches[0]?.clientX ?? 0
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
      </button>
    )
  }

  return (
    <Link className="hero__slide-cta" href={slide.cta.href}>
      {slide.cta.label}
    </Link>
  )
}

export function HeroSlider() {
  const slides = heroSlides
  const swiperRef = useRef<SwiperInstance | null>(null)
  const [index, setIndex] = useState(0)
  const [signupSlide, setSignupSlide] = useState<HeroSlide | null>(null)
  const wrap = slides.length > 1

  const closeSignup = useCallback(() => setSignupSlide(null), [])

  function goTo(nextIndex: number) {
    swiperRef.current?.slideTo(nextIndex, motionSpeed())
  }

  if (slides.length === 0) {
    return null
  }

  return (
    <>
      <div className="hero__slider">
        <div className="hero__viewport">
          <Swiper
            className="hero__swiper"
            wrapperClass="hero__track"
            modules={[A11y, EffectFade]}
            effect="fade"
            fadeEffect={{ crossFade: true }}
            slidesPerView={1}
            speed={550}
            rewind={wrap}
            watchOverflow
            resistanceRatio={0.65}
            onSwiper={(instance) => {
              swiperRef.current = instance
              setIndex(instance.realIndex)
            }}
            onSlideChange={(instance) => {
              setIndex(instance.realIndex)
            }}
            onClick={(swiper, event) => {
              const target = event.target

              if (!(target instanceof Element) || target.closest('a, button, .hero__slide-panel')) {
                return
              }

              const mid = swiper.el.getBoundingClientRect().left + swiper.el.clientWidth / 2
              if (pointerX(event) < mid) {
                swiper.slidePrev(motionSpeed())
                return
              }

              swiper.slideNext(motionSpeed())
            }}
            a11y={{
              enabled: true,
              containerMessage: 'Слайды',
            }}
          >
            {slides.map((slide, slideIndex) => {
              const titleId = `hero-slide-title-${slide.id}`

              return (
                <SwiperSlide className="hero__slide" key={slide.id}>
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
                </SwiperSlide>
              )
            })}
          </Swiper>
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
              onClick={() => swiperRef.current?.slidePrev(motionSpeed())}
            >
              <Icon name="arrow-right" />
            </button>
            <button
              className="hero__control hero__control--next"
              type="button"
              aria-label="Следующий слайд"
              onClick={() => swiperRef.current?.slideNext(motionSpeed())}
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
