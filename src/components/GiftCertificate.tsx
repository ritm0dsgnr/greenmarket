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
import { Icon, type SpriteIconName } from '@/components/Icon'
import { siteBrand } from '@/components/siteContacts'

const t = bindHangingWords

const presetAmounts = [1000, 3000, 5000, 10000] as const

const assortment = [
  { icon: 'plant', text: 'Роскошные растения для сада и дома;' },
  { icon: 'house', text: 'Стильный декор, который добавит уюта;' },
  { icon: 'shirt', text: 'Удобная садовая одежда и качественные инструменты;' },
  { icon: 'heart', text: 'Множество приятных мелочей для вдохновения.' },
] as const satisfies ReadonlyArray<{ icon: SpriteIconName; text: string }>

const emptySubscribe = () => () => {}

function formatRub(value: number) {
  return `${value.toLocaleString('ru-RU')} ₽`
}

export function GiftCertificate() {
  const [amountMode, setAmountMode] = useState<'preset' | 'custom'>('preset')
  const [preset, setPreset] = useState<(typeof presetAmounts)[number]>(3000)
  const [customAmount, setCustomAmount] = useState('')
  const [orderOpen, setOrderOpen] = useState(false)

  const customValue = Number.parseInt(customAmount.replace(/\D/g, ''), 10)
  const selectedAmount =
    amountMode === 'preset' ? preset : Number.isFinite(customValue) && customValue > 0 ? customValue : null

  return (
    <section className="gift-certificate" aria-labelledby="gift-certificate-title">
      <header className="gift-certificate__hero">
        <p className="gift-certificate__eyebrow">{siteBrand}</p>
        <h1 className="gift-certificate__title" id="gift-certificate-title">
          {t('Подарочный сертификат')}
        </h1>
        <p className="gift-certificate__lead">{t('Подарок, который точно принесет радость!')}</p>
      </header>

      <div className="gift-certificate__story">
        <p>
          {t(
            'Знаете человека, который готов часами выбирать идеальный сорт роз или с любовью обустраивать свой сад? Мы знаем, как сделать его счастливым!',
          )}
        </p>
        <p>
          {t(
            'Подарочный сертификат в наш Садовый центр — это не просто подарок, это возможность для ваших близких выбрать именно то, о чем они мечтали. В нашем ассортименте:',
          )}
        </p>
        <ul className="gift-certificate__assortment">
          {assortment.map((item) => (
            <li key={item.text}>
              <span className="info-mark">
                <Icon name={item.icon} />
              </span>
              <span>{t(item.text)}</span>
            </li>
          ))}
        </ul>
        <p>
          {t(
            'Вы выбираете номинал сертификата, а получатель — удовольствие от покупок. Подарите близким возможность создать сад своей мечты!',
          )}
        </p>
      </div>

      <section className="gift-certificate__order" aria-labelledby="gift-certificate-order-title">
        <div className="gift-certificate__order-head">
          <p className="gift-certificate__order-eyebrow">Заказ</p>
          <h2 className="gift-certificate__order-title" id="gift-certificate-order-title">
            {t('Выберите номинал')}
          </h2>
          <p className="gift-certificate__order-note">
            {t('Онлайн-оплаты нет. Оформляете заявку, дальше согласовываем получение с менеджером.')}
          </p>
        </div>

        <div className="gift-certificate__amounts" role="group" aria-label="Номинал сертификата">
          {presetAmounts.map((value) => {
            const active = amountMode === 'preset' && preset === value
            return (
              <button
                key={value}
                className={['gift-certificate__amount', active ? 'is-active' : '']
                  .filter(Boolean)
                  .join(' ')}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setAmountMode('preset')
                  setPreset(value)
                }}
              >
                {formatRub(value)}
              </button>
            )
          })}
          <button
            className={[
              'gift-certificate__amount',
              'gift-certificate__amount--custom',
              amountMode === 'custom' ? 'is-active' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            type="button"
            aria-pressed={amountMode === 'custom'}
            onClick={() => setAmountMode('custom')}
          >
            Другая сумма
          </button>
        </div>

        {amountMode === 'custom' ? (
          <label className="gift-certificate__custom">
            <span className="gift-certificate__custom-label">Сумма, ₽</span>
            <input
              className="gift-certificate__custom-input"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="Например, 7000"
              value={customAmount}
              onChange={(event) => setCustomAmount(event.target.value.replace(/[^\d\s]/g, ''))}
            />
          </label>
        ) : null}

        <button
          className="gift-certificate__submit"
          type="button"
          disabled={selectedAmount === null}
          onClick={() => {
            if (selectedAmount !== null) {
              setOrderOpen(true)
            }
          }}
        >
          Заказать сертификат
          {selectedAmount !== null ? (
            <span className="gift-certificate__submit-sum">{formatRub(selectedAmount)}</span>
          ) : null}
        </button>
      </section>

      <GiftCertificateOrderPopup
        open={orderOpen}
        amount={selectedAmount}
        onClose={() => setOrderOpen(false)}
      />
    </section>
  )
}

function GiftCertificateOrderPopup({
  open,
  amount,
  onClose,
}: {
  open: boolean
  amount: number | null
  onClose: () => void
}) {
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

  if (!mounted || !presented || amount === null) {
    return null
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // Visual fixture only: values are not read, sent, stored, or logged.
    setDone(true)
  }

  return createPortal(
    <div
      className={['gift-certificate-popup', shown ? 'is-open' : ''].filter(Boolean).join(' ')}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        className="gift-certificate-popup__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <button
          className="gift-certificate-popup__close"
          type="button"
          aria-label="Закрыть"
          ref={closeRef}
          onClick={onClose}
        >
          <Icon name="close" />
        </button>

        <div className="gift-certificate-popup__body">
          <div className="gift-certificate-popup__scroll">
            {done ? (
              <div className="gift-certificate-popup__done">
                <h2 className="gift-certificate-popup__title" id={titleId}>
                  Демонстрация
                </h2>
                <p className="gift-certificate-popup__note">
                  Заявка не создана. Данные формы не отправляются и не сохраняются.
                </p>
                <button className="gift-certificate-popup__submit" type="button" onClick={onClose}>
                  Закрыть
                </button>
              </div>
            ) : (
              <>
                <p className="gift-certificate-popup__eyebrow">Подарочный сертификат</p>
                <h2 className="gift-certificate-popup__title" id={titleId}>
                  {t('Оставить заявку')}
                </h2>
                <p className="gift-certificate-popup__amount">{formatRub(amount)}</p>
                <p className="gift-certificate-popup__lead">
                  {t(
                    'Онлайн-оплаты нет. Менеджер свяжется с вами и подскажет, как получить сертификат.',
                  )}
                </p>
                <form className="gift-certificate-popup__form" noValidate onSubmit={onSubmit}>
                  <label className="gift-certificate-popup__field">
                    <span className="gift-certificate-popup__label">Имя</span>
                    <input
                      className="gift-certificate-popup__input"
                      name="name"
                      type="text"
                      autoComplete="name"
                    />
                  </label>
                  <label className="gift-certificate-popup__field">
                    <span className="gift-certificate-popup__label">Телефон</span>
                    <input
                      className="gift-certificate-popup__input"
                      name="tel"
                      type="tel"
                      autoComplete="tel"
                    />
                  </label>
                  <label className="gift-certificate-popup__field">
                    <span className="gift-certificate-popup__label">Комментарий</span>
                    <textarea className="gift-certificate-popup__textarea" name="message" rows={3} />
                  </label>
                  <button className="gift-certificate-popup__submit" type="submit">
                    Отправить заявку
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
