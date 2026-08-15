'use client'

import { useEffect } from 'react'
import { createForestAmbience } from '@/components/forestAmbience'

export function SiteAmbience() {
  useEffect(() => {
    const engine = createForestAmbience()

    const start = () => {
      void engine.setEnabled(true)
      window.removeEventListener('pointerdown', start)
      window.removeEventListener('keydown', start)
    }

    void engine.setEnabled(true).then(() => {
      if (document.visibilityState === 'visible') {
        return
      }

      void engine.setEnabled(false)
    })

    window.addEventListener('pointerdown', start)
    window.addEventListener('keydown', start)

    const onVisibility = () => {
      void engine.setEnabled(!document.hidden)
    }

    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      window.removeEventListener('pointerdown', start)
      window.removeEventListener('keydown', start)
      document.removeEventListener('visibilitychange', onVisibility)
      engine.dispose()
    }
  }, [])

  return null
}
