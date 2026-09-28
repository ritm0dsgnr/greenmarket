'use client'

import Image from 'next/image'
import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Icon } from '@/components/Icon'
import { bindHangingWords } from '@/components/bindHangingWords'
import { aboutStoryYears } from '@/content/about-story'

gsap.registerPlugin(useGSAP, ScrollTrigger)

function markActiveYear(chips: HTMLButtonElement[], year: number) {
  chips.forEach((chip) => {
    const on = Number(chip.dataset.year) === year
    chip.classList.toggle('is-active', on)
    if (on) {
      chip.setAttribute('aria-current', 'true')
    } else {
      chip.removeAttribute('aria-current')
    }
  })
}

function yearsPinOffset(root: HTMLElement) {
  const years = root.querySelector<HTMLElement>('.about-growth__years')
  if (!years) {
    return 0
  }

  const stickyTop = Number.parseFloat(getComputedStyle(years).top) || 0
  return stickyTop + years.offsetHeight + 12
}

export function HomeAbout() {
  const rootRef = useRef<HTMLElement>(null)

  useGSAP(
    (_context, contextSafe) => {
      const root = rootRef.current
      if (!root || !contextSafe) {
        return
      }

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
      const head = root.querySelector<HTMLElement>('.about-growth__head')
      const stemFill = root.querySelector<HTMLElement>('.about-growth__stem-fill')
      const chapters = gsap.utils.toArray<HTMLElement>('.about-growth__chapter', root)
      const chips = gsap.utils.toArray<HTMLButtonElement>('.about-growth__year-chip', root)
      const cleanups: Array<() => void> = []
      let pinYear: number | null = null
      let pinToken = 0

      if (chips[0]) {
        markActiveYear(chips, Number(chips[0].dataset.year))
      }

      const onChipClick = contextSafe((event: Event) => {
        const button = event.currentTarget as HTMLButtonElement
        const year = Number(button.dataset.year)
        const target = root.querySelector<HTMLElement>(`.about-growth__chapter[data-year="${year}"]`)
        if (!target || Number.isNaN(year)) {
          return
        }

        pinToken += 1
        const token = pinToken
        pinYear = year
        markActiveYear(chips, year)
        if (!reduceMotion) {
          gsap.to(button, { scale: 0.92, duration: 0.12, yoyo: true, repeat: 1, ease: 'power2.out' })
        }

        const top = window.scrollY + target.getBoundingClientRect().top - yearsPinOffset(root)
        window.scrollTo({
          top: Math.max(0, top),
          left: 0,
          behavior: reduceMotion ? 'auto' : 'smooth',
        })

        const unlock = () => {
          if (token !== pinToken) {
            return
          }
          pinYear = null
        }
        window.addEventListener('scrollend', unlock, { once: true })
        window.setTimeout(unlock, 1000)
      })

      chips.forEach((chip) => chip.addEventListener('click', onChipClick))
      cleanups.push(() => {
        pinToken += 1
        pinYear = null
        chips.forEach((chip) => chip.removeEventListener('click', onChipClick))
      })

      if (reduceMotion) {
        gsap.set([head, ...chapters, stemFill].filter(Boolean), { clearProps: 'all', opacity: 1 })
        return () => {
          cleanups.forEach((cleanup) => cleanup())
        }
      }

      gsap.from(head?.children ?? [], {
        y: 28,
        opacity: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: head,
          start: 'top 82%',
          toggleActions: 'play none none reverse',
        },
      })

      if (stemFill) {
        gsap.fromTo(
          stemFill,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: root.querySelector('.about-growth__timeline'),
              start: 'top 70%',
              end: 'bottom 35%',
              scrub: true,
            },
          },
        )
      }

      chapters.forEach((chapter) => {
        const flipped = chapter.classList.contains('about-growth__chapter--flip')
        const copy = chapter.querySelector<HTMLElement>('.about-growth__copy')
        const bud = chapter.querySelector<HTMLElement>('.about-growth__bud')
        const surfaces = gsap.utils.toArray<HTMLElement>('.about-growth__frame-surface', chapter)
        const captions = gsap.utils.toArray<HTMLElement>('.about-growth__frame-caption', chapter)

        gsap
          .timeline({
            scrollTrigger: {
              trigger: chapter,
              start: 'top 78%',
              end: 'top 42%',
              toggleActions: 'play none none reverse',
            },
          })
          .from(
            copy,
            {
              x: flipped ? 48 : -48,
              opacity: 0,
              duration: 0.85,
              ease: 'power3.out',
            },
            0,
          )
          .from(
            bud,
            {
              scale: 0,
              rotation: -120,
              duration: 0.65,
              ease: 'back.out(2.2)',
            },
            0.12,
          )
          .from(
            surfaces,
            {
              y: 56,
              opacity: 0,
              rotate: flipped ? -6 : 6,
              stagger: 0.14,
              duration: 0.8,
              ease: 'power3.out',
            },
            0.18,
          )
          .from(
            captions,
            {
              y: 18,
              opacity: 0,
              stagger: 0.1,
              duration: 0.55,
              ease: 'power2.out',
            },
            0.42,
          )

        if (!finePointer) {
          return
        }

        const onMove = contextSafe((event: Event) => {
          const pointer = event as PointerEvent
          const rect = chapter.getBoundingClientRect()
          const nx = (pointer.clientX - rect.left) / rect.width - 0.5
          const ny = (pointer.clientY - rect.top) / rect.height - 0.5

          gsap.to(bud, {
            x: nx * 10,
            y: ny * 10,
            duration: 0.45,
            ease: 'power2.out',
            overwrite: 'auto',
          })

          surfaces.forEach((surface, index) => {
            const motion = {
              rotateY: nx * 14,
              rotateX: -ny * 10,
              y: ny * -8,
              duration: 0.45,
              ease: 'power2.out' as const,
              overwrite: 'auto' as const,
              transformPerspective: 900,
            }

            gsap.to(surface, motion)

            const caption = captions[index]
            if (caption) {
              gsap.to(caption, motion)
            }
          })
        })

        const onLeave = contextSafe(() => {
          gsap.to(bud, { x: 0, y: 0, duration: 0.7, ease: 'power3.out', overwrite: 'auto' })
          gsap.to([...surfaces, ...captions], {
            rotateX: 0,
            rotateY: 0,
            y: 0,
            duration: 0.7,
            ease: 'power3.out',
            overwrite: 'auto',
          })
        })

        const onBudEnter = contextSafe(() => {
          gsap.to(bud, {
            scale: 1.14,
            duration: 0.35,
            ease: 'power2.out',
            overwrite: 'auto',
          })
        })

        const onBudLeave = contextSafe(() => {
          gsap.to(bud, {
            scale: 1,
            duration: 0.4,
            ease: 'power2.out',
            overwrite: 'auto',
          })
        })

        chapter.addEventListener('pointermove', onMove)
        chapter.addEventListener('pointerleave', onLeave)
        bud?.addEventListener('pointerenter', onBudEnter)
        bud?.addEventListener('pointerleave', onBudLeave)

        cleanups.push(() => {
          chapter.removeEventListener('pointermove', onMove)
          chapter.removeEventListener('pointerleave', onLeave)
          bud?.removeEventListener('pointerenter', onBudEnter)
          bud?.removeEventListener('pointerleave', onBudLeave)
        })
      })

      chapters.forEach((chapter, index) => {
        const year = Number(chapter.dataset.year)
        const next = chapters[index + 1]

        ScrollTrigger.create({
          trigger: chapter,
          start: () => `top ${yearsPinOffset(root)}px`,
          ...(next
            ? {
                endTrigger: next,
                end: () => `top ${yearsPinOffset(root)}px`,
              }
            : { end: 'bottom bottom' }),
          invalidateOnRefresh: true,
          onEnter: () => {
            if (pinYear !== null) {
              return
            }
            markActiveYear(chips, year)
          },
          onEnterBack: () => {
            if (pinYear !== null) {
              return
            }
            markActiveYear(chips, year)
          },
        })
      })

      return () => {
        cleanups.forEach((cleanup) => cleanup())
      }
    },
    { scope: rootRef },
  )

  const firstYear = aboutStoryYears[0]?.year

  return (
    <section className="about-growth" aria-labelledby="about-growth-title" ref={rootRef}>
      <div className="container about-growth__inner">
        <header className="about-growth__head">
          <p className="about-growth__eyebrow">О нас · Грин Маркет</p>
          <h2 className="about-growth__title" id="about-growth-title">
            <span className="about-growth__title-line">Стебель</span>
            <span className="about-growth__title-line about-growth__title-line--accent">роста</span>
          </h2>
          <p className="about-growth__lead">
            <span className="about-growth__lead-line">
              {bindHangingWords('Семь сезонов от островка на рынке до террасы с розами.')}
            </span>
            <span className="about-growth__lead-line">
              {bindHangingWords('Короткая история, которая всё ещё растёт.')}
            </span>
          </p>
        </header>

        <div className="about-growth__years" role="group" aria-label="Перейти к сезону">
          {aboutStoryYears.map((entry) => (
            <button
              className={[
                'about-growth__year-chip',
                entry.year === firstYear ? 'is-active' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              type="button"
              key={entry.year}
              data-year={entry.year}
              aria-current={entry.year === firstYear ? 'true' : undefined}
            >
              {entry.year}
            </button>
          ))}
        </div>

        <ol className="about-growth__timeline">
          <li className="about-growth__stem" aria-hidden="true">
            <div className="about-growth__stem-fill" />
          </li>

          {aboutStoryYears.map((entry, index) => {
            const flipped = index % 2 === 1

            return (
              <li
                className={['about-growth__chapter', flipped ? 'about-growth__chapter--flip' : '']
                  .filter(Boolean)
                  .join(' ')}
                key={entry.year}
                data-year={entry.year}
                id={`about-season-${entry.year}`}
              >
                <div className="about-growth__copy">
                  <h3 className="about-growth__year">
                    <span className="about-growth__year-label">сезон</span>
                    <span className="about-growth__year-value">{entry.year}</span>
                  </h3>
                  {entry.paragraphs.map((paragraph) => (
                    <p className="about-growth__text" key={paragraph.slice(0, 48)}>
                      {bindHangingWords(paragraph)}
                    </p>
                  ))}
                </div>

                <div className="about-growth__axis" aria-hidden="true">
                  <span className="about-growth__bud">
                    <Icon name="leaf" className="about-growth__bud-icon" />
                  </span>
                </div>

                <div className="about-growth__media">
                  {(entry.photos ?? [{ id: `${entry.year}-slot`, caption: 'Место для фото' }]).map(
                    (photo) => (
                      <figure className="about-growth__frame" key={photo.id}>
                        <div
                          className={[
                            'about-growth__frame-surface',
                            photo.imageSrc ? 'about-growth__frame-surface--filled' : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        >
                          {photo.imageSrc ? (
                            <Image
                              src={photo.imageSrc}
                              alt={photo.imageAlt ?? photo.caption}
                              width={640}
                              height={800}
                            />
                          ) : (
                            <>
                              <Icon name="leaf" className="about-growth__frame-icon" />
                              <span className="about-growth__frame-hint">фото скоро</span>
                            </>
                          )}
                        </div>
                        <figcaption className="about-growth__frame-caption">
                          {bindHangingWords(photo.caption)}
                        </figcaption>
                      </figure>
                    ),
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
