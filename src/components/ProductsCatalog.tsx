'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from '@/components/Icon'
import { ProductCard, type ProductCardData, type ProductCardTag } from '@/components/ProductCard'
import {
  collectSpecFilters,
  filterLayoutProducts,
  filterProductsByTags,
  listingNameGroupTags,
  layoutFiltersEqual,
  layoutSortOptions,
  layoutTagFilters,
  sortLayoutProducts,
} from '@/components/productListingLayout'
import type { ListingPromoTag } from '@/catalog/name-tag-url'
import {
  replaceListingUrl,
  withListingQuery,
  type ListingSortId,
  type ListingSpecFilter,
} from '@/catalog/listing-filters-url'

function specKey(label: string, value: string) {
  return `${label}\t${value}`
}

export function ProductsCatalog({
  products,
  children,
  showFilters = true,
  listingPath,
  activeNameTags = [],
  activePromoTags = [],
  initialSpecFilters = [],
  initialSort = 'featured',
  searchQuery = '',
}: {
  products: ProductCardData[]
  children: ReactNode
  showFilters?: boolean
  listingPath: string
  activeNameTags?: string[]
  activePromoTags?: ListingPromoTag[]
  initialSpecFilters?: ListingSpecFilter[]
  initialSort?: ListingSortId
  searchQuery?: string
}) {
  const router = useRouter()
  const [sort, setSort] = useState<ListingSortId>(initialSort)
  const [sortOpen, setSortOpen] = useState(false)
  const [draftFilters, setDraftFilters] = useState<ListingSpecFilter[]>(initialSpecFilters)
  const [appliedFilters, setAppliedFilters] = useState<ListingSpecFilter[]>(initialSpecFilters)
  const selectedPromoTags = activePromoTags
  const selectedNameTags = activeNameTags
  const [activeFilterKey, setActiveFilterKey] = useState<string | null>(null)
  const [applyTop, setApplyTop] = useState(0)
  const [applyReady, setApplyReady] = useState(false)
  const sortRef = useRef<HTMLDivElement>(null)
  const filtersRef = useRef<HTMLElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [rail, setRail] = useState({ show: false, thumbHeight: 0, thumbTop: 0 })
  const listingSyncKey = [
    listingPath,
    initialSort,
    searchQuery,
    activePromoTags.join(','),
    activeNameTags.join(','),
    initialSpecFilters
      .map((item) => `${item.label}:${item.value}`)
      .sort()
      .join('|'),
  ].join('::')
  const [activeListingKey, setActiveListingKey] = useState(listingSyncKey)

  if (listingSyncKey !== activeListingKey) {
    setActiveListingKey(listingSyncKey)
    setDraftFilters(initialSpecFilters)
    setAppliedFilters(initialSpecFilters)
    setSort(initialSort)
  }
  const specFilters = useMemo(
    () => collectSpecFilters(products.map((product) => ({ specs: product.specs ?? [] }))),
    [products],
  )
  const matchCount = useMemo(
    () =>
      filterProductsByTags(
        filterLayoutProducts(products, draftFilters),
        selectedPromoTags,
        selectedNameTags,
      ).length,
    [products, draftFilters, selectedPromoTags, selectedNameTags],
  )
  const visibleProducts = useMemo(
    () =>
      sortLayoutProducts(
        filterProductsByTags(
          filterLayoutProducts(products, appliedFilters),
          selectedPromoTags,
          selectedNameTags,
        ),
        sort,
      ),
    [products, appliedFilters, selectedPromoTags, selectedNameTags, sort],
  )
  const showFilterRail = showFilters && specFilters.length > 0
  const showApply = Boolean(activeFilterKey) && !layoutFiltersEqual(draftFilters, appliedFilters)
  const specScoped = useMemo(
    () => filterLayoutProducts(products, appliedFilters),
    [products, appliedFilters],
  )
  const nameGroups = useMemo(
    () => listingNameGroupTags(products, appliedFilters, selectedPromoTags, selectedNameTags),
    [products, appliedFilters, selectedPromoTags, selectedNameTags],
  )
  const promoTags = useMemo(
    () =>
      layoutTagFilters.filter(
        (tag) =>
          selectedPromoTags.includes(tag.id) || specScoped.some((product) => product.tag === tag.id),
      ),
    [specScoped, selectedPromoTags],
  )
  const currentSortLabel =
    layoutSortOptions.find((option) => option.id === sort)?.label ?? 'По умолчанию'

  function listingUrl(next: {
    nameTags?: readonly string[]
    promoTags?: readonly ListingPromoTag[]
    specFilters?: readonly ListingSpecFilter[]
    sort?: ListingSortId
  }) {
    return withListingQuery(listingPath, {
      nameTags: next.nameTags ?? selectedNameTags,
      promoTags: next.promoTags ?? selectedPromoTags,
      specFilters: next.specFilters ?? appliedFilters,
      sort: next.sort ?? sort,
      search: searchQuery,
    })
  }

  function syncListingUrl(next: {
    nameTags?: readonly string[]
    promoTags?: readonly ListingPromoTag[]
    specFilters?: readonly ListingSpecFilter[]
    sort?: ListingSortId
  }) {
    replaceListingUrl(listingUrl(next))
  }

  useEffect(() => {
    if (!filtersOpen) {
      return
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setFiltersOpen(false)
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [filtersOpen])

  useEffect(() => {
    if (!sortOpen) {
      return
    }

    function onPointerDown(event: PointerEvent) {
      if (sortRef.current?.contains(event.target as Node)) {
        return
      }

      setSortOpen(false)
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setSortOpen(false)
      }
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [sortOpen])

  useLayoutEffect(() => {
    if (!showApply || !activeFilterKey || !filtersRef.current) {
      return
    }

    const row = [...filtersRef.current.querySelectorAll('[data-filter-key]')].find(
      (element) => element.getAttribute('data-filter-key') === activeFilterKey,
    )

    if (!(row instanceof HTMLElement)) {
      return
    }

    const filtersBox = filtersRef.current.getBoundingClientRect()
    const rowBox = row.getBoundingClientRect()
    setApplyTop(rowBox.top - filtersBox.top + rowBox.height / 2)

    if (!applyReady) {
      requestAnimationFrame(() => setApplyReady(true))
    }
  }, [showApply, activeFilterKey, applyReady])

  useEffect(() => {
    const scroller = scrollRef.current

    if (!scroller) {
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

      const thumbHeight = Math.max(40, (clientHeight / scrollHeight) * clientHeight)
      const maxTop = clientHeight - thumbHeight
      const thumbTop = (scrollTop / (scrollHeight - clientHeight)) * maxTop

      setRail({ show: true, thumbHeight, thumbTop })
    }

    updateRail()
    scroller.addEventListener('scroll', updateRail, { passive: true })
    const observer = new ResizeObserver(updateRail)
    observer.observe(scroller)

    return () => {
      scroller.removeEventListener('scroll', updateRail)
      observer.disconnect()
    }
  }, [specFilters])

  function toggleFilter(label: string, value: string, checked: boolean) {
    setActiveFilterKey(specKey(label, value))
    setDraftFilters((current) => {
      if (checked) {
        return [...current, { label, value }]
      }

      return current.filter((item) => item.label !== label || item.value !== value)
    })
  }

  function applyFilters() {
    setAppliedFilters(draftFilters)
    setActiveFilterKey(null)
    setApplyReady(false)
    setFiltersOpen(false)
    syncListingUrl({ specFilters: draftFilters })
  }

  function changeSort(next: ListingSortId) {
    setSort(next)
    setSortOpen(false)
    syncListingUrl({ sort: next })
  }

  function togglePromoTag(tag: ProductCardTag, checked: boolean) {
    const next = checked
      ? selectedPromoTags.includes(tag)
        ? selectedPromoTags
        : [...selectedPromoTags, tag]
      : selectedPromoTags.filter((item) => item !== tag)

    router.push(
      listingUrl({
        promoTags: next,
      }),
    )
  }

  function toggleNameTag(tag: string, checked: boolean) {
    const next = checked
      ? selectedNameTags.includes(tag)
        ? selectedNameTags
        : [...selectedNameTags, tag]
      : selectedNameTags.filter((item) => item !== tag)

    router.push(
      listingUrl({
        nameTags: next,
      }),
    )
  }

  return (
    <>
      {showFilterRail ? (
        <aside
          className={['products__filters', filtersOpen ? 'is-open' : ''].filter(Boolean).join(' ')}
          aria-labelledby="products-filters-title"
          role={filtersOpen ? 'dialog' : undefined}
          aria-modal={filtersOpen ? true : undefined}
          ref={filtersRef}
        >
          <header className="products__filters-head">
            <span className="products__filters-mark" aria-hidden="true">
              <Icon name="filter" />
            </span>
            <h2 className="products__filters-title" id="products-filters-title">
              Параметры
            </h2>
            <button
              className="products__filters-close"
              type="button"
              aria-label="Закрыть фильтры"
              onClick={() => setFiltersOpen(false)}
            >
              <Icon name="close" />
            </button>
          </header>
          <div className="products__filters-body">
            <div className="products__filters-scroll" ref={scrollRef}>
              {specFilters.map((group) => (
                <div
                  className="products__group"
                  role="group"
                  aria-labelledby={`products-filter-${group.label}`}
                  key={group.label}
                >
                  <h3 className="products__group-title" id={`products-filter-${group.label}`}>
                    {group.label}
                  </h3>
                  {group.values.map((value) => {
                    const key = specKey(group.label, value)
                    const checked = draftFilters.some(
                      (item) => item.label === group.label && item.value === value,
                    )

                    return (
                      <div className="products__option-row" data-filter-key={key} key={value}>
                        <label className="products__option">
                          <input
                            className="visually-hidden"
                            type="checkbox"
                            name={group.label}
                            value={value}
                            checked={checked}
                            onChange={(event) => toggleFilter(group.label, value, event.target.checked)}
                          />
                          <span className="products__check">
                            <Icon name="check" />
                          </span>
                          <span>{value}</span>
                        </label>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
            {rail.show ? (
              <div className="products__filters-rail" aria-hidden="true">
                <div
                  className="products__filters-thumb"
                  style={{
                    height: `${rail.thumbHeight}px`,
                    transform: `translateY(${rail.thumbTop}px)`,
                  }}
                />
              </div>
            ) : null}
          </div>
          {activeFilterKey ? (
            <button
              className={['products__apply', showApply ? 'is-visible' : '', applyReady ? 'is-ready' : '']
                .filter(Boolean)
                .join(' ')}
              type="button"
              style={{ top: `${applyTop}px` }}
              onClick={applyFilters}
            >
              Применить&nbsp;({matchCount})
            </button>
          ) : null}
        </aside>
      ) : null}
      <div className="products__main">
        {children}
        <div className="products__toolbar">
          {showFilterRail ? (
            <button
              className="products__filters-toggle"
              type="button"
              aria-label="Фильтры"
              aria-haspopup="dialog"
              aria-expanded={filtersOpen}
              onClick={() => setFiltersOpen(true)}
            >
              <Icon name="filter" />
              {appliedFilters.length > 0 ? (
                <span className="products__filters-count" aria-hidden="true">
                  {appliedFilters.length}
                </span>
              ) : null}
            </button>
          ) : null}
          <div className="products__tags" role="group" aria-label="Теги">
            {promoTags.map((tag) => (
              <label className={`products__tag products__tag--${tag.id}`} key={tag.id}>
                <input
                  className="visually-hidden"
                  type="checkbox"
                  name="products-tag"
                  value={tag.id}
                  checked={selectedPromoTags.includes(tag.id)}
                  onChange={(event) => togglePromoTag(tag.id, event.target.checked)}
                />
                <span>{tag.label}</span>
                <span className="products__tag-close">
                  <Icon name="close" />
                </span>
              </label>
            ))}
            {nameGroups.map((group) => (
              <label className="products__tag products__tag--group" key={group.label}>
                <input
                  className="visually-hidden"
                  type="checkbox"
                  name="products-group"
                  value={group.label}
                  checked={selectedNameTags.includes(group.label)}
                  onChange={(event) => toggleNameTag(group.label, event.target.checked)}
                />
                <span>
                  {group.label}&nbsp;({group.count})
                </span>
                <span className="products__tag-close">
                  <Icon name="close" />
                </span>
              </label>
            ))}
          </div>
          <div
            className={['products__sort', sortOpen ? 'is-open' : ''].filter(Boolean).join(' ')}
            ref={sortRef}
          >
            <button
              className="products__sort-button"
              type="button"
              aria-expanded={sortOpen}
              aria-haspopup="listbox"
              aria-controls="products-sort-list"
              onClick={() => setSortOpen((open) => !open)}
            >
              <span className="products__sort-sizer" aria-hidden="true">
                {layoutSortOptions.map((option) => (
                  <span key={option.id}>{option.label}</span>
                ))}
              </span>
              <span className="products__sort-value">{currentSortLabel}</span>
              <Icon name="chevron-down" className="products__sort-arrow" />
            </button>
            <ul className="products__sort-list" id="products-sort-list" role="listbox" aria-label="Сортировка">
              {layoutSortOptions.map((option) => (
                <li key={option.id}>
                  <button
                    className={['products__sort-option', option.id === sort ? 'is-active' : '']
                      .filter(Boolean)
                      .join(' ')}
                    type="button"
                    role="option"
                    aria-selected={option.id === sort}
                    onClick={() => changeSort(option.id)}
                  >
                    {option.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <ul className="products__grid">
          {visibleProducts.map((product) => (
            <li className="products__item" key={product.id}>
              <ProductCard
                card={product}
                variant={showFilters ? 'full' : 'name-only'}
              />
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
