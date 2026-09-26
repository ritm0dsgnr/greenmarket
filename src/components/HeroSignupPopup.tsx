'use client'

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
import { bindHangingWords } from '@/components/bindHangingWords'
import { Icon } from '@/components/Icon'
import { useScrollRail } from '@/components/useScrollRail'
import {
  siteBrand,
  siteMapsHref,
  siteStreet,
} from '@/components/siteContacts'

export type SignupPopupDetails = {
  lead?: string
  points?: readonly string[]
  timeLabel?: string
  place?: string
  callToAction?: string
  dateLabel?: string
  priceLabel?: string
}

const emptySubscribe = () => () => {}

export function HeroSignupPopup({
  open,
  title,
  details,
  onClose,
}: {
  open: boolean
  title: string
  details?: SignupPopupDetails | null
  onClose: () => void
}) {
  const titleId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false)
  const [shown, setShown] = useState(false)
  const [done, setDone] = useState(false)
  const rail = useScrollRail(scrollRef, shown && open, done)

  useEffect(() => {
    if (!open) {
      return
    }

    let showFrame = 0
    const resetFrame = requestAnimationFrame(() => {
      setDone(false)
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

  if (!mounted || !open) {
    return null
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // Visual fixture only: values are not read, sent, stored, or logged.
    setDone(true)
  }

  const whenLabel = details?.timeLabel ?? details?.dateLabel
  const priceLabel = details?.priceLabel

  return createPortal(
    <div
      className={['hero-signup', shown ? 'is-open' : ''].filter(Boolean).join(' ')}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        className="hero-signup__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <button
          className="hero-signup__close"
          type="button"
          aria-label="Закрыть"
          ref={closeRef}
          onClick={onClose}
        >
          <Icon name="close" />
        </button>

        <div className="hero-signup__body">
        <div className="hero-signup__scroll" ref={scrollRef}>
        {done ? (
          <div className="hero-signup__done">
            <h2 className="hero-signup__title" id={titleId}>
              Демонстрация
            </h2>
            <p className="hero-signup__note">
              Заявка не создана. Данные формы не отправляются и не сохраняются.
            </p>
            <button className="hero-signup__submit" type="button" onClick={onClose}>
              Закрыть
            </button>
          </div>
        ) : (
          <>
            <p className="hero-signup__eyebrow">Запись на мероприятие</p>
            <h2 className="hero-signup__title" id={titleId}>
              {bindHangingWords(title)}
            </h2>

            {whenLabel || priceLabel ? (
              <ul className="hero-signup__meta" aria-label="Детали">
                {whenLabel ? (
                  <li>
                    <span className="hero-signup__chip hero-signup__chip--date">{whenLabel}</span>
                  </li>
                ) : null}
                {priceLabel ? (
                  <li>
                    <span className="hero-signup__chip hero-signup__chip--price">{priceLabel}</span>
                  </li>
                ) : null}
              </ul>
            ) : null}

            {details?.lead ? (
              <p className="hero-signup__lead">{bindHangingWords(details.lead)}</p>
            ) : null}

            {details?.points && details.points.length > 0 ? (
              <div className="hero-signup__block">
                <p className="hero-signup__block-title">Что вас ждёт</p>
                <ul className="hero-signup__points">
                  {details.points.map((point) => (
                    <li key={point}>{bindHangingWords(point)}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {details?.place ? (
              <p className="hero-signup__place">
                Садовый центр {siteBrand}:{' '}
                <a
                  className="hero-signup__place-link"
                  href={siteMapsHref}
                  target="_blank"
                  rel="noreferrer"
                >
                  Берёзовский, {siteStreet}
                </a>
              </p>
            ) : null}

            {details?.callToAction ? (
              <p className="hero-signup__cta-note">{bindHangingWords(details.callToAction)}</p>
            ) : null}

            <form className="hero-signup__form" noValidate onSubmit={onSubmit}>
              <label className="hero-signup__field">
                <span className="hero-signup__label">Имя</span>
                <input className="hero-signup__input" name="name" type="text" autoComplete="name" />
              </label>
              <label className="hero-signup__field">
                <span className="hero-signup__label">Телефон</span>
                <input className="hero-signup__input" name="tel" type="tel" autoComplete="tel" />
              </label>
              <label className="hero-signup__field">
                <span className="hero-signup__label">Комментарий</span>
                <textarea className="hero-signup__textarea" name="message" rows={3} />
              </label>
              <button className="hero-signup__submit" type="submit">
                Записаться
              </button>
            </form>
          </>
        )}
        </div>
        {rail.show ? (
          <div className="hero-signup__rail" aria-hidden="true">
            <div
              className="hero-signup__thumb"
              style={{
                height: `${rail.thumbHeight}px`,
                transform: `translateY(${rail.thumbTop}px)`,
              }}
            />
          </div>
        ) : null}
        </div>
      </div>
    </div>,
    document.body,
  ) as ReactNode
}
