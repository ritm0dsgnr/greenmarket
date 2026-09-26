import { useLayoutEffect, useState, type RefObject } from 'react'

export function useScrollRail(
  scrollerRef: RefObject<HTMLElement | null>,
  active: boolean,
  revision: unknown = 0,
) {
  const [rail, setRail] = useState({ show: false, thumbHeight: 0, thumbTop: 0 })

  useLayoutEffect(() => {
    const scroller = scrollerRef.current

    if (!active || !scroller) {
      setRail({ show: false, thumbHeight: 0, thumbTop: 0 })
      return
    }

    function updateRail() {
      if (!scroller) {
        return
      }

      const { clientHeight, scrollHeight, scrollTop } = scroller

      if (scrollHeight <= clientHeight + 1) {
        setRail({ show: false, thumbHeight: 0, thumbTop: 0 })
        return
      }

      const thumbHeight = Math.max(40, (clientHeight / scrollHeight) * clientHeight)
      const maxTop = clientHeight - thumbHeight
      const thumbTop = (scrollTop / (scrollHeight - clientHeight)) * maxTop

      setRail({ show: true, thumbHeight, thumbTop })
    }

    updateRail()
    scroller.addEventListener('scroll', updateRail, { passive: true })
    const observer = new ResizeObserver(updateRail)
    observer.observe(scroller)

    return () => {
      scroller.removeEventListener('scroll', updateRail)
      observer.disconnect()
    }
  }, [scrollerRef, active, revision])

  return rail
}
