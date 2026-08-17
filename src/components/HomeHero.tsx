'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { HeroSlider } from '@/components/HeroSlider'

const marqueeItems = [
  'Новинки',
  'Качество',
  'Редкие сорта',
  'Доставка',
  'Коллекция канадских роз',
] as const
const marqueeRepeats = 4

export function HomeHero() {
  const heroRef = useRef<HTMLElement>(null)
  const reduceMotionRef = useRef(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => {
      reduceMotionRef.current = media.matches
      if (media.matches) {
        heroRef.current?.style.setProperty('--parallax-x', '0')
        heroRef.current?.style.setProperty('--parallax-y', '0')
      }
    }

    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  const setParallax = (x: number, y: number) => {
    const node = heroRef.current
    if (!node) {
      return
    }

    node.style.setProperty('--parallax-x', String(x))
    node.style.setProperty('--parallax-y', String(y))
  }

  return (
    <div className="container">
      <section
        className="hero"
        ref={heroRef}
        onPointerMove={(event) => {
          if (event.pointerType !== 'mouse' || reduceMotionRef.current) {
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

          setParallax(
            (event.clientX - rect.left) / rect.width - 0.5,
            (event.clientY - rect.top) / rect.height - 0.5,
          )
        }}
        onPointerLeave={() => setParallax(0, 0)}
      >
        <div className="hero__wrapper">
          <div className="hero__content">
            <div className="hero__stack">
              <Image
                className="hero__image"
                src="/img/hero/content/hero.png"
                alt=""
                width={930}
                height={1443}
                preload
              />
              <h1 className="hero__title">
                <Image src="/img/hero/content/title.svg" alt="Green Market" width={496} height={217} />
              </h1>
              <p className="hero__caption">
                Семейный садовый центр  •  Екатеринбург
              </p>
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
