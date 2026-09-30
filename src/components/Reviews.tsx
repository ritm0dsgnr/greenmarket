'use client'

import Image from 'next/image'
import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import type { Swiper as SwiperInstance } from 'swiper'
import { A11y } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { bindHangingWords } from '@/components/bindHangingWords'
import { Icon } from '@/components/Icon'
import { siteBrand } from '@/components/siteContacts'
import { tabletBreakpointPx } from '@/components/slideLayout'
import {
  reviewFixtures,
  reviewHighlight,
  reviewScreenshots,
  reviewSourceLabels,
  type ReviewFixture,
} from '@/content/reviews'
import 'swiper/css'

const t = bindHangingWords
const shotGapPx = 16
const emptySubscribe = () => () => {}

function motionSpeed() {
  if (typeof window === 'undefined') {
    return 600
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 600
}

function authorInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]
  const second = parts[1]
  if (!first) return '?'
  if (!second) return first.slice(0, 2).toUpperCase()
  return `${first[0] ?? ''}${second[0] ?? ''}`.toUpperCase()
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <span className="reviews__stars" aria-label={`${rating} из 5`}>
      {Array.from({ length: 5 }, (_, index) => (
        <svg
          key={index}
          className={['reviews__star', index < rating ? 'is-on' : ''].filter(Boolean).join(' ')}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12 2.6l2.7 6.2 6.7.6-5.1 4.4 1.5 6.5L12 16.9 6.2 20.3l1.5-6.5L2.6 9.4l6.7-.6L12 2.6z" />
        </svg>
      ))}
    </span>
  )
}

function ReviewCard({ review }: { review: ReviewFixture }) {
  return (
    <li className="reviews__item">
      <article className="reviews__card">
        <header className="reviews__card-head">
          <span className="reviews__avatar" aria-hidden="true">
            {authorInitials(review.author)}
          </span>
          <div className="reviews__card-meta">
            <h3 className="reviews__author">{review.author}</h3>
            <p className="reviews__source">{reviewSourceLabels[review.source]}</p>
          </div>
        </header>

        <div className="reviews__rating-row">
          <RatingStars rating={review.rating} />
          <time className="reviews__date">{review.dateLabel}</time>
        </div>

        <p className="reviews__text">{t(review.text)}</p>

        {review.reply ? (
          <aside className="reviews__reply" aria-label="Ответ садового центра">
            <p className="reviews__reply-label">{t(`Ответ ${siteBrand}`)}</p>
            <p className="reviews__reply-text">{t(review.reply.text)}</p>
            <time className="reviews__date">{review.reply.dateLabel}</time>
          </aside>
        ) : null}
      </article>
    </li>
  )
}

