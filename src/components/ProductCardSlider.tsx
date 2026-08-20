'use client'

import { useLayoutEffect, useRef, useState, type CSSProperties, type TransitionEvent } from 'react'
import { Icon } from '@/components/Icon'
import { ProductCard, type ProductCardData } from '@/components/ProductCard'
import { desktopSlideSpanRem, slideGapRem, slideLayout } from '@/components/slideLayout'
import { useSwipePager } from '@/components/useSwipePager'

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function readRootRem() {
  return Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 10
}

export function ProductCardSlider({
  title,
  titleId,
  cards,
  block = 'related',
  prevLabel,
  nextLabel,
  pagesLabel,
  pageName,
}: {
  title: string
  titleId: string
  cards: ProductCardData[]
  block?: 'related' | 'novelties'
  prevLabel?: string
  nextLabel?: string
  pagesLabel?: string
  pageName?: string
}) {
  const loopStart = cards.length
  const loopEnd = cards.length * 2
  const trackCards = [...cards, ...cards, ...cards]
  const [index, setIndex] = useState(loopStart)
  const [animate, setAnimate] = useState(true)
  const [layout, setLayout] = useState({ visible: 4, span: 0, step: 0 })
  const locked = useRef(false)
  const viewportRef = useRef<HTMLDivElement>(null)
  const page = cards.length === 0 ? 0 : ((index - loopStart) % cards.length + cards.length) % cards.length
  const prevText = prevLabel ?? `Предыдущие, ${title}`
  const nextText = nextLabel ?? `Следующие, ${title}`
  const pagesText = pagesLabel ?? `Пагинация, ${title}`

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
    const viewport = viewportRef.current
    if (!viewport) {
      return
    }

    function measure() {
      const frame = viewportRef.current
      if (!frame) {
        return
      }

      const rem = readRootRem()
      const gap = slideGapRem * rem
      const next = slideLayout(frame.clientWidth, desktopSlideSpanRem * rem, gap, window.innerWidth)
      setLayout({
        visible: next.visible,
        span: next.span,
        step: next.span + gap,
      })
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(viewport)
    window.addEventListener('resize', measure)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

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
    if (step === 0 || cards.length === 0) {
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

  const swipe = useSwipePager((direction) => goTo(direction), {
    isLocked: () => locked.current,
  })

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

  const offset = layout.step > 0 ? layout.step * index - swipe.shift : 0
  const trackClass = [
    `${block}__track`,
    animate && !swipe.dragging ? '' : 'is-instant',
    swipe.dragging ? 'is-dragging' : '',
  ]
    .filter(Boolean)
    .join(' ')
  const viewportStyle = {
    ['--slide-span' as string]: layout.span > 0 ? `${layout.span}px` : undefined,
  } as CSSProperties

  return (
    <section className={block} aria-labelledby={titleId}>
      <div className="container">
        <div className={`${block}__head`}>
          <h2 className={`${block}__title`} id={titleId}>
            <Icon name="leaf" className={`${block}__mark`} />
            {title}
            <Icon name="leaf" className={`${block}__mark ${block}__mark--mirror`} />
          </h2>
        </div>
        <div className={`${block}__slider`}>
          <button
            className={`${block}__control ${block}__control--prev`}
            type="button"
            aria-label={prevText}
            onClick={() => goTo(-1)}
          >
            <Icon name="chevron-down" />
          </button>
          <div
            className={[`${block}__viewport`, swipe.dragging ? 'is-dragging' : ''].filter(Boolean).join(' ')}
            ref={(element) => {
              viewportRef.current = element
              swipe.bind.ref(element)
            }}
            style={viewportStyle}
            onPointerDown={swipe.bind.onPointerDown}
            onPointerMove={swipe.bind.onPointerMove}
            onPointerUp={swipe.bind.onPointerUp}
            onPointerCancel={swipe.bind.onPointerCancel}
            onLostPointerCapture={swipe.bind.onLostPointerCapture}
            onClickCapture={swipe.bind.onClickCapture}
          >
            <ul
              className={trackClass}
              style={{
                transform:
                  layout.step > 0
                    ? `translate3d(${-offset}px, 0, 0)`
                    : `translate3d(-${index * (desktopSlideSpanRem + slideGapRem)}rem, 0, 0)`,
              }}
              onTransitionEnd={handleTransitionEnd}
            >
              {trackCards.map((card, trackIndex) => {
                const hidden = trackIndex < index || trackIndex >= index + layout.visible

                return (
                  <li
                    className={`${block}__item`}
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
            className={`${block}__control ${block}__control--next`}
            type="button"
            aria-label={nextText}
            onClick={() => goTo(1)}
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
