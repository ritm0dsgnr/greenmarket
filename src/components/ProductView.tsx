'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState, type MouseEvent, type PointerEvent, type TransitionEvent } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '@/components/Icon'
import { cartAddOriginFromEvent, useLayoutCart } from '@/components/LayoutCartProvider'
import { bindHangingWords } from '@/components/bindHangingWords'
import { formatLayoutPrice, layoutSaleOldPrice } from '@/components/productCardSizes'
import type { ProductCardTag } from '@/components/ProductCard'
import type { ProductSpec } from '@/components/productSpecs'
import { useSwipePager } from '@/components/useSwipePager'
import {
  firstAvailableSizeId,
  offerSizesHaveChoices,
  type ProductOfferSize,
} from '@/import/greenmarket-price/offer-sizes'

const tagLabels = {
  sale: 'Sale',
  new: 'New',
  hit: 'Hit',
} as const

const slides = [
  { id: '1' },
  { id: '2' },
  { id: '3' },
  { id: '4' },
  { id: '5' },
  { id: '6' },
  { id: '7' },
] as const

const sizeLegend = [
  { mark: '100-120', text: 'высота растения в сантиметрах' },
  { mark: 'ОКС', text: 'растение с открытой корневой системой (голый корень)' },
  { mark: 'P9', text: 'квадратный контейнер объёмом 0,5 литра' },
  { mark: 'C2, C3', text: 'контейнер объемом 2, 3 литра' },
  { mark: 'WRB60', text: 'корневая система упакована в сетку и мешковину, где цифра - диаметр земляного кома' },
  { mark: 'St80', text: 'штамбовая форма растения, где цифра означает высоту штамба' },
  { mark: 'mSt', text: 'многоствольная (кустовая) форма растения' },
  { mark: 'Sol', text: 'взрослое крупное растение высокого качества, предназначенное для сольной посадки' },
  { mark: '12/14', text: 'обхват ствола в сантиметрах' },
] as const

export type ProductViewModel = {
  id: string
  name: string
  latin?: string
  tag: ProductCardTag | null
  tagHref?: string | null
  groupTags: Array<{ label: string; href: string }>
  available: boolean
  priceRubles: number
  sizes: ProductOfferSize[]
  specs: ProductSpec[]
  description: string[]
}

function preventPhotoCopy(event: { preventDefault: () => void }) {
  event.preventDefault()
}

function wrapSlideIndex(index: number) {
  const last = slides.length - 1

  if (index < 0) {
    return last
  }

  if (index > last) {
    return 0
  }

  return index
}