function ReviewsShotSlider() {
  const swiperRef = useRef<SwiperInstance | null>(null)
  const [page, setPage] = useState(0)
  const [ready, setReady] = useState(false)
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false)
  const desktop = useSyncExternalStore(
    (onStoreChange) => {
      const media = window.matchMedia(`(min-width: ${tabletBreakpointPx + 1}px)`)
      media.addEventListener('change', onStoreChange)
      return () => media.removeEventListener('change', onStoreChange)
    },
    () => window.matchMedia(`(min-width: ${tabletBreakpointPx + 1}px)`).matches,
    () => true,
  )
  const slidesPerView = desktop ? 3 : 2

  return (
    <section className="reviews__shots" aria-labelledby="reviews-shots-title">
      <div className="reviews__section-head">
        <p className="reviews__eyebrow">{t('Карты')}</p>
        <h2 className="reviews__section-title" id="reviews-shots-title">
          {t('Яндекс Карты и 2ГИС')}
        </h2>
      </div>

      <div className="reviews__shots-slider">
        <button
          className="reviews__shots-control reviews__shots-control--prev"
          type="button"
          aria-label="Предыдущий скрин отзыва"
          disabled={!ready}
          onClick={() => swiperRef.current?.slidePrev(motionSpeed())}
        >
          <Icon name="chevron-down" />
        </button>

        <div className={['reviews__shots-viewport', ready ? 'is-ready' : ''].filter(Boolean).join(' ')}>
          <div className="reviews__shots-fallback" aria-hidden="true">
            {reviewScreenshots.slice(0, 3).map((shot) => (
              <figure className="reviews__shot" key={shot.id}>
                <Image
                  src={shot.src}
                  alt=""
                  width={shot.width}
                  height={shot.height}
                  sizes="(max-width: 1024px) 50vw, 30rem"
                  priority
                />
              </figure>
            ))}
          </div>

          {mounted ? (
            <Swiper
              className="reviews__shots-swiper"
              wrapperClass="reviews__shots-track"
              modules={[A11y]}
              slidesPerView={slidesPerView}
              slidesPerGroup={1}
              spaceBetween={shotGapPx}
              speed={0}
              loop={false}
              rewind
              watchOverflow
              resistanceRatio={0.65}
              onSwiper={(instance) => {
                swiperRef.current = instance
                setPage(instance.realIndex)
                requestAnimationFrame(() => {
                  instance.update()
                  instance.slideTo(0, 0, false)
                  instance.params.speed = 600
                  setReady(true)
                })
              }}
              onSlideChange={(instance) => {
                setPage(instance.realIndex)
              }}
              a11y={{
                enabled: true,
                containerMessage: 'Скрины отзывов с карт',
              }}
            >
              {reviewScreenshots.map((shot, index) => (
                <SwiperSlide className="reviews__shots-item" key={shot.id}>
                  <figure className="reviews__shot">
                    <Image
                      src={shot.src}
                      alt={shot.alt}
                      width={shot.width}
                      height={shot.height}
                      sizes="(max-width: 1024px) 50vw, 30rem"
                      priority={index < 3}
                    />
                  </figure>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : null}
        </div>

        <button
          className="reviews__shots-control reviews__shots-control--next"
          type="button"
          aria-label="Следующий скрин отзыва"
          disabled={!ready}
          onClick={() => swiperRef.current?.slideNext(motionSpeed())}
        >
          <Icon name="chevron-down" />
        </button>
      </div>

      <div className="reviews__shots-pages" role="group" aria-label="Пагинация скринов отзывов">
        {reviewScreenshots.map((shot, index) => {
          const current = index === page

          return (
            <button
              className={['reviews__shots-page', current ? 'is-active' : ''].filter(Boolean).join(' ')}
              type="button"
              key={shot.id}
              aria-label={`Скрин ${index + 1} из ${reviewScreenshots.length}`}
              aria-current={current ? 'true' : undefined}
              disabled={!ready}
              onClick={() => {
                swiperRef.current?.slideTo(index, motionSpeed())
              }}
            >
              <Icon name="leaf" />
            </button>
          )
        })}
      </div>
    </section>
  )
}

function ReviewsShareForm() {
  const [open, setOpen] = useState(false)

  return (
    <section className="reviews__share" aria-labelledby="reviews-share-title">
      <p className="reviews__eyebrow">{t('Ваш опыт')}</p>
      <h2 className="reviews__share-title" id="reviews-share-title">
        {t('Поделиться впечатлением')}
      </h2>
      <p className="reviews__share-text">
        {t(`Если вы уже были в ${siteBrand}, напишите пару слов о визите.`)}
      </p>
      <button className="reviews__share-open" type="button" onClick={() => setOpen(true)}>
        {t('Оставить отзыв')}
      </button>

      <ReviewsSharePopup open={open} onClose={() => setOpen(false)} />
    </section>
  )
}

function ReviewsSharePopup({ open, onClose }: { open: boolean; onClose: () => void }) {
  const titleId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false)
  const [presented, setPresented] = useState(false)
  const [shown, setShown] = useState(false)
  const [done, setDone] = useState(false)

  if (open && !presented) {
    setPresented(true)
    setDone(false)
  }

  if (!open && shown) {
    setShown(false)
  }

  useEffect(() => {
    if (!open) {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const hideTimer = window.setTimeout(() => setPresented(false), reduceMotion ? 0 : 450)

      return () => window.clearTimeout(hideTimer)
    }

    let showFrame = 0
    const resetFrame = requestAnimationFrame(() => {
      setShown(false)
      showFrame = requestAnimationFrame(() => setShown(true))
    })
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', onKey)

    return () => {
      cancelAnimationFrame(resetFrame)
      cancelAnimationFrame(showFrame)
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!mounted || !presented) {
    return null
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // Visual fixture only: values are not read, sent, stored, or logged.
    setDone(true)
  }

  return createPortal(
    <div
      className={['reviews-popup', shown ? 'is-open' : ''].filter(Boolean).join(' ')}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        className="reviews-popup__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <button
          className="reviews-popup__close"
          type="button"
          aria-label="Закрыть"
          ref={closeRef}
          onClick={onClose}
        >
          <Icon name="close" />
        </button>

        <div className="reviews-popup__body">
          <div className="reviews-popup__scroll">
            {done ? (
              <div className="reviews-popup__done">
                <h2 className="reviews-popup__title" id={titleId}>
                  {t('Демонстрация')}
                </h2>
                <p className="reviews-popup__note">
                  {t('Отзыв не отправлен. Данные формы не сохраняются и не уходят на сервер.')}
                </p>
                <button className="reviews-popup__submit" type="button" onClick={onClose}>
                  {t('Закрыть')}
                </button>
              </div>
            ) : (
              <>
                <p className="reviews-popup__eyebrow">{t('Отзыв')}</p>
                <h2 className="reviews-popup__title" id={titleId}>
                  {t('Поделиться впечатлением')}
                </h2>
                <p className="reviews-popup__lead">
                  {t('Расскажите, что понравилось. Отзыв появится на сайте после проверки.')}
                </p>
                <form className="reviews-popup__form" noValidate onSubmit={onSubmit}>
                  <label className="reviews-popup__field">
                    <span className="reviews-popup__label">Имя</span>
                    <input
                      className="reviews-popup__input"
                      name="name"
                      type="text"
                      autoComplete="name"
                    />
                  </label>
                  <label className="reviews-popup__field">
                    <span className="reviews-popup__label">Отзыв</span>
                    <textarea className="reviews-popup__textarea" name="review" rows={4} />
                  </label>
                  <button className="reviews-popup__submit" type="submit">
                    {t('Отправить отзыв')}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  ) as ReactNode
}

export function Reviews() {
  return (
    <section className="reviews" aria-labelledby="reviews-title">
      <header className="reviews__hero">
        <p className="reviews__eyebrow">{siteBrand}</p>
        <div className="reviews__title-row">
          <h1 className="reviews__title" id="reviews-title">
            {t('Отзывы')}
          </h1>
          <div className="reviews__highlight" aria-label="Оценка 5,0">
            <span className="reviews__highlight-stars" aria-hidden="true">
              {Array.from({ length: 5 }, (_, index) => (
                <svg key={index} className="reviews__highlight-star" viewBox="0 0 24 24">
                  <path d="M12 2.6l2.7 6.2 6.7.6-5.1 4.4 1.5 6.5L12 16.9 6.2 20.3l1.5-6.5L2.6 9.4l6.7-.6L12 2.6z" />
                </svg>
              ))}
            </span>
            <span className="reviews__highlight-value">{reviewHighlight.value}</span>
          </div>
        </div>
        <p className="reviews__lead">
          {t('Что говорят гости садового центра на картах и у нас на сайте.')}
        </p>
      </header>

      <ReviewsShotSlider />
      <ReviewsShareForm />

      <section className="reviews__site" aria-labelledby="reviews-site-title">
        <div className="reviews__section-head">
          <p className="reviews__eyebrow">{t('Сайт')}</p>
          <h2 className="reviews__section-title" id="reviews-site-title">
            {t('Отзывы гостей')}
          </h2>
        </div>

        <ul className="reviews__list">
          {reviewFixtures.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </ul>
      </section>
    </section>
  )
}
