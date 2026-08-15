'use client'

import { useEffect, useRef } from 'react'
import { Icon } from '@/components/Icon'

const iconEase = 0.55
const bgEase = 0.22

function canUseSiteCursor() {
  return (
    window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

export function SiteCursor() {
  const rootRef = useRef<HTMLDivElement>(null)
  const bgRef = useRef<HTMLSpanElement>(null)
  const iconRef = useRef<HTMLSpanElement>(null)
  const mouse = useRef({ x: 0, y: 0 })
  const bg = useRef({ x: 0, y: 0 })
  const icon = useRef({ x: 0, y: 0 })
  const visibleRef = useRef(false)

  useEffect(() => {
    if (!canUseSiteCursor()) {
      return
    }

    document.documentElement.classList.add('has-site-cursor')

    let frame = 0

    const apply = (node: HTMLSpanElement | null, point: { x: number; y: number }) => {
      if (!node) {
        return
      }

      node.style.transform = `translate3d(${point.x}px, ${point.y}px, 0) translate(-50%, -50%)`
    }

    const snapToMouse = () => {
      icon.current.x = bg.current.x = mouse.current.x
      icon.current.y = bg.current.y = mouse.current.y
      apply(iconRef.current, icon.current)
      apply(bgRef.current, bg.current)
    }

    const tick = () => {
      icon.current.x += (mouse.current.x - icon.current.x) * iconEase
      icon.current.y += (mouse.current.y - icon.current.y) * iconEase
      bg.current.x += (mouse.current.x - bg.current.x) * bgEase
      bg.current.y += (mouse.current.y - bg.current.y) * bgEase
      apply(iconRef.current, icon.current)
      apply(bgRef.current, bg.current)
      frame = requestAnimationFrame(tick)
    }

    const setVisible = (nextVisible: boolean) => {
      if (nextVisible === visibleRef.current) {
        return
      }

      visibleRef.current = nextVisible
      rootRef.current?.classList.toggle('is-visible', nextVisible)

      if (nextVisible) {
        snapToMouse()
      }
    }

    const onPointerMove = (event: PointerEvent) => {
      mouse.current.x = event.clientX
      mouse.current.y = event.clientY
      setVisible(true)
    }

    const onPointerLeave = () => {
      setVisible(false)
    }

    snapToMouse()
    frame = requestAnimationFrame(tick)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onPointerLeave)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onPointerMove)
      document.documentElement.removeEventListener('pointerleave', onPointerLeave)
      document.documentElement.classList.remove('has-site-cursor')
    }
  }, [])

  return (
    <div className="site-cursor" ref={rootRef} aria-hidden="true">
      <span className="site-cursor__bg" ref={bgRef} />
      <span className="site-cursor__icon" ref={iconRef}>
        <Icon name="leaf" />
      </span>
    </div>
  )
}