function ProductThumbs({
  current,
  onSelect,
}: {
  current: number
  onSelect: (index: number) => void
}) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const drag = useRef({
    pointerId: -1,
    moved: false,
    captured: false,
    startX: 0,
    startScroll: 0,
  })
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller || drag.current.pointerId !== -1) {
      return
    }

    const currentScroller = scroller
    const active = currentScroller.querySelector<HTMLElement>('.is-active')
    const item = active?.closest('li')
    if (!(item instanceof HTMLElement)) {
      return
    }

    const track = currentScroller.querySelector<HTMLElement>('.product__thumbs-track')
    const gutter = Number.parseFloat(getComputedStyle(track ?? currentScroller).paddingLeft) || 0
    const items = Array.from(currentScroller.querySelectorAll('li'))
    const scrollerBox = currentScroller.getBoundingClientRect()
    const slop = 1

    function isFullyVisible(element: Element) {
      const box = element.getBoundingClientRect()
      return box.left >= scrollerBox.left + gutter - slop && box.right <= scrollerBox.right - gutter + slop
    }

    function scrollToShow(target: HTMLElement) {
      const box = target.getBoundingClientRect()
      const leftBound = scrollerBox.left + gutter
      const rightBound = scrollerBox.right - gutter

      if (box.right > rightBound + slop) {
        currentScroller.scrollBy({ left: box.right - rightBound, behavior: 'smooth' })
        return
      }

      if (box.left < leftBound - slop) {
        currentScroller.scrollBy({ left: box.left - leftBound, behavior: 'smooth' })
      }
    }

    const visible = items.filter(isFullyVisible)
    const lastVisible = visible[visible.length - 1]
    const firstVisible = visible[0]
    const next = item.nextElementSibling
    const prev = item.previousElementSibling

    if (item === lastVisible && next instanceof HTMLElement) {
      scrollToShow(next)
      return
    }

    if (item === firstVisible && prev instanceof HTMLElement) {
      scrollToShow(prev)
      return
    }

    scrollToShow(item)
  }, [current])

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) {
      return
    }

    drag.current = {
      pointerId: event.pointerId,
      moved: false,
      captured: false,
      startX: event.clientX,
      startScroll: event.currentTarget.scrollLeft,
    }
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const currentDrag = drag.current
    if (currentDrag.pointerId !== event.pointerId) {
      return
    }

    const dx = event.clientX - currentDrag.startX
    if (!currentDrag.moved && Math.abs(dx) < 8) {
      return
    }

    currentDrag.moved = true
    if (!currentDrag.captured) {
      event.currentTarget.setPointerCapture(event.pointerId)
      currentDrag.captured = true
    }

    setDragging(true)
    event.currentTarget.scrollLeft = currentDrag.startScroll - dx
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    const currentDrag = drag.current
    if (currentDrag.pointerId !== event.pointerId) {
      return
    }

    const moved = currentDrag.moved
    currentDrag.pointerId = -1
    currentDrag.moved = false
    currentDrag.captured = false
    setDragging(false)

    if (!moved) {
      return
    }

    const scroller = event.currentTarget
    const blockClick = (clickEvent: Event) => {
      clickEvent.preventDefault()
      clickEvent.stopPropagation()
      scroller.removeEventListener('click', blockClick, true)
    }
    scroller.addEventListener('click', blockClick, true)
  }

  return (
    <div className="product__thumbs">
      <div
        className={['product__thumbs-scroller', dragging ? 'is-dragging' : ''].filter(Boolean).join(' ')}
        ref={scrollerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <ul className="product__thumbs-track">
          {slides.map((slide, index) => (
            <li key={slide.id}>
              <button
                className={['product__thumb', index === current ? 'is-active' : ''].filter(Boolean).join(' ')}
                type="button"
                aria-label={`Фото ${index + 1}`}
                aria-current={index === current ? 'true' : undefined}
                onClick={() => onSelect(index)}
              >
                <Image src="/img/placeholder.svg" alt="" width={309} height={220} draggable={false} />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function SizeLegend() {
  return (
    <div className="product__hint" role="tooltip">
      <p className="product__hint-title">Как читать маркировку</p>
      <ul className="product__hint-list">
        {sizeLegend.map((item) => (
          <li className="product__hint-item" key={item.mark}>
            <span className="product__hint-mark">{item.mark}</span>
            <span className="product__hint-text">{bindHangingWords(item.text)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ProductView({ product }: { product: ProductViewModel }) {
  const sizes =
    product.sizes.length > 0
      ? product.sizes
      : [
          {
            id: 'default',
            label: '1 шт',
            priceRubles: product.priceRubles,
            hint: 'Базовая позиция',
            available: product.available,
          },
        ]
  const [slideIndex, setSlideIndex] = useState(0)
  const [legendSizeId, setLegendSizeId] = useState<string | null>(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxShown, setLightboxShown] = useState(false)
  const lightboxShownRef = useRef(false)
  const lightboxClosingRef = useRef(false)
  const pageViewportRef = useRef<HTMLDivElement | null>(null)
  const lightboxViewportRef = useRef<HTMLDivElement | null>(null)
  const [sizeId, setSizeId] = useState(firstAvailableSizeId(sizes) ?? 'default')
  const [quantity, setQuantity] = useState(1)
  const [activeProductId, setActiveProductId] = useState(product.id)
  const { addItems } = useLayoutCart()

  if (product.id !== activeProductId) {
    setActiveProductId(product.id)
    setSizeId(firstAvailableSizeId(sizes) ?? 'default')
    setQuantity(1)
    setSlideIndex(0)
    setLegendSizeId(null)
  }

  const hasVariants = offerSizesHaveChoices(sizes)
  const selected = sizes.find((size) => size.id === sizeId) ?? sizes[0]
  const selectedAvailable = selected?.available !== false
  const unitPrice = selected?.priceRubles ?? product.priceRubles
  const oldUnitPrice = layoutSaleOldPrice(unitPrice, product.tag)
  const total = unitPrice * quantity
  const oldTotal = oldUnitPrice ? oldUnitPrice * quantity : undefined
  const swipeSlide = (direction: -1 | 1) => {
    setSlideIndex((current) => wrapSlideIndex(current + direction))
  }
  const pageSwipe = useSwipePager(swipeSlide, {
    onTap: () => setLightboxOpen(true),
    getCommitDistance: () => pageViewportRef.current?.clientWidth ?? 0,
  })
  const lightboxSwipe = useSwipePager(swipeSlide, {
    getCommitDistance: () => lightboxViewportRef.current?.clientWidth ?? 0,
    onDismissDown: () => closeLightbox(),
  })

  lightboxShownRef.current = lightboxShown

  useEffect(() => {
    if (!legendSizeId) {
      return
    }

    const onPointerDown = (event: Event) => {
      const target = event.target
      if (!(target instanceof Element)) {
        return
      }
      if (target.closest('.product__size-help, .product__hint')) {
        return
      }
      setLegendSizeId(null)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setLegendSizeId(null)
      }
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [legendSizeId])

  useEffect(() => {
    if (!lightboxOpen) {
      lightboxClosingRef.current = false
      return
    }

    let innerFrame = 0
    const frame = requestAnimationFrame(() => {
      innerFrame = requestAnimationFrame(() => setLightboxShown(true))
    })

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closeLightbox()
        return
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        setSlideIndex((current) => wrapSlideIndex(current - 1))
        return
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault()
        setSlideIndex((current) => wrapSlideIndex(current + 1))
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      cancelAnimationFrame(frame)
      cancelAnimationFrame(innerFrame)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [lightboxOpen])

  useEffect(() => {
    if (!lightboxOpen) {
      lightboxSwipe.reset()
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [lightboxOpen, lightboxSwipe.reset])

  useEffect(() => {
    if (!lightboxOpen || lightboxShown || !lightboxClosingRef.current) {
      return
    }

    const timeout = window.setTimeout(() => {
      lightboxClosingRef.current = false
      setLightboxOpen(false)
    }, 700)
    return () => window.clearTimeout(timeout)
  }, [lightboxOpen, lightboxShown])

  function closeLightbox() {
    if (!lightboxShownRef.current) {
      lightboxClosingRef.current = false
      setLightboxOpen(false)
      return
    }

    lightboxClosingRef.current = true
    setLightboxShown(false)
  }

  function onLightboxTransitionEnd(event: TransitionEvent<HTMLDivElement>) {
    const target = event.target
    if (
      !(target instanceof Element) ||
      !target.classList.contains('product__lightbox-frame') ||
      event.propertyName !== 'opacity' ||
      lightboxShownRef.current ||
      !lightboxClosingRef.current
    ) {
      return
    }

    lightboxClosingRef.current = false
    setLightboxOpen(false)
  }

  function buy(event: MouseEvent<HTMLButtonElement>) {
    if (quantity <= 0 || !selected || !selectedAvailable) {
      return
    }

    addItems(
      [
        {
          id: `${product.id}:${selected.id}`,
          productId: product.id,
          name: product.name,
          latin: product.latin,
          sizeLabel: selected.label,
          tag: product.tag,
          priceRubles: unitPrice,
          quantity,
          href: `/product/${product.id}`,
        },
      ],
      cartAddOriginFromEvent(event),
    )
  }

  return (
    <article className="product">
      {legendSizeId ? <div className="product__legend-scrim" aria-hidden="true" /> : null}
      <div className="product__layout">
        <div
          className="product__gallery"
          onContextMenu={preventPhotoCopy}
          onDragStart={preventPhotoCopy}
        >
          <div className="product__slider">
            <div
              className={['product__viewport', pageSwipe.dragging ? 'is-dragging' : ''].filter(Boolean).join(' ')}
              role="button"
              tabIndex={0}
              aria-label="Открыть фото на весь экран"
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  setLightboxOpen(true)
                }
              }}
              ref={(element) => {
                pageViewportRef.current = element
                pageSwipe.bind.ref(element)
              }}
              onPointerDown={pageSwipe.bind.onPointerDown}
              onPointerMove={pageSwipe.bind.onPointerMove}
              onPointerUp={pageSwipe.bind.onPointerUp}
              onPointerCancel={pageSwipe.bind.onPointerCancel}
              onClickCapture={pageSwipe.bind.onClickCapture}
            >
              <ul
                className={['product__track', pageSwipe.dragging ? 'is-dragging' : ''].filter(Boolean).join(' ')}
                style={{ transform: `translateX(calc(-${slideIndex * 100}% + ${pageSwipe.shift}px))` }}
              >
                {slides.map((slide, index) => (
                  <li className="product__slide" key={slide.id} aria-hidden={index !== slideIndex}>
                    <Image src="/img/placeholder.svg" alt="" width={309} height={220} draggable={false} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="product__info">
          {product.tag || product.groupTags.length > 0 ? (
            <ul className="product__tags">
              {product.tag ? (
                <li>
                  {product.tagHref ? (
                    <Link
                      className={`product__tag product__tag--${product.tag}`}
                      href={product.tagHref}
                    >
                      {tagLabels[product.tag]}
                    </Link>
                  ) : (
                    <span className={`product__tag product__tag--${product.tag}`}>
                      {tagLabels[product.tag]}
                    </span>
                  )}
                </li>
              ) : null}
              {product.groupTags.map((tag) => (
                <li key={tag.label}>
                  <Link className="product__tag product__tag--group" href={tag.href}>
                    {tag.label}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="product__names">
            <h1 className="product__name">{bindHangingWords(product.name)}</h1>
            {product.latin ? <p className="product__latin">{product.latin}</p> : null}
          </div>
            <div className="product__offer">
              {hasVariants ? (
              <div className="product__choose">
                  <div className="product__sizes">
                    {sizes.map((size) => {
                      const sizeAvailable = size.available !== false
                      const selectedSize = sizeAvailable && size.id === sizeId
                      const oldSizePrice = layoutSaleOldPrice(size.priceRubles, product.tag)

                      return (
                        <div
                          className={[
                            'product__size',
                            selectedSize ? 'is-active' : '',
                            sizeAvailable ? '' : 'is-unavailable',
                            legendSizeId === size.id ? 'is-legend-open' : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                          key={size.id}
                        >
                          <button
                            className="product__size-pick"
                            type="button"
                            aria-pressed={selectedSize}
                            aria-disabled={!sizeAvailable}
                            disabled={!sizeAvailable}
                            aria-label={`${size.label}, ${formatLayoutPrice(size.priceRubles)}, ${
                              sizeAvailable ? size.hint : 'нет в наличии'
                            }`}
                            onClick={() => {
                              if (!sizeAvailable) {
                                return
                              }

                              setSizeId(size.id)
                            }}
                          >
                            <span className="product__size-name">{size.label}</span>
                            <span className="product__size-price">
                              {oldSizePrice ? (
                                <del className="product__price-old">{formatLayoutPrice(oldSizePrice)}</del>
                              ) : null}
                              <span className="product__price-current">{formatLayoutPrice(size.priceRubles)}</span>
                            </span>
                            {!sizeAvailable && size.label.toLowerCase() !== 'нет в наличии' ? (
                              <span className="product__size-status">Нет в наличии</span>
                            ) : null}
                          </button>
                          <div className="product__size-tip">
                            <button
                              className="product__size-help"
                              type="button"
                              aria-label="Как читать маркировку размера"
                              aria-expanded={legendSizeId === size.id}
                              onClick={() => {
                                setLegendSizeId((current) => (current === size.id ? null : size.id))
                              }}
                            >
                              ?
                            </button>
                          </div>
                          <SizeLegend />
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : null}
              <div className="product__checkout">
                <div className="product__qty">
                  <button
                    className="product__qty-button"
                    type="button"
                    aria-label="Меньше"
                    disabled={!selectedAvailable || quantity <= 1}
                    onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                  >
                    −
                  </button>
                  <span className="product__qty-value">{quantity}</span>
                  <button
                    className="product__qty-button"
                    type="button"
                    aria-label="Больше"
                    disabled={!selectedAvailable}
                    onClick={() => setQuantity((current) => current + 1)}
                  >
                    +
                  </button>
                </div>
                <p className="product__total">
                  <span className="product__total-label">Итого</span>
                  {oldTotal && oldTotal > total ? (
                    <del className="product__price-old">{formatLayoutPrice(oldTotal)}</del>
                  ) : null}
                  <span className="product__total-value">{formatLayoutPrice(total)}</span>
                </p>
                <button
                  className="product__buy"
                  type="button"
                  disabled={!selectedAvailable}
                  onClick={buy}
                >
                  {selectedAvailable ? 'Добавить в корзину' : 'Нет в наличии'}
                </button>
              </div>
            </div>
          <div className="product__copy">
            <div className="product__description">
              {product.description.map((paragraph) => (
                <p key={paragraph}>{bindHangingWords(paragraph)}</p>
              ))}
            </div>
          </div>
          {product.specs.length > 0 ? (
            <section className="product__features" aria-labelledby="product-features-title">
              <h2 className="product__features-title" id="product-features-title">
                Характеристики
              </h2>
              <ul className="product__specs">
                {product.specs.map((spec) => (
                  <li className="product__spec" key={spec.label}>
                    <span className="product__spec-label">{spec.label}</span>
                    <span className="product__spec-value">{spec.value}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
        <ProductThumbs current={slideIndex} onSelect={setSlideIndex} />
      </div>
      {lightboxOpen
        ? createPortal(
            <div
              className={[
                'product__lightbox',
                lightboxShown ? 'is-open' : '',
                lightboxSwipe.dragging ? 'is-dragging' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={
                lightboxSwipe.shiftY > 0
                  ? {
                      ['--lightbox-dim' as string]: String(
                        Math.max(0.08, 1 - lightboxSwipe.shiftY / 420),
                      ),
                    }
                  : undefined
              }
              onClick={closeLightbox}
              onTransitionEnd={onLightboxTransitionEnd}
            >
              <button
                className="product__lightbox-close"
                type="button"
                aria-label="Закрыть"
                onClick={closeLightbox}
              >
                <Icon name="close" />
              </button>
              <div
                className="product__lightbox-frame"
                role="dialog"
                aria-modal="true"
                aria-label="Фото товара"
                onClick={(event) => event.stopPropagation()}
                style={
                  lightboxSwipe.shiftY > 0
                    ? {
                        transform: `translateY(${lightboxSwipe.shiftY}px) scale(${Math.max(0.88, 1 - lightboxSwipe.shiftY / 1600)})`,
                      }
                    : undefined
                }
              >
                <div
                  className={['product__lightbox-viewport', lightboxSwipe.dragging ? 'is-dragging' : ''].filter(Boolean).join(' ')}
                  onContextMenu={preventPhotoCopy}
                  onDragStart={preventPhotoCopy}
                  ref={(element) => {
                    lightboxViewportRef.current = element
                    lightboxSwipe.bind.ref(element)
                  }}
                  onPointerDown={lightboxSwipe.bind.onPointerDown}
                  onPointerMove={lightboxSwipe.bind.onPointerMove}
                  onPointerUp={lightboxSwipe.bind.onPointerUp}
                  onPointerCancel={lightboxSwipe.bind.onPointerCancel}
                  onClickCapture={lightboxSwipe.bind.onClickCapture}
                >
                  <ul
                    className={['product__lightbox-track', lightboxSwipe.dragging ? 'is-dragging' : ''].filter(Boolean).join(' ')}
                    style={{ transform: `translateX(calc(-${slideIndex * 100}% + ${lightboxSwipe.shift}px))` }}
                  >
                    {slides.map((slide, index) => (
                      <li
                        className="product__lightbox-slide"
                        key={slide.id}
                        aria-hidden={index !== slideIndex}
                      >
                        <Image src="/img/placeholder.svg" alt="" width={309} height={220} draggable={false} />
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="product__lightbox-controls">
                  <button
                    className="product__lightbox-control product__lightbox-control--prev"
                    type="button"
                    aria-label="Предыдущее фото"
                    onClick={() => setSlideIndex((current) => wrapSlideIndex(current - 1))}
                  >
                    <Icon name="arrow-right" />
                  </button>
                  <button
                    className="product__lightbox-control product__lightbox-control--next"
                    type="button"
                    aria-label="Следующее фото"
                    onClick={() => setSlideIndex((current) => wrapSlideIndex(current + 1))}
                  >
                    <Icon name="arrow-right" />
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </article>
  )
}
