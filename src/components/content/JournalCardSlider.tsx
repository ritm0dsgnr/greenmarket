'use client'

import Link from 'next/link'
import { useLayoutEffect, useRef, useState, type CSSProperties, type TransitionEvent } from 'react'
import { Icon } from '@/components/Icon'
import { JournalCard } from '@/components/content/JournalCard'
import { slideGapRem, mobileBreakpointPx } from '@/components/slideLayout'
import { useSwipePager } from '@/components/useSwipePager'
import { siteBlogRoute } from '@/components/siteNav'
import type { JournalItem } from '@/content/journal'

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function readRootRem() {
  return Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 10
}

function journalSlideLayout(viewportWidth: number, windowWidth: number) {
  const rem = readRootRem()
  const gap = slideGapRem * rem
  const minCard = 52 * rem

  if (windowWidth <= mobileBreakpointPx) {
    return { visible: 2, span: (viewportWidth - gap) / 2 }
  }

  if (viewportWidth + 0.5 >= minCard * 2 + gap) {
    return { visible: 2, span: (viewportWidth - gap) / 2 }
  }

  return { visible: 1, span: viewportWidth }
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
  const loopStart = cards.length
  const loopEnd = cards.length * 2
  const trackCards = [...cards, ...cards, ...cards]
  const [index, setIndex] = useState(loopStart)
  const [animate, setAnimate] = useState(true)
  const [layout, setLayout] = useState({ visible: 2, span: 0, step: 0 })
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
      const next = journalSlideLayout(frame.clientWidth, window.innerWidth)
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
    'home-journal__track',
    animate && !swipe.dragging && layout.step > 0 ? '' : 'is-instant',
    swipe.dragging ? 'is-dragging' : '',
  ]
    .filter(Boolean)
    .join(' ')
  const viewportStyle = {
    ...(layout.span > 0 ? { ['--slide-span' as string]: `${layout.span}px` } : {}),
  } as CSSProperties

  return (
    <section className="home-journal" aria-labelledby={titleId}>
      <div className="container">
        <div className="home-journal__slider">
          <button
            className="home-journal__control home-journal__control--prev"
            type="button"
            aria-label={prevText}
            onClick={() => goTo(-1)}
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
            <div
              className={['home-journal__viewport', swipe.dragging ? 'is-dragging' : '']
                .filter(Boolean)
                .join(' ')}
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
                      : `translate3d(calc(-${index} * (var(--slide-span) + ${slideGapRem}rem)), 0, 0)`,
                }}
                onTransitionEnd={handleTransitionEnd}
              >
                {trackCards.map((item, trackIndex) => {
                  const hidden = trackIndex < index || trackIndex >= index + layout.visible

                  return (
                    <li
                      className="home-journal__item"
                      key={`${item.id}-${trackIndex}`}
                      aria-hidden={hidden}
                      inert={hidden ? true : undefined}
                    >
                      <JournalCard item={item} />
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
          <button
            className="home-journal__control home-journal__control--next"
            type="button"
            aria-label={nextText}
            onClick={() => goTo(1)}
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
