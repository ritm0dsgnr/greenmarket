'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Icon } from '@/components/Icon'
import { ProductCard, type ProductCardData } from '@/components/ProductCard'
import {
  collectNameGroupTags,
  collectSpecFilters,
  filterLayoutProducts,
  layoutFiltersEqual,
  layoutSortOptions,
  layoutTagFilters,
  sortLayoutProducts,
  type LayoutSortId,
} from '@/components/productListingLayout'

type LayoutSpecFilter = { label: string; value: string }

function specKey(label: string, value: string) {
  return `${label}\t${value}`
}

export function ProductsCatalog({
  products,
  categoryLabel,
  children,
}: {
  products: ProductCardData[]
  categoryLabel: string
  children: ReactNode
}) {
  const [sort, setSort] = useState<LayoutSortId>('featured')
  const [sortOpen, setSortOpen] = useState(false)
  const [draftFilters, setDraftFilters] = useState<LayoutSpecFilter[]>([])
  const [appliedFilters, setAppliedFilters] = useState<LayoutSpecFilter[]>([])
  const [activeFilterKey, setActiveFilterKey] = useState<string | null>(null)
  const [applyTop, setApplyTop] = useState(0)
  const [applyReady, setApplyReady] = useState(false)
  const sortRef = useRef<HTMLDivElement>(null)
  const filtersRef = useRef<HTMLElement>(null)
  const specFilters = useMemo(
    () => collectSpecFilters(products.map((product) => ({ specs: product.specs ?? [] }))),
    [products],
  )
  const matchCount = useMemo(
    () => filterLayoutProducts(products, draftFilters).length,
    [products, draftFilters],
  )
  const visibleProducts = useMemo(
    () => sortLayoutProducts(filterLayoutProducts(products, appliedFilters), sort),
    [products, appliedFilters, sort],
  )
  const showApply = Boolean(activeFilterKey) && !layoutFiltersEqual(draftFilters, appliedFilters)
  const nameGroups = useMemo(
    () => collectNameGroupTags(products, categoryLabel),
    [products, categoryLabel],
  )
  const currentSortLabel =
    layoutSortOptions.find((option) => option.id === sort)?.label ?? 'По умолчанию'

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

  function toggleFilter(label: string, value: string, checked: boolean) {
    setActiveFilterKey(specKey(label, value))
    setDraftFilters((current) => {
      if (checked) {
        return [...current, { label, value }]
      }

      return current.filter((item) => item.label !== label || item.value !== value)
    })
  }

  return (
    <>
      <aside className="products__filters" aria-label="Фильтры" ref={filtersRef}>
        {specFilters.map((group) => (
          <div className="products__group" role="group" aria-labelledby={`products-filter-${group.label}`} key={group.label}>
            <h3 className="products__group-title" id={`products-filter-${group.label}`}>
              {group.label}
            </h3>
            {group.values.map((value) => {
              const key = specKey(group.label, value)
              const checked = draftFilters.some((item) => item.label === group.label && item.value === value)

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
        {activeFilterKey ? (
          <button
            className={['products__apply', showApply ? 'is-visible' : '', applyReady ? 'is-ready' : '']
              .filter(Boolean)
              .join(' ')}
            type="button"
            style={{ top: `${applyTop}px` }}
            onClick={() => setAppliedFilters(draftFilters)}
          >
            Применить&nbsp;({matchCount})
          </button>
        ) : null}
      </aside>
      <div className="products__main">
        {children}
        <div className="products__toolbar">
          <div className="products__tags" role="group" aria-label="Теги">
            {layoutTagFilters.map((tag) => (
              <label className={`products__tag products__tag--${tag.id}`} key={tag.id}>
                <input
                  className="visually-hidden"
                  type="checkbox"
                  name="products-tag"
                  value={tag.id}
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
                    onClick={() => {
                      setSort(option.id)
                      setSortOpen(false)
                    }}
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
              <ProductCard card={product} />
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
