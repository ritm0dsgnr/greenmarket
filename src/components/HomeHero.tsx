'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { HeroSlider } from '@/components/HeroSlider'
import { siteBrand } from '@/components/siteContacts'

const marqueeItems = [
  'Новинки',
  'Качество',
  'Редкие сорта',
  'Доставка',
  'Коллекция канадских роз',
] as const
const marqueeRepeats = 4

const clampParallax = (value: number) => Math.min(0.5, Math.max(-0.5, value))

export function HomeHero() {
  const heroRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = (x: number, y: number) => {
      const node = heroRef.current
      if (!node) {
        return
      }

      node.style.setProperty('--parallax-x', String(x))
      node.style.setProperty('--parallax-y', String(y))
    }

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || media.matches) {
        return
      }

      const node = heroRef.current
      if (!node) {
        return
      }

      const rect = node.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) {
        return
      }

      apply(
        clampParallax((event.clientX - rect.left) / rect.width - 0.5),
        clampParallax((event.clientY - rect.top) / rect.height - 0.5),
      )
    }

    const onReduceChange = () => {
      if (media.matches) {
        apply(0, 0)
      }
    }

    onReduceChange()
    media.addEventListener('change', onReduceChange)
    window.addEventListener('pointermove', onMove)

    return () => {
      media.removeEventListener('change', onReduceChange)
      window.removeEventListener('pointermove', onMove)
    }
  }, [])

  return (
    <div className="container">
      <section className="hero" ref={heroRef}>
        <div className="hero__wrapper">
          <div className="hero__content">
            <div className="hero__stack">
              <Image
                className="hero__image"
                src="/img/hero/content/hero-bg.png"
                alt=""
                width={864}
                height={1152}
                unoptimized
              />
              <div className="hero__veil" aria-hidden="true" />
              <div className="hero__copy">
                <h1 className="hero__title">
                  <Image src="/img/hero/content/title.svg" alt={siteBrand} width={496} height={217} />
                </h1>
              </div>
              <p className="hero__caption">
                Семейный садовый центр  •  Екатеринбург
              </p>
              <div className="hero__layers" aria-hidden="true">
                <Image
                  className="hero__layer hero__layer--back"
                  src="/img/hero/content/hero-layer-back.png"
                  alt=""
                  width={864}
                  height={1152}
                  unoptimized
                />
                <Image
                  className="hero__layer hero__layer--mid"
                  src="/img/hero/content/hero-layer-mid.png"
                  alt=""
                  width={864}
                  height={1152}
                  preload
                  unoptimized
                />
                <Image
                  className="hero__layer hero__layer--front"
                  src="/img/hero/content/hero-layer-front.png"
                  alt=""
                  width={864}
                  height={1152}
                  unoptimized
                />
              </div>
            </div>
            <Image
              className="hero__texture"
              src="/img/hero/content/texture.jpg"
              alt=""
              width={620}
              height={962}
            />
            <div className="hero__marquee">
              <p className="visually-hidden">
                Новинки, качество, редкие сорта, доставка, коллекция канадских роз
              </p>
              <div className="hero__marquee-track" aria-hidden="true">
                {[0, 1].map((copy) => (
                  <span className="hero__marquee-set" key={copy}>
                    {Array.from({ length: marqueeRepeats }, (_, repeat) =>
                      marqueeItems.map((item, itemIndex) => (
                        <span
                          className="hero__marquee-item"
                          key={`${copy}-${repeat}-${itemIndex}`}
                        >
                          {item}
                          <span className="hero__marquee-mark">✦</span>
                        </span>
                      )),
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <HeroSlider />
        </div>
      </section>
    </div>
  )
}
