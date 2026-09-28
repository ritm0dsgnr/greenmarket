'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'
import type { Swiper as SwiperInstance } from 'swiper'
import { A11y } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Icon } from '@/components/Icon'
import { ProductCard, type ProductCardData } from '@/components/ProductCard'
import { tabletBreakpointPx } from '@/components/slideLayout'
import 'swiper/css'

const gapPx = 16

function motionSpeed() {
  if (typeof window === 'undefined') {
    return 600
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 600
}

export function ProductCardSlider({
  title,
  titleId,
  titleHref,
  cards,
  block = 'related',
  prevLabel,
  nextLabel,
  pagesLabel,
  pageName,
}: {
  title: string
  titleId: string
  titleHref?: string
  cards: ProductCardData[]
  block?: 'related' | 'novelties'
  prevLabel?: string
  nextLabel?: string
  pagesLabel?: string
  pageName?: string
}) {
  const swiperRef = useRef<SwiperInstance | null>(null)
  const [page, setPage] = useState(0)
  const prevText = prevLabel ?? `Предыдущие, ${title}`
  const nextText = nextLabel ?? `Следующие, ${title}`
  const pagesText = pagesLabel ?? `Пагинация, ${title}`
  const loop = cards.length > 4

  if (cards.length === 0) {
    return null
  }

  return (
    <section className={block} aria-labelledby={titleId}>
      <div className="container">
        <div className={`${block}__head`}>
          <h2 className={`${block}__title`} id={titleId}>
            {titleHref ? (
              <Link className={`${block}__title-link`} href={titleHref}>
                <Icon name="leaf" className={`${block}__mark`} />
                <span className={`${block}__title-text`}>{title}</span>
                <Icon name="leaf" className={`${block}__mark ${block}__mark--mirror`} />
              </Link>
            ) : (
              <>
                <Icon name="leaf" className={`${block}__mark`} />
                <span className={`${block}__title-text`}>{title}</span>
                <Icon name="leaf" className={`${block}__mark ${block}__mark--mirror`} />
              </>
            )}
          </h2>
        </div>
        <div className={`${block}__slider`}>
          <button
            className={`${block}__control ${block}__control--prev`}
            type="button"
            aria-label={prevText}
            onClick={() => swiperRef.current?.slidePrev(motionSpeed())}
          >
            <Icon name="chevron-down" />
          </button>
          <div className={`${block}__viewport`}>
            <Swiper
              className={`${block}__swiper`}
              wrapperClass={`${block}__track`}
              modules={[A11y]}
              slidesPerView={2}
              spaceBetween={gapPx}
              speed={600}
              loop={loop}
              watchOverflow
              resistanceRatio={0.65}
              breakpoints={{
                [tabletBreakpointPx + 1]: {
                  slidesPerView: 4,
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
              {cards.map((card) => (
                <SwiperSlide className={`${block}__item`} key={card.id}>
                  <ProductCard card={card} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
          <button
            className={`${block}__control ${block}__control--next`}
            type="button"
            aria-label={nextText}
            onClick={() => swiperRef.current?.slideNext(motionSpeed())}
          >
            <Icon name="chevron-down" />
          </button>
        </div>
        <div className={`${block}__pages`} role="group" aria-label={pagesText}>
          {cards.map((card, cardIndex) => {
            const current = cardIndex === page

            return (
              <button
                className={current ? `${block}__page is-active` : `${block}__page`}
                type="button"
                key={card.id}
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
