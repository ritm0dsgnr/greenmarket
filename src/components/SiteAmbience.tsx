'use client'

import { useEffect } from 'react'
import { createForestAmbience } from '@/components/forestAmbience'

export function SiteAmbience() {
  useEffect(() => {
    const engine = createForestAmbience()
    let unlocked = false

    void engine.preload()

    const unlock = () => {
      if (unlocked) {
        return
      }

      unlocked = true
      void engine.setEnabled(true)
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
      window.removeEventListener('touchstart', unlock)
    }

    window.addEventListener('pointerdown', unlock)
    window.addEventListener('keydown', unlock)
    window.addEventListener('touchstart', unlock, { passive: true })

    const onVisibility = () => {
      if (!unlocked) {
        return
      }

      void engine.setEnabled(!document.hidden)
    }

    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
      window.removeEventListener('touchstart', unlock)
      document.removeEventListener('visibilitychange', onVisibility)
      engine.dispose()
    }
  }, [])

  return null
}
