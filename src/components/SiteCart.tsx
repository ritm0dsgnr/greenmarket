'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState, type FormEvent } from 'react'
import { Icon } from '@/components/Icon'
import { cardTagLabels } from '@/components/ProductCard'
import {
  layoutCartCount,
  layoutCartDiscount,
  layoutCartLineOldPrice,
  layoutCartTotal,
  setLayoutCartQuantity,
  type LayoutCartLine,
} from '@/components/layoutCart'
import {
  createLayoutOrderNumber,
  validateLayoutCartOrder,
  type LayoutCartBuyer,
  type LayoutCartFulfillment,
  type LayoutCartOrderField,
} from '@/components/layoutCartOrder'
import { formatLayoutPrice } from '@/components/productCardSizes'
import { downloadLayoutCartExcel } from '@/components/exportLayoutCartExcel'
import { siteAddress, siteMapsHref } from '@/components/siteContacts'

const layoutFilledItems: LayoutCartLine[] = [
  {
    id: '1:C3',
    productId: '1',
    name: 'Роза флорибунда',
    latin: 'Rosa Jubile du Prince de Monaco',
    sizeLabel: 'C3',
    tag: 'sale',
    priceRubles: 1900,
    quantity: 2,
    href: '/product',
  },
  {
    id: 'similar-1:C3',
    productId: 'similar-1',
    name: 'Яблоня колоновидная',
    latin: 'Malus domestica',
    sizeLabel: 'C3',
    tag: 'sale',
    priceRubles: 2400,
    quantity: 1,
    href: '/product',
  },
  {
    id: 'extra-1',
    productId: 'extra-1',
    name: 'Грунт универсальный',
    priceRubles: 650,
    quantity: 1,
    href: '/product',
  },
]

const fulfillmentOptions = [
  { id: 'pickup', label: 'Самовывоз' },
  { id: 'delivery', label: 'Доставка' },
] as const

const buyerOptions = [
  { id: 'person', label: 'Физлицо' },
  { id: 'company', label: 'Юрлицо' },
] as const

