'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState, type TransitionEvent } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '@/components/Icon'
import { useLayoutCart } from '@/components/LayoutCartProvider'
import {
  defaultLayoutSizeId,
  emptySizeQuantities,
  formatLayoutPrice,
  hasLayoutSizeVariants,
  layoutCardSizes,
  layoutLinePrice,
  layoutSaleOldPrice,
  type LayoutSizeId,
} from '@/components/productCardSizes'
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
  latin?: string
  href?: string
  specs?: ProductSpec[]
  priceRubles?: number
  oldPriceRubles?: number
}

const cardSpecs: ProductSpec[] = [
  { label: 'Высота взрослого растения', value: 'h до 60 см' },
  { label: 'Цвет', value: 'белый' },
  { label: 'Посадка', value: 'солнце' },
]

export function ProductCard({ card }: { card: ProductCardData }) {
  const [open, setOpen] = useState(false)
  const [shown, setShown] = useState(false)
  const shownRef = useRef(false)
  const closingRef = useRef(false)
  const [quantities, setQuantities] = useState(emptySizeQuantities)
  const { addItems } = useLayoutCart()
  const specs = card.specs ?? cardSpecs
  const visibleSpecs = visibleProductSpecs(specs)
  const simple = visibleSpecs.length === 0
  const priceRubles = card.priceRubles ?? 2800
  const oldPriceRubles = layoutSaleOldPrice(priceRubles, card.tag, card.oldPriceRubles)
  const hasVariants = hasLayoutSizeVariants(card.specs)
  const sizes = layoutCardSizes(priceRubles, card.specs)
  const oldSizes = oldPriceRubles ? layoutCardSizes(oldPriceRubles, card.specs) : []
  const linePrice = layoutLinePrice(sizes, quantities)
  const oldLinePrice = oldPriceRubles
    ? hasVariants
      ? layoutLinePrice(oldSizes, quantities)
      : oldPriceRubles
    : undefined
  const hasItems = linePrice > 0

  shownRef.current = shown

  useEffect(() => {
    if (!open) {
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
  }, [open])

  useEffect(() => {
    if (!open || shown || !closingRef.current) {
      return
    }

    const timeout = window.setTimeout(() => {
      closingRef.current = false
      setOpen(false)
    }, 700)
    return () => window.clearTimeout(timeout)
  }, [open, shown])

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

  function openPicker() {
    if (!hasVariants) {
      addItems([
        {
          id: card.id,
          productId: card.id,
          name: card.name,
          latin: card.latin,
          tag: card.tag,
          priceRubles,
          quantity: 1,
          href: card.href ?? '/product',
        },
      ])
      return
    }

    const next = emptySizeQuantities()
    next[defaultLayoutSizeId(card.specs)] = 1
    closingRef.current = false
    setQuantities(next)
    setOpen(true)
  }

  function changeQuantity(id: LayoutSizeId, delta: number) {
    setQuantities((current) => ({
      ...current,
      [id]: Math.max(0, (current[id] ?? 0) + delta),
    }))
  }

  function confirmAdd() {
    addItems(
      sizes
        .filter((size) => (quantities[size.id] ?? 0) > 0)
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
    )
    closePicker()
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
            <>
              <p className="product-card__price">
                {oldPriceRubles ? (
                  <del className="product-card__price-old">{formatLayoutPrice(oldPriceRubles)}</del>
                ) : null}
                <span className="product-card__price-current">
                  {hasVariants ? `от${'\u00a0'}` : null}
                  {formatLayoutPrice(priceRubles)}
                </span>
              </p>
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
            </>
          ) : (
            <span className="product-card__more">Подробнее</span>
          )}
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
                      const oldSizePrice = oldSizes.find((entry) => entry.id === size.id)?.priceRubles

                      return (
                        <div className="product-card__size" key={size.id}>
                          <span className="product-card__size-name">{size.label}</span>
                          <span className="product-card__size-price">
                            {oldSizePrice ? (
                              <del className="product-card__price-old">{formatLayoutPrice(oldSizePrice)}</del>
                            ) : null}
                            <span className="product-card__price-current">{formatLayoutPrice(size.priceRubles)}</span>
                          </span>
                          <div className="product-card__qty">
                            <button
                              className="product-card__qty-button"
                              type="button"
                              aria-label={`Меньше, ${size.label}`}
                              disabled={quantity <= 0}
                              onClick={() => changeQuantity(size.id, -1)}
                            >
                              −
                            </button>
                            <span className="product-card__qty-value">{quantity}</span>
                            <button
                              className="product-card__qty-button"
                              type="button"
                              aria-label={`Больше, ${size.label}`}
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
