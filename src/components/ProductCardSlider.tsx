'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import type { TransitionEvent } from 'react'
import { Icon } from '@/components/Icon'
import { ProductCard, type ProductCardData } from '@/components/ProductCard'

const visibleCount = 4
const cardStep = 36.1

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function ProductCardSlider({
  title,
  titleId,
  cards,
}: {
  title: string
  titleId: string
  cards: ProductCardData[]
}) {
  const loopStart = cards.length
  const loopEnd = cards.length * 2
  const trackCards = [...cards, ...cards, ...cards]
  const [index, setIndex] = useState(loopStart)
  const [animate, setAnimate] = useState(true)
  const locked = useRef(false)
  const page = ((index - loopStart) % cards.length + cards.length) % cards.length

  function wrapPage(value: number) {
    return ((value % cards.length) + cards.length) % cards.length
  }

  function shortestStep(from: number, to: number) {
    const delta = wrapPage(to - from)

    if (delta > cards.length / 2) {
      return delta - cards.length
    }

    return delta
  }

  useLayoutEffect(() => {
    if (animate) {
      return
    }

    let innerFrame = 0
    const outerFrame = requestAnimationFrame(() => {
      innerFrame = requestAnimationFrame(() => {
        setAnimate(true)
      })
    })

    return () => {
      cancelAnimationFrame(outerFrame)
      cancelAnimationFrame(innerFrame)
    }
  }, [animate, index])

  const goTo = (step: number) => {
    if (step === 0) {
      return
    }

    if (prefersReducedMotion()) {
      setAnimate(false)
      setIndex((current) => wrapPage(current + step - loopStart) + loopStart)
      return
    }

    if (locked.current) {
      return
    }

    locked.current = true
    setAnimate(true)
    setIndex((current) => current + step)
  }

  const handleTransitionEnd = (event: TransitionEvent<HTMLUListElement>) => {
    if (event.target !== event.currentTarget) {
      return
    }

    if (event.propertyName !== 'transform') {
      return
    }

    locked.current = false

    if (index >= loopEnd) {
      setAnimate(false)
      setIndex(index - cards.length)
      return
    }

    if (index < loopStart) {
      setAnimate(false)
      setIndex(index + cards.length)
    }
  }

  if (cards.length === 0) {
    return null
  }

  return (
    <section className="related" aria-labelledby={titleId}>
      <div className="container">
        <div className="related__head">
          <h2 className="related__title" id={titleId}>
            <Icon name="leaf" className="related__mark" />
            {title}
            <Icon name="leaf" className="related__mark related__mark--mirror" />
          </h2>
        </div>
        <div className="related__slider">
          <button
            className="related__control related__control--prev"
            type="button"
            aria-label={`Предыдущие, ${title}`}
            onClick={() => goTo(-1)}
          >
            <Icon name="chevron-down" />
          </button>
          <div className="related__viewport">
            <ul
              className={animate ? 'related__track' : 'related__track is-instant'}
              style={{ transform: `translateX(-${index * cardStep}rem)` }}
              onTransitionEnd={handleTransitionEnd}
            >
              {trackCards.map((card, trackIndex) => {
                const hidden = trackIndex < index || trackIndex >= index + visibleCount

                return (
                  <li
                    className="related__item"
                    key={`${card.id}-${trackIndex}`}
                    aria-hidden={hidden}
                    inert={hidden ? true : undefined}
                  >
                    <ProductCard card={card} />
                  </li>
                )
              })}
            </ul>
          </div>
          <button
            className="related__control related__control--next"
            type="button"
            aria-label={`Следующие, ${title}`}
            onClick={() => goTo(1)}
          >
            <Icon name="chevron-down" />
          </button>
        </div>
        <div className="related__pages" role="group" aria-label={`Пагинация, ${title}`}>
          {cards.map((card, cardIndex) => {
            const current = cardIndex === page

            return (
              <button
                className={current ? 'related__page is-active' : 'related__page'}
                type="button"
                key={card.id}
                aria-label={`${title}, ${cardIndex + 1} из ${cards.length}`}
                aria-current={current ? 'true' : undefined}
                onClick={() => goTo(shortestStep(page, cardIndex))}
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
