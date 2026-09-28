'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { HeaderSearch } from '@/components/HeaderSearch'
import { Icon } from '@/components/Icon'
import { useLayoutCart } from '@/components/LayoutCartProvider'
import { Logo } from '@/components/Logo'
import { catalogGroups, listCatalogGroupNavEntries } from '@/catalog'
import { sitePhoneDisplay, sitePhoneHref, siteTelegramHref, siteVkHref, siteBrand } from '@/components/siteContacts'
import { siteBlogRoute, siteInfoRoutes } from '@/components/siteNav'

const dropdownNav = [
  {
    id: 'catalog',
    label: 'Каталог',
    groups: catalogGroups,
  },
  {
    id: 'info',
    label: 'Информация',
    groups: [
      {
        items: [
          { href: siteInfoRoutes.delivery, label: 'Доставка и оплата' },
          { href: siteInfoRoutes.certificates, label: 'Сертификаты' },
          { href: siteInfoRoutes.bonusProgram, label: 'Бонусная программа' },
          { href: siteInfoRoutes.price, label: 'Прайс' },
          { href: siteInfoRoutes.reviews, label: 'Отзывы' },
        ],
      },
    ],
  },
] as const

const compactNavQuery = '(max-width: 1024px)'

export function SiteHeader() {
  const pathname = usePathname()
  const [openId, setOpenId] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchPresented, setSearchPresented] = useState(false)
  const [compactNav, setCompactNav] = useState(false)
  const [navPathname, setNavPathname] = useState(pathname)
  const navRef = useRef<HTMLElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const { count } = useLayoutCart()
  const countLabel = count > 99 ? '99+' : String(count)

  if (navPathname !== pathname) {
    setNavPathname(pathname)
    setOpenId(null)
    setMenuOpen(false)
    setSearchOpen(false)
  }

  function closeNav() {
    setOpenId(null)
    setMenuOpen(false)
  }

  function openSearch() {
    setOpenId(null)
    setMenuOpen(false)
    setSearchOpen(true)
  }

  function closeSearch() {
    setSearchOpen(false)
  }

  useEffect(() => {
    const active = document.activeElement
    if (active instanceof HTMLElement && navRef.current?.contains(active)) {
      active.blur()
    }
  }, [pathname])

  useEffect(() => {
    document.body.classList.toggle('is-nav-open', menuOpen)

    return () => {
      document.body.classList.remove('is-nav-open')
    }
  }, [menuOpen])

  useEffect(() => {
    const media = window.matchMedia(compactNavQuery)
    const onChange = () => {
      const compact = media.matches
      setCompactNav(compact)
      if (!compact) {
        setMenuOpen(false)
      }
    }

    onChange()
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenId(null)
        setMenuOpen(false)
        setSearchOpen(false)
        if (menuOpen) {
          toggleRef.current?.focus()
        }
        return
      }

      if (!menuOpen || event.key !== 'Tab') {
        return
      }

      const nav = navRef.current
      const toggle = toggleRef.current
      if (!nav || !toggle) {
        return
      }

      const items = [
        toggle,
        ...nav.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
      ]
      const first = items[0]
      const last = items[items.length - 1]
      if (!first || !last) {
        return
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Node)) {
        return
      }

      if (menuOpen) {
        return
      }

      const nav = navRef.current
      if (nav && !nav.contains(target)) {
        setOpenId(null)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [menuOpen])

  return (
    <header
      className={[
        'header',
        menuOpen ? 'is-menu-open' : '',
        searchOpen || searchPresented ? 'is-search-open' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="container">
        <div className="header__wrapper">
          <button
            className="header__wrapper-burger"
            type="button"
            ref={toggleRef}
            aria-expanded={menuOpen}
            aria-controls="header-nav"
            aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
            onClick={() => {
              setOpenId(null)
              setSearchOpen(false)
              setMenuOpen((open) => !open)
            }}
          >
            <Icon name={menuOpen ? 'close' : 'menu'} />
          </button>
          <nav
            className="header__wrapper-nav"
            id="header-nav"
            ref={navRef}
            aria-label="Основное меню"
            aria-hidden={compactNav && !menuOpen}
          >
            {dropdownNav.map((item) => {
              const isOpen = openId === item.id
              const dropdownId = `header-dropdown-${item.id}`

              return (
                <div
                  className={['header__wrapper-item', isOpen ? 'is-open' : ''].filter(Boolean).join(' ')}
                  key={item.id}
                >
                  <button
                    className="header__wrapper-link"
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={dropdownId}
                    onClick={() => setOpenId(isOpen ? null : item.id)}
                  >
                    {item.label}
                    <Icon name="chevron-down" className="header__wrapper-arrow" />
                  </button>
                  <div
                    className={['header__wrapper-dropdown', item.id !== 'catalog' ? 'header__wrapper-dropdown--sm' : ''].filter(Boolean).join(' ')}
                    id={dropdownId}
                  >
                    <div className="header__wrapper-dropdown-inner">
                      {item.groups.map((group, groupIndex) => {
                        const title = 'title' in group ? group.title : undefined
                        const titleId = `${dropdownId}-title-${groupIndex}`

                        return (
                          <div className="header__wrapper-dropdown-group" key={title ?? groupIndex}>
                            {title ? (
                              <p className="header__wrapper-dropdown-title" id={titleId}>
                                {title}
                              </p>
                            ) : null}
                            <ul
                              className="header__wrapper-dropdown-list"
                              aria-labelledby={title ? titleId : undefined}
                            >
                              {listCatalogGroupNavEntries(group).map((entry) => (
                                <li key={`${entry.href}-${entry.label}`}>
                                  <Link className="header__wrapper-dropdown-link" href={entry.href} onClick={closeNav}>
                                    {entry.label}
                                    <Icon name="arrow-right" className="header__wrapper-dropdown-arrow" />
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
            <Link className="header__wrapper-link" href={siteBlogRoute} onClick={closeNav}>
              Журнал
            </Link>
            <Link className="header__wrapper-link" href="/contacts" onClick={closeNav}>
              Контакты
            </Link>
            <div className="header__wrapper-nav-contacts">
              <a href={sitePhoneHref} className="header__wrapper-phone">
                {sitePhoneDisplay}
              </a>
              <div className="header__wrapper-socials">
                <a
                  className="header__wrapper-social"
                  href={siteVkHref}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="ВКонтакте"
                >
                  <Icon name="vk" />
                </a>
                <a
                  className="header__wrapper-social"
                  href={siteTelegramHref}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Telegram"
                >
                  <Icon name="telegram" />
                </a>
              </div>
            </div>
          </nav>
          <Link className="header__wrapper-logo" href="/" aria-label={siteBrand} onClick={closeNav}>
            <Logo withMark />
          </Link>
          <div className="header__wrapper-aside">
            <div className="header__wrapper-contacts">
              <a href={sitePhoneHref} className="header__wrapper-phone">
                {sitePhoneDisplay}
              </a>
              <div className="header__wrapper-socials">
                <a
                  className="header__wrapper-social"
                  href={siteVkHref}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="ВКонтакте"
                >
                  <Icon name="vk" />
                </a>
                <a
                  className="header__wrapper-social"
                  href={siteTelegramHref}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Telegram"
                >
                  <Icon name="telegram" />
                </a>
              </div>
            </div>
            <div className="header__wrapper-actions">
              <HeaderSearch
                open={searchOpen}
                onOpen={openSearch}
                onClose={closeSearch}
                onPresentedChange={setSearchPresented}
              />
              <Link
                className="header__wrapper-action header__wrapper-action--cart"
                href="/cart"
                data-cart-catch=""
                aria-label={count > 0 ? `Корзина, ${countLabel}` : 'Корзина'}
                onClick={() => {
                  closeSearch()
                  closeNav()
                }}
              >
                <Icon name="cart" />
                {count > 0 ? (
                  <span className="header__wrapper-action-count" aria-hidden="true" key={count}>
                    {countLabel}
                  </span>
                ) : null}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