function CartChoice({
  id,
  name,
  label,
  value,
  options,
  open,
  onToggle,
  onSelect,
}: {
  id: string
  name: string
  label: string
  value: string
  options: readonly { id: string; label: string }[]
  open: boolean
  onToggle: () => void
  onSelect: (id: string) => void
}) {
  const current = options.find((option) => option.id === value)?.label ?? options[0]?.label ?? ''

  return (
    <div className="cart__field">
      <span className="cart__field-label" id={`${id}-label`}>
        {label}
      </span>
      <input type="hidden" name={name} value={value} />
      <div className={['cart__choice', open ? 'is-open' : ''].filter(Boolean).join(' ')}>
        <button
          className="cart__choice-button"
          type="button"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={`${id}-list`}
          aria-labelledby={`${id}-label`}
          onClick={onToggle}
        >
          <span className="cart__choice-sizer" aria-hidden="true">
            {options.map((option) => (
              <span key={option.id}>{option.label}</span>
            ))}
          </span>
          <span className="cart__choice-value">{current}</span>
          <Icon name="chevron-down" className="cart__choice-arrow" />
        </button>
        <ul className="cart__choice-list" id={`${id}-list`} role="listbox" aria-label={label}>
          {options.map((option) => (
            <li key={option.id}>
              <button
                className={['cart__choice-option', option.id === value ? 'is-active' : ''].filter(Boolean).join(' ')}
                type="button"
                role="option"
                aria-selected={option.id === value}
                onClick={() => onSelect(option.id)}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export function SiteCart() {
  const [items, setItems] = useState<LayoutCartLine[]>(layoutFilledItems)
  const [errors, setErrors] = useState<Partial<Record<LayoutCartOrderField, string>>>({})
  const [fulfillment, setFulfillment] = useState<LayoutCartFulfillment>('pickup')
  const [buyer, setBuyer] = useState<LayoutCartBuyer>('person')
  const [menu, setMenu] = useState<'fulfillment' | 'buyer' | null>(null)
  const [thanks, setThanks] = useState<{ number: string } | null>(null)
  const [thanksOpen, setThanksOpen] = useState(false)
  const count = layoutCartCount(items)
  const total = layoutCartTotal(items)
  const discount = layoutCartDiscount(items)

  function closeThanks() {
    setThanksOpen(false)
    setThanks(null)
  }

  useEffect(() => {
    if (!thanks) {
      return
    }

    const frame = window.requestAnimationFrame(() => setThanksOpen(true))
    return () => window.cancelAnimationFrame(frame)
  }, [thanks])

  useEffect(() => {
    if (!menu) {
      return
    }

    function onPointerDown(event: PointerEvent) {
      if (event.target instanceof Element && event.target.closest('.cart__choice')) {
        return
      }

      setMenu(null)
    }

    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [menu])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return
      }

      if (menu) {
        setMenu(null)
        return
      }

      if (thanks) {
        closeThanks()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menu, thanks])

  function clearError(field: LayoutCartOrderField) {
    if (!errors[field]) {
      return
    }

    setErrors((current) => {
      const next = { ...current }
      delete next[field]
      return next
    })
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const next = validateLayoutCartOrder({
      name: String(data.get('name') ?? ''),
      tel: String(data.get('tel') ?? ''),
      email: String(data.get('email') ?? ''),
      marketing: data.get('marketing') === 'on',
      fulfillment: data.get('fulfillment') === 'delivery' ? 'delivery' : 'pickup',
      buyer: data.get('buyer') === 'company' ? 'company' : 'person',
      city: String(data.get('city') ?? ''),
      street: String(data.get('street') ?? ''),
      house: String(data.get('house') ?? ''),
      apartment: String(data.get('apartment') ?? ''),
    })

    setErrors(next)

    const firstInvalid = Object.keys(next)[0]
    if (firstInvalid) {
      const field = event.currentTarget.elements.namedItem(firstInvalid)
      if (field instanceof HTMLElement) {
        field.focus()
      }
      return
    }

    setThanks({
      number: createLayoutOrderNumber(),
    })
  }

  return (
    <>
      <section className="cart cart--empty" aria-labelledby="cart-empty-title">
        <h1 className="cart__title" id="cart-empty-title">
          Корзина
        </h1>
        <div className="cart__empty">
          <Image className="cart__empty-art" src="/img/cart-empty.png" alt="" width={180} height={180} />
          <p className="cart__empty-text">В корзине пока пусто. Добавьте товары из каталога.</p>
          <Link className="cart__empty-action" href="/catalog">
            В каталог
            <Icon name="chevron-down" className="cart__empty-arrow" />
          </Link>
        </div>
      </section>

      <section className="cart" aria-labelledby="cart-filled-title">
        <h2 className="cart__title" id="cart-filled-title">
          Корзина
        </h2>
        <div className="cart__layout">
          <button className="cart__clear" type="button" onClick={() => setItems([])}>
            <Icon name="trash" className="cart__clear-icon" />
            Очистить всю корзину
          </button>
          <ul className="cart__list">
            {items.map((item) => {
              const oldPrice = layoutCartLineOldPrice(item)

              return (
                <li className="cart__item" key={item.id}>
                  <button
                    className="cart__remove"
                    type="button"
                    aria-label={`Удалить ${item.name}`}
                    onClick={() => setItems((current) => setLayoutCartQuantity(current, item.id, 0))}
                  >
                    <Icon name="trash" />
                  </button>
                  <Link className="cart__photo" href={item.href ?? '/product'}>
                    <Image src="/img/placeholder.svg" alt="" width={309} height={220} />
                    {item.tag ? (
                      <span className={`cart__tag cart__tag--${item.tag}`}>{cardTagLabels[item.tag]}</span>
                    ) : null}
                  </Link>
                  <div className="cart__info">
                    <div className="cart__text">
                      <Link className="cart__name" href={item.href ?? '/product'}>
                        {item.name}
                      </Link>
                      {item.sizeLabel ? <p className="cart__size">{item.sizeLabel}</p> : null}
                    </div>
                    <p className="cart__price">
                      {oldPrice ? (
                        <del className="cart__price-old">{formatLayoutPrice(oldPrice * item.quantity)}</del>
                      ) : null}
                      <span className="cart__price-current">{formatLayoutPrice(item.priceRubles * item.quantity)}</span>
                    </p>
                  </div>
                  <div className="cart__aside">
                    <div className="cart__qty">
                      <button
                        className="cart__qty-button"
                        type="button"
                        aria-label={`Меньше, ${item.name}`}
                        onClick={() => setItems((current) => setLayoutCartQuantity(current, item.id, item.quantity - 1))}
                      >
                        −
                      </button>
                      <span className="cart__qty-value">{item.quantity}</span>
                      <button
                        className="cart__qty-button"
                        type="button"
                        aria-label={`Больше, ${item.name}`}
                        onClick={() => setItems((current) => setLayoutCartQuantity(current, item.id, item.quantity + 1))}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
          <div className="cart__summary">
            <div className="cart__totals">
              <p className="cart__row cart__row--discount">
                <span className="cart__row-label">Скидка</span>
                <span className="cart__row-value">{discount > 0 ? `−${formatLayoutPrice(discount)}` : formatLayoutPrice(0)}</span>
              </p>
              <p className="cart__row cart__row--total">
                <span className="cart__row-label">
                  Итого
                  <span className="cart__row-count">, {count} шт.</span>
                </span>
                <span className="cart__row-value">{formatLayoutPrice(total)}</span>
              </p>
            </div>
            <form className="cart__order" noValidate onSubmit={onSubmit}>
              <p className="cart__term">
                <span className="cart__term-label">Оплата</span>
                <span className="cart__term-value">
                  {fulfillment === 'pickup' ? 'В садовом центре при получении' : 'При получении'}
                </span>
              </p>
              <CartChoice
                id="cart-buyer"
                name="buyer"
                label="Покупатель"
                value={buyer}
                options={buyerOptions}
                open={menu === 'buyer'}
                onToggle={() => setMenu((current) => (current === 'buyer' ? null : 'buyer'))}
                onSelect={(id) => {
                  setBuyer(id === 'company' ? 'company' : 'person')
                  setMenu(null)
                }}
              />
              <div className="cart__choice-group">
                <CartChoice
                  id="cart-fulfillment"
                  name="fulfillment"
                  label="Получение"
                  value={fulfillment}
                  options={fulfillmentOptions}
                  open={menu === 'fulfillment'}
                  onToggle={() => setMenu((current) => (current === 'fulfillment' ? null : 'fulfillment'))}
                  onSelect={(id) => {
                    const nextFulfillment = id === 'delivery' ? 'delivery' : 'pickup'
                    setFulfillment(nextFulfillment)
                    setMenu(null)
                    if (nextFulfillment === 'pickup') {
                      clearError('city')
                      clearError('street')
                      clearError('house')
                    }
                  }}
                />
                {fulfillment === 'pickup' ? (
                  <p className="cart__term-value">
                    <a className="cart__term-link" href={siteMapsHref} target="_blank" rel="noreferrer">
                      {siteAddress}
                    </a>
                  </p>
                ) : (
                  <p className="cart__term-value">Стоимость доставки посчитает менеджер</p>
                )}
              </div>
              {fulfillment === 'delivery' ? (
                <div className="cart__delivery">
                  <label className={['cart__field', errors.city ? 'is-invalid' : ''].filter(Boolean).join(' ')}>
                    <span className="cart__field-label">Город</span>
                    <input
                      className="cart__field-input"
                      type="text"
                      name="city"
                      autoComplete="address-level2"
                      required
                      aria-invalid={Boolean(errors.city)}
                      aria-describedby={errors.city ? 'cart-city-error' : undefined}
                      onChange={() => clearError('city')}
                    />
                    <span className="cart__field-error" id="cart-city-error">
                      <span>{errors.city}</span>
                    </span>
                  </label>
                  <label className={['cart__field', errors.street ? 'is-invalid' : ''].filter(Boolean).join(' ')}>
                    <span className="cart__field-label">Улица</span>
                    <input
                      className="cart__field-input"
                      type="text"
                      name="street"
                      autoComplete="address-line1"
                      required
                      aria-invalid={Boolean(errors.street)}
                      aria-describedby={errors.street ? 'cart-street-error' : undefined}
                      onChange={() => clearError('street')}
                    />
                    <span className="cart__field-error" id="cart-street-error">
                      <span>{errors.street}</span>
                    </span>
                  </label>
                  <div className="cart__field-row">
                    <label className={['cart__field', errors.house ? 'is-invalid' : ''].filter(Boolean).join(' ')}>
                      <span className="cart__field-label">Дом</span>
                      <input
                        className="cart__field-input"
                        type="text"
                        name="house"
                        autoComplete="address-line2"
                        required
                        aria-invalid={Boolean(errors.house)}
                        aria-describedby={errors.house ? 'cart-house-error' : undefined}
                        onChange={() => clearError('house')}
                      />
                      <span className="cart__field-error" id="cart-house-error">
                        <span>{errors.house}</span>
                      </span>
                    </label>
                    <label className="cart__field">
                      <span className="cart__field-label">Квартира</span>
                      <input className="cart__field-input" type="text" name="apartment" autoComplete="address-line3" />
                    </label>
                  </div>
                </div>
              ) : null}
              <label className={['cart__field', errors.name ? 'is-invalid' : ''].filter(Boolean).join(' ')}>
                <span className="cart__field-label">Имя</span>
                <input
                  className="cart__field-input"
                  type="text"
                  name="name"
                  autoComplete="name"
                  required
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? 'cart-name-error' : undefined}
                  onChange={() => clearError('name')}
                />
                <span className="cart__field-error" id="cart-name-error">
                  <span>{errors.name}</span>
                </span>
              </label>
              <label className={['cart__field', errors.tel ? 'is-invalid' : ''].filter(Boolean).join(' ')}>
                <span className="cart__field-label">Телефон</span>
                <input
                  className="cart__field-input"
                  type="tel"
                  name="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  required
                  aria-invalid={Boolean(errors.tel)}
                  aria-describedby={errors.tel ? 'cart-tel-error' : undefined}
                  onChange={() => clearError('tel')}
                />
                <span className="cart__field-error" id="cart-tel-error">
                  <span>{errors.tel}</span>
                </span>
              </label>
              <label className={['cart__field', errors.email ? 'is-invalid' : ''].filter(Boolean).join(' ')}>
                <span className="cart__field-label">Почта</span>
                <input
                  className="cart__field-input"
                  type="email"
                  name="email"
                  autoComplete="email"
                  inputMode="email"
                  required
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'cart-email-error' : undefined}
                  onChange={() => clearError('email')}
                />
                <span className="cart__field-error" id="cart-email-error">
                  <span>{errors.email}</span>
                </span>
              </label>
              <label className="cart__field">
                <span className="cart__field-label">Комментарий</span>
                <textarea className="cart__field-input cart__field-input--area" name="comment" rows={3} />
              </label>
              <div className={['cart__consent', errors.marketing ? 'is-invalid' : ''].filter(Boolean).join(' ')}>
                <label className="cart__consent-row">
                  <input
                    className="visually-hidden"
                    type="checkbox"
                    name="marketing"
                    required
                    aria-invalid={Boolean(errors.marketing)}
                    aria-describedby={errors.marketing ? 'cart-marketing-error' : undefined}
                    onChange={() => clearError('marketing')}
                  />
                  <span className="cart__consent-box">
                    <Icon name="check" />
                  </span>
                  <span className="cart__consent-text">
                    Хочу получать новости, акции и информацию о бонусах. Контакт можно сохранить после заказа
                  </span>
                </label>
                <span className="cart__field-error" id="cart-marketing-error">
                  <span>{errors.marketing}</span>
                </span>
              </div>
              <div className="cart__actions">
                <button className="cart__checkout" type="submit">
                  Оформить заказ
                </button>
                <button className="cart__export" type="button" onClick={() => downloadLayoutCartExcel(items)}>
                  Выгрузить в Excel
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
      {thanks ? (
        <div
          className={['cart__overlay', thanksOpen ? 'is-open' : ''].filter(Boolean).join(' ')}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeThanks()
            }
          }}
        >
          <div className="cart__thanks" role="dialog" aria-modal="true" aria-labelledby="cart-thanks-title">
            <button className="cart__thanks-close" type="button" aria-label="Закрыть" onClick={closeThanks}>
              <Icon name="close" />
            </button>
            <h3 className="cart__thanks-title" id="cart-thanks-title">
              Демонстрация
            </h3>
            <p className="cart__thanks-number">Макет заявки {thanks.number}</p>
            <p className="cart__thanks-text">
              Данные не отправляются и не сохраняются.
            </p>
            <button className="cart__export" type="button" onClick={() => downloadLayoutCartExcel(items)}>
              Выгрузить в Excel
            </button>
          </div>
        </div>
      ) : null}
    </>
  )
}
