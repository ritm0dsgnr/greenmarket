'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'
import type { Swiper as SwiperInstance } from 'swiper'
import { A11y } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Icon } from '@/components/Icon'
import { JournalCard } from '@/components/content/JournalCard'
import { tabletBreakpointPx } from '@/components/slideLayout'
import { siteBlogRoute } from '@/components/siteNav'
import type { JournalItem } from '@/content/journal'
import 'swiper/css'

const gapPx = 16

function motionSpeed() {
  if (typeof window === 'undefined') {
    return 600
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 600
}

export function JournalCardSlider({
  title,
  titleId,
  items,
  titleHref = siteBlogRoute,
  prevLabel,
  nextLabel,
  pagesLabel,
  pageName,
}: {
  title: string
  titleId: string
  items: readonly JournalItem[]
  titleHref?: string
  prevLabel?: string
  nextLabel?: string
  pagesLabel?: string
  pageName?: string
}) {
  const cards = [...items]
  const swiperRef = useRef<SwiperInstance | null>(null)
  const [page, setPage] = useState(0)
  const prevText = prevLabel ?? `Предыдущие, ${title}`
  const nextText = nextLabel ?? `Следующие, ${title}`
  const pagesText = pagesLabel ?? `Пагинация, ${title}`
  const loop = cards.length > 2

  if (cards.length === 0) {
    return null
  }

  return (
    <section className="home-journal" aria-labelledby={titleId}>
      <div className="container">
        <div className="home-journal__slider">
          <button
            className="home-journal__control home-journal__control--prev"
            type="button"
            aria-label={prevText}
            onClick={() => swiperRef.current?.slidePrev(motionSpeed())}
          >
            <Icon name="chevron-down" />
          </button>
          <div className="home-journal__main">
            <div className="home-journal__head">
              <h2 className="home-journal__title" id={titleId}>
                <Link className="home-journal__title-link" href={titleHref}>
                  <Icon name="leaf" className="home-journal__mark" />
                  <span className="home-journal__title-text">{title}</span>
                  <Icon name="leaf" className="home-journal__mark home-journal__mark--mirror" />
                </Link>
              </h2>
            </div>
            <div className="home-journal__viewport">
              <Swiper
                className="home-journal__swiper"
                wrapperClass="home-journal__track"
                modules={[A11y]}
                slidesPerView={1}
                spaceBetween={gapPx}
                speed={600}
                loop={loop}
                watchOverflow
                resistanceRatio={0.65}
                breakpoints={{
                  [tabletBreakpointPx + 1]: {
                    slidesPerView: 2,
                    spaceBetween: gapPx,
                  },
                }}
                onSwiper={(instance) => {
                  swiperRef.current = instance
                  setPage(instance.realIndex)
                }}
                onSlideChange={(instance) => {
                  setPage(instance.realIndex)
                }}
                a11y={{
                  enabled: true,
                  containerMessage: title,
                }}
              >
                {cards.map((item) => (
                  <SwiperSlide className="home-journal__item" key={item.id}>
                    <JournalCard item={item} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
          <button
            className="home-journal__control home-journal__control--next"
            type="button"
            aria-label={nextText}
            onClick={() => swiperRef.current?.slideNext(motionSpeed())}
          >
            <Icon name="chevron-down" />
          </button>
        </div>
        <div className="home-journal__pages" role="group" aria-label={pagesText}>
          {cards.map((item, cardIndex) => {
            const current = cardIndex === page

            return (
              <button
                className={current ? 'home-journal__page is-active' : 'home-journal__page'}
                type="button"
                key={item.id}
                aria-label={
                  pageName
                    ? `${pageName} ${cardIndex + 1} из ${cards.length}`
                    : `${title}, ${cardIndex + 1} из ${cards.length}`
                }
                aria-current={current ? 'true' : undefined}
                onClick={() => {
                  if (loop) {
                    swiperRef.current?.slideToLoop(cardIndex, motionSpeed())
                    return
                  }

                  swiperRef.current?.slideTo(cardIndex, motionSpeed())
                }}
              >
                <Icon name="leaf" />
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
