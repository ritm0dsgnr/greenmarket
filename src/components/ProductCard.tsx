'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState, type MouseEvent, type TransitionEvent } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '@/components/Icon'
import { cartAddOriginFromEvent, useLayoutCart } from '@/components/LayoutCartProvider'
import { formatLayoutPrice, layoutSaleOldPrice } from '@/components/productCardSizes'
import {
  minOfferPrice,
  offerPricesVary,
  offerSizesHaveChoices,
  type ProductOfferSize,
} from '@/import/greenmarket-price/offer-sizes'
import { visibleProductSpecs, type ProductSpec } from '@/components/productSpecs'

export const cardTagLabels = {
  sale: 'Sale',
  new: 'New',
  hit: 'Hit',
} as const

export type ProductCardTag = keyof typeof cardTagLabels

export type ProductCardData = {
  id: string
  tag: ProductCardTag | null
  available: boolean
  name: string
  nameTag?: string
  latin?: string
  href?: string
  categoryLabel?: string
  categoryHref?: string
  specs?: ProductSpec[]
  priceRubles?: number
  oldPriceRubles?: number
  sizes?: ProductOfferSize[]
}

const cardSpecs: ProductSpec[] = [
  { label: 'Высота взрослого растения', value: 'h до 60 см' },
  { label: 'Цвет', value: 'белый' },
  { label: 'Посадка', value: 'солнце' },
]

function emptyQuantities(sizes: ProductOfferSize[]) {
  return Object.fromEntries(sizes.map((size) => [size.id, 0])) as Record<string, number>
}

function lineTotal(sizes: ProductOfferSize[], quantities: Record<string, number>) {
  return sizes.reduce((sum, size) => sum + size.priceRubles * (quantities[size.id] ?? 0), 0)
}

