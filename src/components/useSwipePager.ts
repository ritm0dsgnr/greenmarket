'use client'

import { useEffect, useRef, useState, type PointerEvent } from 'react'

type SwipePagerOptions = {
  onTap?: () => void
  isLocked?: () => boolean
}

const AXIS_THRESHOLD_PX = 8

export function useSwipePager(onSwipe: (direction: -1 | 1) => void, options: SwipePagerOptions = {}) {
  const [shift, setShift] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [node, setNode] = useState<HTMLElement | null>(null)
  const onSwipeRef = useRef(onSwipe)
  const onTapRef = useRef(options.onTap)
  const isLockedRef = useRef(options.isLocked)
  const suppressClick = useRef(false)
  const draggingRef = useRef(false)
  const session = useRef({
    pointerId: -1,
    startX: 0,
    startY: 0,
    dx: 0,
    locked: false as false | 'x' | 'y',
  })

  useEffect(() => {
    onSwipeRef.current = onSwipe
    onTapRef.current = options.onTap
    isLockedRef.current = options.isLocked
  }, [onSwipe, options.onTap, options.isLocked])

  useEffect(() => {
    if (!node) {
      return
    }

    function lockAxis(dx: number, dy: number) {
      const current = session.current
      if (current.locked || current.pointerId === -1) {
        return current.locked
      }

      if (Math.abs(dx) < AXIS_THRESHOLD_PX && Math.abs(dy) < AXIS_THRESHOLD_PX) {
        return false
      }

      current.locked = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y'
      if (current.locked === 'y') {
        current.pointerId = -1
        return 'y'
      }

      draggingRef.current = true
      setDragging(true)
      return 'x'
    }

    function onTouchMove(event: TouchEvent) {
      const current = session.current
      if (current.pointerId === -1 || event.touches.length !== 1) {
        return
      }

      const touch = event.touches.item(0)
      if (!touch) {
        return
      }

      const dx = touch.clientX - current.startX
      const dy = touch.clientY - current.startY
      const axis = lockAxis(dx, dy)

      if (axis !== 'x') {
        return
      }

      event.preventDefault()
      current.dx = dx
      setShift(dx)
    }

    node.addEventListener('touchmove', onTouchMove, { passive: false })
    return () => node.removeEventListener('touchmove', onTouchMove)
  }, [node])

  function onPointerDown(event: PointerEvent<HTMLElement>) {
    if (event.button !== 0 || isLockedRef.current?.()) {
      return
    }

    suppressClick.current = false
    session.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      dx: 0,
      locked: false,
    }
  }

  function onPointerMove(event: PointerEvent<HTMLElement>) {
    const current = session.current
    if (current.pointerId !== event.pointerId) {
      return
    }

    const dx = event.clientX - current.startX
    const dy = event.clientY - current.startY

    if (!current.locked) {
      if (Math.abs(dx) < AXIS_THRESHOLD_PX && Math.abs(dy) < AXIS_THRESHOLD_PX) {
        return
      }

      current.locked = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y'
      if (current.locked === 'y') {
        current.pointerId = -1
        return
      }

      draggingRef.current = true
      setDragging(true)
      // Touch capture fights the browser scroll gesture; mouse still needs it.
      if (event.pointerType !== 'touch') {
        event.currentTarget.setPointerCapture(event.pointerId)
      }
    }

    if (current.locked !== 'x') {
      return
    }

    current.dx = dx
    setShift(dx)
  }

  function endPointer(event: PointerEvent<HTMLElement>) {
    const current = session.current
    if (current.pointerId !== event.pointerId) {
      return
    }

    const dx = current.dx
    const axis = current.locked
    const target = event.currentTarget
    current.pointerId = -1
    current.dx = 0
    current.locked = false
    draggingRef.current = false
    setShift(0)
    setDragging(false)

    if (target.hasPointerCapture(event.pointerId)) {
      target.releasePointerCapture(event.pointerId)
    }

    if (axis === 'x') {
      suppressClick.current = true
      const threshold = Math.min(72, target.clientWidth * 0.18)
      if (dx <= -threshold) {
        onSwipeRef.current(1)
        return
      }

      if (dx >= threshold) {
        onSwipeRef.current(-1)
      }

      return
    }

    if (axis === false) {
      onTapRef.current?.()
    }
  }

  function onClickCapture(event: { preventDefault: () => void; stopPropagation: () => void }) {
    if (!suppressClick.current) {
      return
    }

    suppressClick.current = false
    event.preventDefault()
    event.stopPropagation()
  }

  return {
    shift,
    dragging,
    bind: {
      ref: setNode,
      onPointerDown,
      onPointerMove,
      onPointerUp: endPointer,
      onPointerCancel: endPointer,
      onClickCapture,
    },
  }
}
