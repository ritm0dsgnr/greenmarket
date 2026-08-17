'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Icon } from '@/components/Icon'
import { useLayoutCart } from '@/components/LayoutCartProvider'
import { Logo } from '@/components/Logo'
import { catalogGroups } from '@/components/catalogCategories'
import { sitePhoneDisplay, sitePhoneHref, siteTelegramHref, siteVkHref } from '@/components/siteContacts'

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
          { href: '/', label: 'Доставка' },
          { href: '/', label: 'Сертификаты' },
          { href: '/bonus-program', label: 'Бонусная программа' },
          { href: '/', label: 'Прайс' },
          { href: '/', label: 'Отзывы' },
        ],
      },
    ],
  },
  {
    id: 'blog',
    label: 'Блог',
    groups: [
      {
        items: [
          { href: '/', label: 'Мероприятия' },
          { href: '/', label: 'Статьи' },
          { href: '/', label: 'Новости' },
        ],
      },
    ],
  },
] as const

export function SiteHeader() {
  const [openId, setOpenId] = useState<string | null>(null)
  const { count } = useLayoutCart()
  const countLabel = count > 99 ? '99+' : String(count)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenId(null)
      }
    }

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Node)) {
        return
      }

      const nav = document.getElementById('header-nav')
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
  }, [])

  return (
    <header className="header">
      <div className="container">
        <div className="header__wrapper">
          <nav className="header__wrapper-nav" id="header-nav" aria-label="Основное меню">
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
                            {group.items.map((entry) => (
                              <li key={entry.label}>
                                <Link className="header__wrapper-dropdown-link" href={entry.href}>
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
              )
            })}
            <Link className="header__wrapper-link" href="/contacts">
              Контакты
            </Link>
          </nav>
          <Link className="header__wrapper-logo" href="/" aria-label="Green Market">
            <Logo />
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
              <button className="header__wrapper-action header__wrapper-action--search" type="button" aria-label="Поиск">
                <Icon name="search" />
              </button>
              <Link
                className="header__wrapper-action header__wrapper-action--cart"
                href="/cart"
                aria-label={count > 0 ? `Корзина, ${countLabel}` : 'Корзина'}
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
