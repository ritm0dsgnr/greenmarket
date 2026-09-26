'use client'

import { useEffect, useRef, type CSSProperties } from 'react'
import gsap from 'gsap'
import { Icon } from '@/components/Icon'

export type CartAddOrigin = {
  x: number
  y: number
}

const leafTints = ['forest', 'leaf', 'blush', 'leaf', 'forest', 'leaf', 'blush', 'leaf'] as const
const leafCount = leafTints.length

export function cartAddOriginFromEvent(event: { clientX: number; clientY: number }): CartAddOrigin {
  return { x: event.clientX, y: event.clientY }
}

export function CartAddFlash({
  origin,
  onDone,
}: {
  origin: CartAddOrigin
  onDone: () => void
}) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current

    if (!root) {
      return
    }

    const cart = document.querySelector<HTMLElement>('[data-cart-catch]')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let cancelled = false

    const finish = () => {
      cart?.classList.remove('is-catching')

      if (!cancelled) {
        onDone()
      }
    }

    const pulseCart = () => {
      if (cancelled || !cart) {
        return
      }

      cart.classList.remove('is-catching')
      void cart.offsetWidth
      cart.classList.add('is-catching')
    }

    if (reduce) {
      pulseCart()
      const timer = window.setTimeout(finish, 160)
      return () => {
        cancelled = true
        window.clearTimeout(timer)
        cart?.classList.remove('is-catching')
      }
    }

    const burst = root.querySelector<HTMLElement>('.cart-flash__burst')
    const wreath = root.querySelector<HTMLElement>('.cart-flash__wreath')
    const check = root.querySelector<HTMLElement>('.cart-flash__check-mark')

    if (!burst || !wreath || !check) {
      finish()
      return
    }

    const tl = gsap.timeline({ onComplete: finish })

    gsap.set(burst, {
      x: origin.x,
      y: origin.y,
      xPercent: -50,
      yPercent: -50,
      scale: 0.22,
      opacity: 1,
    })
    gsap.set(wreath, { rotation: -14 })
    gsap.set(check, { scale: 0, opacity: 0 })

    tl.to(burst, { scale: 1, duration: 0.24, ease: 'back.out(1.6)' }, 0)
    tl.to(wreath, { rotation: 16, duration: 0.36, ease: 'sine.out' }, 0)
    tl.to(check, { scale: 1, opacity: 1, duration: 0.18, ease: 'back.out(2.1)' }, 0.12)
    tl.add(pulseCart, 0.16)
    tl.to(burst, { opacity: 0, scale: 0.9, duration: 0.14, ease: 'power1.in' }, 0.42)

    return () => {
      cancelled = true
      tl.kill()
      cart?.classList.remove('is-catching')
    }
  }, [onDone, origin.x, origin.y])

  return (
    <div className="cart-flash" ref={rootRef} role="status" aria-live="polite">
      <p className="visually-hidden">Добавлено в корзину</p>
      <span className="cart-flash__burst" aria-hidden="true">
        <span className="cart-flash__glow" />
        <span className="cart-flash__wreath">
          {leafTints.map((tint, index) => (
            <span
              className={`cart-flash__leaf cart-flash__leaf--${tint}`}
              key={index}
              style={{ '--i': index, '--n': leafCount } as CSSProperties}
            >
              <Icon name="leaf" />
            </span>
          ))}
        </span>
        <span className="cart-flash__check">
          <span className="cart-flash__check-mark">
            <Icon name="check" />
          </span>
        </span>
      </span>
    </div>
  )
}
