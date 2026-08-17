'use client'

import { useEffect, useRef, useState } from 'react'
import {
  siteGardenName,
  siteMapsEmbedHref,
  siteMapsHref,
  siteMapsPoint,
} from '@/components/siteContacts'

type YandexMap = {
  geoObjects: { add: (object: unknown) => void }
  destroy: () => void
}

type YandexPin = {
  events: { add: (type: string, handler: () => void) => void }
}

type YMapsReady = {
  ready: (callback: () => void) => void
  Map: new (
    container: HTMLElement,
    state: { center: [number, number]; zoom: number; controls: string[] },
    options?: { suppressMapOpenBlock?: boolean },
  ) => YandexMap
  Placemark: new (
    coordinates: [number, number],
    properties: { hintContent?: string },
    options: {
      iconLayout: string
      iconImageHref: string
      iconImageSize: [number, number]
      iconImageOffset: [number, number]
      hasBalloon: boolean
    },
  ) => YandexPin
}

declare global {
  interface Window {
    ymaps?: YMapsReady
  }
}

const ymapsSrc = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU&coordorder=latlong'
let ymapsLoading: Promise<YMapsReady> | null = null

function loadYmaps() {
  if (window.ymaps) {
    return Promise.resolve(window.ymaps)
  }

  if (ymapsLoading) {
    return ymapsLoading
  }

  ymapsLoading = new Promise<YMapsReady>((resolve, reject) => {
    const onReady = () => {
      const ymaps = window.ymaps
      if (!ymaps) {
        reject(new Error('Yandex Maps did not initialize.'))
        return
      }

      ymaps.ready(() => resolve(ymaps))
    }

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${ymapsSrc}"]`)
    if (existing) {
      existing.addEventListener('load', onReady)
      existing.addEventListener('error', () => reject(new Error('Yandex Maps failed to load.')))
      return
    }

    const script = document.createElement('script')
    script.src = ymapsSrc
    script.async = true
    script.addEventListener('load', onReady)
    script.addEventListener('error', () => reject(new Error('Yandex Maps failed to load.')))
    document.head.appendChild(script)
  }).catch((error: unknown) => {
    ymapsLoading = null
    throw error
  })

  return ymapsLoading
}

export function SiteContactsMap() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const el = rootRef.current
    if (!el || failed) {
      return
    }

    let cancelled = false
    let map: YandexMap | undefined

    loadYmaps()
      .then((ymaps) => {
        if (cancelled || !rootRef.current) {
          return
        }

        map = new ymaps.Map(
          rootRef.current,
          {
            center: [siteMapsPoint.latitude, siteMapsPoint.longitude],
            zoom: 12,
            controls: ['zoomControl'],
          },
          { suppressMapOpenBlock: true },
        )

        const pin = new ymaps.Placemark(
          [siteMapsPoint.latitude, siteMapsPoint.longitude],
          { hintContent: siteGardenName },
          {
            iconLayout: 'default#image',
            iconImageHref: '/img/map-pin.svg',
            iconImageSize: [48, 62],
            iconImageOffset: [-24, -62],
            hasBalloon: false,
          },
        )

        pin.events.add('click', () => {
          window.open(siteMapsHref, '_blank', 'noreferrer')
        })

        map.geoObjects.add(pin)
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true)
        }
      })

    return () => {
      cancelled = true
      map?.destroy()
    }
  }, [failed])

  if (failed) {
    return (
      <iframe
        className="contacts__map-frame"
        src={siteMapsEmbedHref}
        title="Садовый центр Green Market на карте"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    )
  }

  return (
    <div
      className="contacts__map-frame"
      ref={rootRef}
      role="application"
      aria-label="Карта проезда к Green Market"
    />
  )
}
