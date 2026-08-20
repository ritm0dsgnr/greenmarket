'use client'

import { useState } from 'react'
import { Icon } from '@/components/Icon'
import { useSwipePager } from '@/components/useSwipePager'

const slides = [{ id: '1' }, { id: '2' }, { id: '3' }] as const

export function HeroSlider() {
  const [index, setIndex] = useState(0)
  const lastIndex = slides.length - 1

  const goTo = (nextIndex: number) => {
    if (nextIndex < 0) {
      setIndex(lastIndex)
      return
    }

    if (nextIndex > lastIndex) {
      setIndex(0)
      return
    }

    setIndex(nextIndex)
  }

  const swipe = useSwipePager((direction) => goTo(index + direction))

  return (
    <div className="hero__slider">
      <div
        className={['hero__viewport', swipe.dragging ? 'is-dragging' : ''].filter(Boolean).join(' ')}
        {...swipe.bind}
      >
        <ul
          className={['hero__track', swipe.dragging ? 'is-dragging' : ''].filter(Boolean).join(' ')}
          style={{ transform: `translate3d(calc(-${index * 100}% + ${swipe.shift}px), 0, 0)` }}
        >
          {slides.map((slide, slideIndex) => (
            <li
              className="hero__slide"
              key={slide.id}
              aria-hidden={slideIndex !== index}
            />
          ))}
        </ul>
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
  )
}
