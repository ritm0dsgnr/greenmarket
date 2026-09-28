'use client'

import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react'

type SwipePagerOptions = {
  onTap?: () => void
  /** Snap mid-animation before a new drag starts. */
  onInterrupt?: () => void
  /** Slide step in px; keeps the track from snapping back on commit. */
  getCommitDistance?: () => number
  /** Vertical drag down closes the viewer (lightbox / iOS gallery). */
  onDismissDown?: () => void
}

const AXIS_THRESHOLD_PX = 6
const FLICK_VELOCITY = 0.32

export function useSwipePager(onSwipe: (direction: -1 | 1) => void, options: SwipePagerOptions = {}) {
  const [shift, setShift] = useState(0)
  const [shiftY, setShiftY] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [node, setNode] = useState<HTMLElement | null>(null)
  const onSwipeRef = useRef(onSwipe)
  const onTapRef = useRef(options.onTap)
  const onInterruptRef = useRef(options.onInterrupt)
  const getCommitDistanceRef = useRef(options.getCommitDistance)
  const onDismissDownRef = useRef(options.onDismissDown)
  const suppressClick = useRef(false)
  const settleFrame = useRef(0)
  const session = useRef({
    pointerId: -1,
    startX: 0,
    startY: 0,
    startAt: 0,
    dx: 0,
    dy: 0,
    locked: false as false | 'x' | 'y',
  })

  useEffect(() => {
    onSwipeRef.current = onSwipe
    onTapRef.current = options.onTap
    onInterruptRef.current = options.onInterrupt
    getCommitDistanceRef.current = options.getCommitDistance
    onDismissDownRef.current = options.onDismissDown
  }, [onSwipe, options.onTap, options.onInterrupt, options.getCommitDistance, options.onDismissDown])

  useEffect(() => {
    return () => {
      cancelAnimationFrame(settleFrame.current)
    }
  }, [])

  const reset = useCallback(() => {
    cancelAnimationFrame(settleFrame.current)
    setShift(0)
    setShiftY(0)
    setDragging(false)
  }, [])

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
      if (current.locked === 'y' && !onDismissDownRef.current) {
        current.pointerId = -1
        return 'y'
      }

      setDragging(true)
      return current.locked
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

      if (axis === 'x') {
        event.preventDefault()
        current.dx = dx
        setShift(dx)
        return
      }

      if (axis === 'y' && onDismissDownRef.current) {
        event.preventDefault()
        current.dy = dy
        setShiftY(Math.max(0, dy))
      }
    }

    node.addEventListener('touchmove', onTouchMove, { passive: false })
    return () => node.removeEventListener('touchmove', onTouchMove)
  }, [node])

  function onPointerDown(event: PointerEvent<HTMLElement>) {
    if (event.button !== 0) {
      return
    }

    cancelAnimationFrame(settleFrame.current)
    onInterruptRef.current?.()
    suppressClick.current = false
    session.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startAt: performance.now(),
      dx: 0,
      dy: 0,
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
      if (current.locked === 'y' && !onDismissDownRef.current) {
        current.pointerId = -1
        return
      }

      setDragging(true)
      if (event.pointerType !== 'touch') {
        event.currentTarget.setPointerCapture(event.pointerId)
      }
    }

    if (current.locked === 'x') {
      current.dx = dx
      setShift(dx)
      return
    }

    if (current.locked === 'y' && onDismissDownRef.current) {
      current.dy = dy
      setShiftY(Math.max(0, dy))
    }
  }

  function endPointer(event: PointerEvent<HTMLElement>) {
    const current = session.current
    if (current.pointerId !== event.pointerId) {
      return
    }

    const dx = current.dx
    const dy = current.dy
    const axis = current.locked
    const target = event.currentTarget
    const elapsed = Math.max(16, performance.now() - current.startAt)
    const velocityX = dx / elapsed
    const velocityY = dy / elapsed
    current.pointerId = -1
    current.dx = 0
    current.dy = 0
    current.locked = false

    if (target.hasPointerCapture(event.pointerId)) {
      target.releasePointerCapture(event.pointerId)
    }

    if (axis === 'x') {
      suppressClick.current = true
      const threshold = Math.min(40, Math.max(28, target.clientWidth * 0.1))
      const flicked = Math.abs(velocityX) >= FLICK_VELOCITY
      const farEnough = Math.abs(dx) >= threshold
      let direction: -1 | 1 | 0 = 0

      if ((farEnough || flicked) && dx <= -12) {
        direction = 1
      } else if ((farEnough || flicked) && dx >= 12) {
        direction = -1
      }

      if (direction !== 0) {
        const step = getCommitDistanceRef.current?.() ?? 0
        if (step > 0) {
          setShift(dx + direction * step)
          setDragging(false)
          onSwipeRef.current(direction)
          settleFrame.current = requestAnimationFrame(() => {
            settleFrame.current = requestAnimationFrame(() => setShift(0))
          })
          return
        }

        setDragging(false)
        setShift(0)
        onSwipeRef.current(direction)
        return
      }

      setDragging(false)
      setShift(0)
      return
    }

    if (axis === 'y' && onDismissDownRef.current) {
      suppressClick.current = true
      const threshold = Math.min(140, Math.max(72, target.clientHeight * 0.16))
      const flicked = velocityY >= FLICK_VELOCITY
      const farEnough = dy >= threshold

      if ((farEnough || flicked) && dy >= 28) {
        setDragging(false)
        onDismissDownRef.current()
        return
      }

      setDragging(false)
      setShiftY(0)
      return
    }

    setDragging(false)
    setShift(0)
    setShiftY(0)

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
    shiftY,
    dragging,
    reset,
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
