'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  useDeferredValue,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
  type FormEvent,
  type TransitionEvent,
} from 'react'
import { createPortal } from 'react-dom'
import { type ProductCardData } from '@/components/ProductCard'
import { Icon } from '@/components/Icon'
import { formatLayoutPrice } from '@/components/productCardSizes'
import { visibleProductSpecs } from '@/components/productSpecs'
import { minOfferPrice, offerPricesVary } from '@/import/greenmarket-price/offer-sizes'
import {
  catalogSearchPath,
  filterProductsBySearch,
  parseSearchQuery,
  SEARCH_QUERY_MAX_LENGTH,
  SEARCH_QUERY_MIN_LENGTH,
} from '@/catalog/search-catalog'

const RESULT_LIMIT = 12

function subscribeNever() {
  return () => {}
}

function subscribeReduceMotion(onChange: () => void) {
  const media = window.matchMedia('(prefers-reduced-motion: reduce)')
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}

function reduceMotionSnapshot() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function searchCountLabel(count: number) {
  const mod10 = count % 10
  const mod100 = count % 100

  if (mod10 === 1 && mod100 !== 11) {
    return `${count} товар`
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${count} товара`
  }

  return `${count} товаров`
}

function SearchHit({
  card,
  onClose,
}: {
  card: ProductCardData
  onClose: () => void
}) {
  const sizes = card.sizes ?? []
  const priceRubles = minOfferPrice(sizes, card.priceRubles ?? 0)
  const showFromPrice = offerPricesVary(sizes)
  const spec = visibleProductSpecs(card.specs ?? [])[0]

  return (
    <article
      className={['search-hit', card.available ? '' : 'is-unavailable'].filter(Boolean).join(' ')}
    >
      <div className="search-hit__media">
        <Image src="/img/placeholder.svg" alt="" width={64} height={64} />
      </div>
      <div className="search-hit__body">
        <h3 className="search-hit__name">
          <Link className="search-hit__link" href={card.href ?? '/product'} onClick={onClose}>
            {card.name}
          </Link>
        </h3>
        {spec ? (
          <p className="search-hit__spec">
            <span className="search-hit__spec-label">{spec.label}</span>
            <span className="search-hit__spec-value">{spec.value}</span>
          </p>
        ) : null}
      </div>
      <p className="search-hit__price">
        {card.available ? (
          <>
            {showFromPrice ? `от${'\u00a0'}` : null}
            {formatLayoutPrice(priceRubles)}
          </>
        ) : (
          'Нет'
        )}
      </p>
    </article>
  )
}

export function HeaderSearch({
  open,
  onOpen,
  onClose,
  onPresentedChange,
}: {
  open: boolean
  onOpen: () => void
  onClose: () => void
  onPresentedChange?: (presented: boolean) => void
}) {
  const router = useRouter()
  const inputId = useId()
  const panelId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const dockRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const [catalog, setCatalog] = useState<ProductCardData[] | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)
  const [pending, startTransition] = useTransition()
  const liveQuery = parseSearchQuery(query)
  const deferredQuery = useDeferredValue(liveQuery)
  const mounted = useSyncExternalStore(subscribeNever, () => true, () => false)
  const reduceMotion = useSyncExternalStore(subscribeReduceMotion, reduceMotionSnapshot, () => false)
  const [rail, setRail] = useState({ show: false, thumbHeight: 0, thumbTop: 0 })
  const [presented, setPresented] = useState(open)
  const closing = presented && !open

  if (open && !presented) {
    setPresented(true)
  }

  if (!open && presented && reduceMotion) {
    setPresented(false)
  }

  useLayoutEffect(() => {
    onPresentedChange?.(presented)
  }, [onPresentedChange, presented])

  useEffect(() => {
    if (!open) {
      return
    }

    inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open || catalog || loadFailed) {
      return
    }

    let cancelled = false

    startTransition(() => {
      void import('@/catalog')
        .then(({ getAllProductCards }) => {
          if (!cancelled) {
            setCatalog(getAllProductCards())
          }
        })
        .catch(() => {
          if (!cancelled) {
            setLoadFailed(true)
          }
        })
    })

    return () => {
      cancelled = true
    }
  }, [catalog, loadFailed, open])

  useEffect(() => {
    if (!open) {
      return
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }

    function onPointerDown(event: PointerEvent) {
      const target = event.target
      if (!(target instanceof Node)) {
        return
      }

      if (rootRef.current?.contains(target)) {
        return
      }

      const panel = document.getElementById(panelId)
      if (panel?.contains(target)) {
        return
      }

      onClose()
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [onClose, open, panelId])

  const matches =
    catalog && deferredQuery.length >= SEARCH_QUERY_MIN_LENGTH
      ? filterProductsBySearch(catalog, deferredQuery)
      : []
  const products = matches.slice(0, RESULT_LIMIT)
  const categories = (() => {
    const seen = new Map<string, { label: string; href: string }>()

    for (const product of products) {
      if (!product.categoryLabel || !product.categoryHref || seen.has(product.categoryHref)) {
        continue
      }

      seen.set(product.categoryHref, {
        label: product.categoryLabel,
        href: product.categoryHref,
      })
    }

    return [...seen.values()].sort((left, right) => left.label.localeCompare(right.label, 'ru'))
  })()
  const tooShort = liveQuery.length > 0 && liveQuery.length < SEARCH_QUERY_MIN_LENGTH
  const empty =
    !pending &&
    !loadFailed &&
    catalog != null &&
    deferredQuery.length >= SEARCH_QUERY_MIN_LENGTH &&
    matches.length === 0
  const showPanel = presented && (liveQuery.length > 0 || pending || loadFailed)
  const listingHref = catalogSearchPath(query)
  const canOpenListing = liveQuery.length >= SEARCH_QUERY_MIN_LENGTH

  useLayoutEffect(() => {
    if (!showPanel) {
      return
    }

    function placeDock() {
      if (closing) {
        return
      }

      const wrapper = document.querySelector<HTMLElement>('.header__wrapper')
      const search = rootRef.current
      const dock = dockRef.current

      if (!wrapper || !search || !dock) {
        return
      }

      const wrap = wrapper.getBoundingClientRect()
      const form = search.querySelector<HTMLElement>('.header-search__form')
      const field = (form ?? search).getBoundingClientRect()
      const width = wrap.right - field.left

      dock.style.top = `${Math.round(wrap.bottom + 8)}px`
      dock.style.left = `${Math.round(field.left)}px`
      dock.style.width = `${Math.round(width > 0 ? width : wrap.width)}px`
      dock.style.right = 'auto'
    }

    placeDock()
    const observer = new ResizeObserver(placeDock)
    const wrapper = document.querySelector('.header__wrapper')

    if (wrapper) {
      observer.observe(wrapper)
    }

    if (rootRef.current) {
      observer.observe(rootRef.current)
    }

    const form = rootRef.current?.querySelector('.header-search__form')

    if (form) {
      observer.observe(form)
    }

    window.addEventListener('resize', placeDock)
    window.addEventListener('scroll', placeDock, true)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', placeDock)
      window.removeEventListener('scroll', placeDock, true)
    }
  }, [closing, showPanel])

  useEffect(() => {
    const scroller = scrollRef.current

    if (!showPanel || !scroller) {
      return
    }

    function updateRail() {
      if (!scroller) {
        return
      }

      const { clientHeight, scrollHeight, scrollTop } = scroller

      if (scrollHeight <= clientHeight + 1) {
        setRail({ show: false, thumbHeight: 0, thumbTop: 0 })
        return
      }

      const thumbHeight = Math.max(28, (clientHeight / scrollHeight) * clientHeight)
      const maxTop = clientHeight - thumbHeight
      const thumbTop = (scrollTop / (scrollHeight - clientHeight)) * maxTop

      setRail({ show: true, thumbHeight, thumbTop })
    }

    const frame = window.requestAnimationFrame(updateRail)
    scroller.addEventListener('scroll', updateRail, { passive: true })
    const observer = new ResizeObserver(updateRail)
    observer.observe(scroller)

    return () => {
      window.cancelAnimationFrame(frame)
      scroller.removeEventListener('scroll', updateRail)
      observer.disconnect()
    }
  }, [showPanel, products.length, empty, tooShort, pending, loadFailed])

  function openListing() {
    if (!canOpenListing) {
      return
    }

    router.push(listingHref)
    onClose()
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    openListing()
  }

  function onFormMotionEnd(event: TransitionEvent<HTMLFormElement>) {
    if (event.target !== event.currentTarget || open) {
      return
    }

    if (event.propertyName !== 'opacity' && event.propertyName !== 'width') {
      return
    }

    setPresented(false)
  }

  return (
    <div
      className={['header-search', presented ? 'is-open' : '', closing ? 'is-closing' : '']
        .filter(Boolean)
        .join(' ')}
      ref={rootRef}
    >
      <button
        className="header__wrapper-action header__wrapper-action--search"
        type="button"
        aria-label="Поиск"
        aria-expanded={presented && !closing}
        aria-hidden={presented && !closing ? true : undefined}
        tabIndex={presented && !closing ? -1 : undefined}
        onClick={onOpen}
      >
        <Icon name="search" />
      </button>
      {presented ? (
        <form
          className="header-search__form"
          role="search"
          onSubmit={onSubmit}
          onTransitionEnd={onFormMotionEnd}
          aria-controls={showPanel ? panelId : undefined}
        >
          <label className="visually-hidden" htmlFor={inputId}>
            Название растения, сорта или латинское имя
          </label>
          <button
            className="header-search__submit"
            type="submit"
            aria-label="Найти в каталоге"
            disabled={!canOpenListing}
          >
            <Icon name="search" />
          </button>
          <input
            id={inputId}
            ref={inputRef}
            className="header-search__input"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value.slice(0, SEARCH_QUERY_MAX_LENGTH))}
            placeholder="Яблоня, Malus…"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={SEARCH_QUERY_MAX_LENGTH}
            aria-controls={showPanel ? panelId : undefined}
          />
          <button
            className="header-search__close"
            type="button"
            aria-label="Закрыть поиск"
            onClick={onClose}
          >
            <Icon name="close" />
          </button>
        </form>
      ) : null}

      {mounted && showPanel
        ? createPortal(
            <div
              className={['header-search-layer', closing ? 'is-closing' : 'is-open'].join(' ')}
              id={panelId}
            >
              <div className="header-search-layer__backdrop" aria-hidden="true" />
              <div className="header-search-layer__dock" ref={dockRef}>
                <div className="header-search-layer__panel" role="region" aria-label="Результаты поиска">
                  {products.length > 0 ? (
                    <div className="header-search-layer__toolbar">
                      <p className="header-search-layer__count" role="status">
                        {searchCountLabel(matches.length)}
                      </p>
                      {canOpenListing ? (
                        <button
                          className="header-search-layer__more"
                          type="button"
                          onClick={openListing}
                        >
                          Показать в каталоге
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                  <div
                    className={[
                      'header-search-layer__scroll',
                      empty ? 'is-empty' : '',
                      tooShort ? 'is-short' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    ref={scrollRef}
                  >
                    {pending && !catalog ? (
                      <p className="header-search-layer__hint">Ищем в каталоге…</p>
                    ) : null}
                    {loadFailed ? (
                      <p className="header-search-layer__hint" role="status">
                        Не удалось загрузить каталог. Обновите страницу и попробуйте снова.
                      </p>
                    ) : null}
                    {tooShort ? (
                      <p className="header-search-layer__hint">
                        Добавьте ещё букву.
                        <br />
                        Одной мало, слишком много совпадений.
                      </p>
                    ) : null}
                    {empty ? (
                      <div className="header-search-layer__empty" role="status">
                        <p className="header-search-layer__empty-text">
                          <strong>Ничего не нашлось.</strong>
                          <span>Попробуйте другое название.</span>
                        </p>
                        <Link
                          className="header-search-layer__empty-button"
                          href="/catalog"
                          onClick={onClose}
                        >
                          Открыть каталог
                        </Link>
                      </div>
                    ) : null}
                    {products.length > 0 ? (
                      <>
                        {categories.length > 0 ? (
                          <nav className="header-search-layer__categories" aria-label="Категории">
                            <p className="header-search-layer__categories-label">Категории</p>
                            <ul className="header-search-layer__categories-list">
                              {categories.map((category) => (
                                <li key={category.href}>
                                  <Link
                                    className="header-search-layer__category"
                                    href={category.href}
                                    onClick={onClose}
                                  >
                                    <span className="header-search-layer__category-name">
                                      {category.label}
                                    </span>
                                    <Icon name="arrow-right" />
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </nav>
                        ) : null}
                        <ul className="header-search-layer__list">
                          {products.map((product) => (
                            <li className="header-search-layer__item" key={product.id}>
                              <SearchHit card={product} onClose={onClose} />
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : null}
                  </div>
                  <div
                    className={[
                      'header-search-layer__footer',
                      empty || products.length === 0 ? 'is-compact' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    aria-hidden="true"
                  />
                  <div
                    className={['header-search-layer__rail', rail.show ? 'is-visible' : '']
                      .filter(Boolean)
                      .join(' ')}
                    aria-hidden="true"
                  >
                    <div
                      className="header-search-layer__thumb"
                      style={{
                        height: `${rail.thumbHeight}px`,
                        transform: `translateY(${rail.thumbTop}px)`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}
