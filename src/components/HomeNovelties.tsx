'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import type { TransitionEvent } from 'react'
import { Icon } from '@/components/Icon'
import { ProductCard, type ProductCardData } from '@/components/ProductCard'

const noveltySpecs = [
  { label: 'Высота взрослого растения', value: 'h до 60 см' },
  { label: 'Контейнер', value: 'C3' },
  { label: 'Цвет', value: 'розовый' },
] as const

const noveltySpecsSingle = [
  { label: 'Высота взрослого растения', value: 'h до 60 см' },
  { label: 'Цвет', value: 'розовый' },
  { label: 'Посадка', value: 'солнце' },
] as const

const cards: ProductCardData[] = [
  { id: '1', tag: 'new', available: true, name: 'Роза флорибунда', latin: 'Rosa Jubile du Prince de Monaco', priceRubles: 1900, specs: [...noveltySpecsSingle] },
  { id: '2', tag: 'sale', available: true, name: 'Роза флорибунда', latin: 'Rosa Jubile du Prince de Monaco', priceRubles: 2400, specs: [...noveltySpecs] },
  { id: '3', tag: null, available: false, name: 'Роза флорибунда', latin: 'Rosa Jubile du Prince de Monaco', priceRubles: 2800, specs: [...noveltySpecs] },
  { id: '4', tag: 'new', available: true, name: 'Роза флорибунда', latin: 'Rosa Jubile du Prince de Monaco', priceRubles: 3600, specs: [...noveltySpecsSingle] },
  { id: '5', tag: 'sale', available: true, name: 'Роза флорибунда', latin: 'Rosa Jubile du Prince de Monaco', priceRubles: 4500, specs: [...noveltySpecs] },
  { id: '6', tag: 'hit', available: true, name: 'Роза флорибунда', latin: 'Rosa Jubile du Prince de Monaco', priceRubles: 5200, specs: [...noveltySpecs] },
  { id: '7', tag: null, available: false, name: 'Роза флорибунда', latin: 'Rosa Jubile du Prince de Monaco', priceRubles: 6800, specs: [...noveltySpecsSingle] },
  { id: '8', tag: 'new', available: true, name: 'Роза флорибунда', latin: 'Rosa Jubile du Prince de Monaco', priceRubles: 8500, specs: [...noveltySpecs] },
]
const trackCards = [...cards, ...cards, ...cards]
const loopStart = cards.length
const loopEnd = cards.length * 2
const visibleCount = 4
const cardStep = 36.1

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

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

export function HomeNovelties() {
  const [index, setIndex] = useState(loopStart)
  const [animate, setAnimate] = useState(true)
  const locked = useRef(false)
  const page = wrapPage(index - loopStart)

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

  return (
    <section className="novelties" aria-labelledby="novelties-title">
      <div className="container">
        <div className="novelties__head">
          <h2 className="novelties__title" id="novelties-title">
            <Icon name="leaf" className="novelties__mark" />
            Новинки сезона
            <Icon name="leaf" className="novelties__mark novelties__mark--mirror" />
          </h2>
        </div>
        <div className="novelties__slider">
          <button
            className="novelties__control novelties__control--prev"
            type="button"
            aria-label="Предыдущие новинки сезона"
            onClick={() => goTo(-1)}
          >
            <Icon name="chevron-down" />
          </button>
          <div className="novelties__viewport">
            <ul
              className={
                animate ? 'novelties__track' : 'novelties__track is-instant'
              }
              style={{ transform: `translateX(-${index * cardStep}rem)` }}
              onTransitionEnd={handleTransitionEnd}
            >
              {trackCards.map((card, trackIndex) => {
                const hidden =
                  trackIndex < index || trackIndex >= index + visibleCount

                return (
                  <li
                    className="novelties__item"
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
            className="novelties__control novelties__control--next"
            type="button"
            aria-label="Следующие новинки сезона"
            onClick={() => goTo(1)}
          >
            <Icon name="chevron-down" />
          </button>
        </div>
        <div className="novelties__pages" role="group" aria-label="Пагинация новинок сезона">
          {cards.map((card, cardIndex) => {
            const current = cardIndex === page

            return (
              <button
                className={
                  current ? 'novelties__page is-active' : 'novelties__page'
                }
                type="button"
                key={card.id}
                aria-label={`Новинка ${cardIndex + 1} из ${cards.length}`}
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