export function ProductCard({
  card,
  variant = 'full',
}: {
  card: ProductCardData
  variant?: 'full' | 'name-only'
}) {
  const [open, setOpen] = useState(false)
  const [shown, setShown] = useState(false)
  const shownRef = useRef(false)
  const closingRef = useRef(false)
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const { addItems } = useLayoutCart()
  const specs = card.specs ?? cardSpecs
  const visibleSpecs = visibleProductSpecs(specs)
  const simple = visibleSpecs.length === 0
  const nameOnly = variant === 'name-only'
  const sizes = card.sizes ?? []
  const hasVariants = offerSizesHaveChoices(sizes)
  const priceRubles = minOfferPrice(sizes, card.priceRubles ?? 2800)
  const oldPriceRubles = layoutSaleOldPrice(priceRubles, card.tag, card.oldPriceRubles)
  const showFromPrice = offerPricesVary(sizes)
  const linePrice = lineTotal(sizes, quantities)
  const oldLinePrice =
    oldPriceRubles && hasVariants
      ? sizes.reduce((sum, size) => {
          const oldSizePrice = oldPriceRubles + (size.priceRubles - priceRubles)
          return sum + oldSizePrice * (quantities[size.id] ?? 0)
        }, 0)
      : oldPriceRubles
  const hasItems = linePrice > 0

  shownRef.current = shown

  useEffect(() => {
    if (!open || nameOnly) {
      closingRef.current = false
      return
    }

    let innerFrame = 0
    const frame = requestAnimationFrame(() => {
      innerFrame = requestAnimationFrame(() => setShown(true))
    })

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closePicker()
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      cancelAnimationFrame(frame)
      cancelAnimationFrame(innerFrame)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, nameOnly])

  useEffect(() => {
    if (!open || shown || !closingRef.current || nameOnly) {
      return
    }

    const timeout = window.setTimeout(() => {
      closingRef.current = false
      setOpen(false)
    }, 700)
    return () => window.clearTimeout(timeout)
  }, [open, shown, nameOnly])

  function closePicker() {
    if (!shownRef.current) {
      closingRef.current = false
      setOpen(false)
      return
    }

    closingRef.current = true
    setShown(false)
  }

  function onOverlayTransitionEnd(event: TransitionEvent<HTMLDivElement>) {
    const target = event.target
    if (
      !(target instanceof Element) ||
      !target.classList.contains('product-card__popup') ||
      event.propertyName !== 'opacity' ||
      shownRef.current ||
      !closingRef.current
    ) {
      return
    }

    closingRef.current = false
    setOpen(false)
  }

  function openPicker(event: MouseEvent<HTMLButtonElement>) {
    if (!hasVariants) {
      const size = sizes.find((item) => item.available)
      const origin = cartAddOriginFromEvent(event)

      if (size && sizes.length > 1) {
        addItems(
          [
            {
              id: `${card.id}:${size.id}`,
              productId: card.id,
              name: card.name,
              latin: card.latin,
              sizeLabel: size.label,
              tag: card.tag,
              priceRubles: size.priceRubles,
              quantity: 1,
              href: card.href ?? '/product',
            },
          ],
          origin,
        )
        return
      }

      addItems(
        [
          {
            id: card.id,
            productId: card.id,
            name: card.name,
            latin: card.latin,
            tag: card.tag,
            priceRubles: size?.priceRubles ?? priceRubles,
            quantity: 1,
            href: card.href ?? '/product',
          },
        ],
        origin,
      )
      return
    }

    const next = emptyQuantities(sizes)
    const firstAvailable = sizes.find((size) => size.available) ?? sizes[0]
    if (firstAvailable) {
      next[firstAvailable.id] = 1
    }
    closingRef.current = false
    setQuantities(next)
    setOpen(true)
  }

  function changeQuantity(id: string, delta: number) {
    const size = sizes.find((item) => item.id === id)
    if (size && !size.available) {
      return
    }

    setQuantities((current) => ({
      ...current,
      [id]: Math.max(0, (current[id] ?? 0) + delta),
    }))
  }

  function confirmAdd(event: MouseEvent<HTMLButtonElement>) {
    addItems(
      sizes
        .filter((size) => size.available && (quantities[size.id] ?? 0) > 0)
        .map((size) => ({
          id: `${card.id}:${size.id}`,
          productId: card.id,
          name: card.name,
          latin: card.latin,
          sizeLabel: size.label,
          tag: card.tag,
          priceRubles: size.priceRubles,
          quantity: quantities[size.id] ?? 0,
          href: card.href ?? '/product',
        })),
      cartAddOriginFromEvent(event),
    )
    closePicker()
  }

  if (nameOnly) {
    return (
      <article
        className={[
          'product-card',
          'product-card--name-only',
          card.available ? '' : 'is-unavailable',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className="product-card__media">
          <Image src="/img/placeholder.svg" alt="" width={309} height={220} />
        </div>
        <div className="product-card__body">
          <div className="product-card__names">
            <h3 className="product-card__name">
              <Link className="product-card__link" href={card.href ?? '/product'}>
                {card.name}
              </Link>
            </h3>
          </div>
        </div>
      </article>
    )
  }

  return (
    <article
      className={[
        card.available ? 'product-card' : 'product-card is-unavailable',
        simple ? 'product-card--simple' : '',
      ].filter(Boolean).join(' ')}
    >
      <div className="product-card__media">
        <Image src="/img/placeholder.svg" alt="" width={309} height={220} />
        {card.available && card.tag ? (
          <p className={`product-card__tag product-card__tag--${card.tag}`}>
            {cardTagLabels[card.tag]}
          </p>
        ) : null}
        {card.available ? null : (
          <p className="product-card__stock">Нет в наличии</p>
        )}
      </div>
      <div className="product-card__body">
        <div className="product-card__names">
          <h3 className="product-card__name">
            <Link className="product-card__link" href={card.href ?? '/product'}>
              {card.name}
            </Link>
          </h3>
          {card.latin ? <p className="product-card__latin">{card.latin}</p> : null}
        </div>
        {visibleSpecs.length > 0 ? (
          <div className="product-card__specs">
            {visibleSpecs.map((spec, specIndex) => (
              <p className="product-card__spec" key={specIndex}>
                <span className="product-card__spec-label">{spec.label}</span>
                <span className="product-card__spec-value">{spec.value}</span>
              </p>
            ))}
          </div>
        ) : null}
        <div className="product-card__footer">
          {card.available ? (
            <p className="product-card__price">
              {oldPriceRubles ? (
                <del className="product-card__price-old">{formatLayoutPrice(oldPriceRubles)}</del>
              ) : null}
              <span className="product-card__price-current">
                {showFromPrice ? `от${'\u00a0'}` : null}
                {formatLayoutPrice(priceRubles)}
              </span>
            </p>
          ) : (
            <span className="product-card__more">Подробнее</span>
          )}
          {card.available ? (
            <button
              className="product-card__cart"
              type="button"
              aria-label="В корзину"
              aria-expanded={hasVariants ? open : undefined}
              aria-haspopup={hasVariants ? 'dialog' : undefined}
              onClick={openPicker}
            >
              <Icon name="cart" />
            </button>
          ) : null}
        </div>
      </div>
      {open
        ? createPortal(
            <div
              className={['product-card__overlay', shown ? 'is-open' : ''].filter(Boolean).join(' ')}
              onClick={closePicker}
              onTransitionEnd={onOverlayTransitionEnd}
            >
              <div
                className="product-card__popup"
                role="dialog"
                aria-modal="true"
                aria-labelledby={`product-popup-${card.id}`}
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  className="product-card__popup-close"
                  type="button"
                  aria-label="Закрыть"
                  onClick={closePicker}
                >
                  <Icon name="close" />
                </button>
                <div className="product-card__popup-media">
                  <Image
                    className="product-card__popup-photo"
                    src="/img/placeholder.svg"
                    alt=""
                    width={309}
                    height={220}
                  />
                </div>
                <div className="product-card__popup-body">
                  <div className="product-card__popup-names">
                    <p className="product-card__popup-name" id={`product-popup-${card.id}`}>
                      {card.name}
                    </p>
                    <p className="product-card__popup-latin">{card.latin}</p>
                  </div>
                  <p className="product-card__popup-title">Размер</p>
                  <div className="product-card__sizes">
                    {sizes.map((size) => {
                      const quantity = quantities[size.id] ?? 0
                      const oldSizePrice = oldPriceRubles
                        ? oldPriceRubles + (size.priceRubles - priceRubles)
                        : undefined
                      const sizeAvailable = size.available !== false

                      return (
                        <div
                          className={[
                            'product-card__size',
                            sizeAvailable ? '' : 'is-unavailable',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                          key={size.id}
                        >
                          <span className="product-card__size-name">{size.label}</span>
                          <span className="product-card__size-price">
                            {oldSizePrice && oldSizePrice > size.priceRubles ? (
                              <del className="product-card__price-old">{formatLayoutPrice(oldSizePrice)}</del>
                            ) : null}
                            <span className="product-card__price-current">{formatLayoutPrice(size.priceRubles)}</span>
                            {sizeAvailable || size.label.toLowerCase() === 'нет в наличии' ? null : (
                              <span className="product-card__size-status">Нет в наличии</span>
                            )}
                          </span>
                          <div className="product-card__qty">
                            <button
                              className="product-card__qty-button"
                              type="button"
                              aria-label={`Меньше, ${size.label}`}
                              disabled={!sizeAvailable || quantity <= 0}
                              onClick={() => changeQuantity(size.id, -1)}
                            >
                              −
                            </button>
                            <span className="product-card__qty-value">{quantity}</span>
                            <button
                              className="product-card__qty-button"
                              type="button"
                              aria-label={`Больше, ${size.label}`}
                              disabled={!sizeAvailable}
                              onClick={() => changeQuantity(size.id, 1)}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="product-card__popup-footer">
                    <p className="product-card__popup-total">
                      <span className="product-card__popup-total-label">Итого</span>
                      {oldLinePrice && oldLinePrice > linePrice ? (
                        <del className="product-card__price-old">{formatLayoutPrice(oldLinePrice)}</del>
                      ) : null}
                      <span className="product-card__popup-total-value">{formatLayoutPrice(linePrice)}</span>
                    </p>
                    <button
                      className="product-card__add"
                      type="button"
                      disabled={!hasItems}
                      onClick={confirmAdd}
                    >
                      Добавить в корзину
                    </button>
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </article>
  )
}
