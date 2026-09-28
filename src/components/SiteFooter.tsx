import Link from 'next/link'
import { FooterTop } from '@/components/FooterTop'
import { Icon } from '@/components/Icon'
import { Logo } from '@/components/Logo'
import {
  siteBrand,
  siteCity,
  siteCreditsHref,
  siteCreditsLabel,
  siteHours,
  siteInn,
  siteLegalName,
  siteMapsHref,
  siteOgrnip,
  sitePhoneDisplay,
  sitePhoneHref,
  siteStreet,
  siteTelegramHref,
  siteVkHref,
} from '@/components/siteContacts'
import { siteBlogRoutes, siteInfoRoutes } from '@/components/siteNav'
import { HOME_CATALOG_DESKTOP_LIMIT, homeCatalogCategories } from '@/catalog'

const buyerLinks = [
  { href: '/', label: 'Главная' },
  { href: '/catalog', label: 'Каталог' },
  { href: '/contacts', label: 'Контакты' },
  { href: '/cart', label: 'Корзина' },
  { href: siteBlogRoutes.root, label: 'Журнал' },
] as const

const infoLinks = [
  { href: siteInfoRoutes.delivery, label: 'Доставка и оплата' },
  { href: siteInfoRoutes.certificates, label: 'Сертификаты' },
  { href: siteInfoRoutes.bonusProgram, label: 'Бонусная программа' },
  { href: siteInfoRoutes.price, label: 'Прайс' },
  { href: siteInfoRoutes.reviews, label: 'Отзывы' },
] as const

const catalogLinks = homeCatalogCategories
  .slice(0, HOME_CATALOG_DESKTOP_LIMIT)
  .map((category) => ({ href: category.href, label: category.label }))

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__stack">
        <div className="footer__panel footer__panel--bar">
          <div className="footer__brand">
            <Link className="footer__logo" href="/" aria-label={siteBrand}>
              <Logo />
            </Link>
          </div>
          <div className="footer__aside">
            <div className="footer__socials">
              <a
                className="footer__social"
                href={siteVkHref}
                target="_blank"
                rel="noreferrer"
                aria-label="ВКонтакте"
              >
                <Icon name="vk" className="footer__social-icon" />
              </a>
              <a
                className="footer__social"
                href={siteTelegramHref}
                target="_blank"
                rel="noreferrer"
                aria-label="Telegram"
              >
                <Icon name="telegram" className="footer__social-icon" />
              </a>
            </div>
            <FooterTop />
          </div>
        </div>
        <div className="footer__panel">
          <div className="footer__grid">
            <div className="footer__menus">
              <nav className="footer__nav" aria-labelledby="footer-buyers-title">
                <div className="footer__col-head">
                  <h2 className="footer__title" id="footer-buyers-title">
                    Покупателям
                  </h2>
                </div>
                <ul className="footer__list">
                  {buyerLinks.map((item) => (
                    <li key={item.label}>
                      <Link className="footer__link" href={item.href}>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <nav className="footer__nav" aria-labelledby="footer-info-title">
                <div className="footer__col-head">
                  <h2 className="footer__title" id="footer-info-title">
                    Информация
                  </h2>
                </div>
                <ul className="footer__list">
                  {infoLinks.map((item) => (
                    <li key={item.label}>
                      <Link className="footer__link" href={item.href}>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <nav className="footer__nav" aria-labelledby="footer-catalog-title">
                <div className="footer__col-head">
                  <h2 className="footer__title" id="footer-catalog-title">
                    Каталог
                  </h2>
                </div>
                <ul className="footer__list">
                  {catalogLinks.map((item) => (
                    <li key={item.label}>
                      <Link className="footer__link" href={item.href}>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
            <div className="footer__contacts">
              <div className="footer__col-head">
                <h2 className="footer__title" id="footer-contacts-title">
                  Контакты
                </h2>
              </div>
              <div className="footer__contacts-body">
                <div className="footer__contacts-reach">
                  <a className="footer__phone" href={sitePhoneHref}>
                    <Icon name="phone" className="footer__phone-icon" />
                    <span>{sitePhoneDisplay}</span>
                  </a>
                  <p className="footer__meta">
                    <Icon name="clock" className="footer__meta-icon" />
                    <span>{siteHours}</span>
                  </p>
                </div>
                <a className="footer__address" href={siteMapsHref} target="_blank" rel="noreferrer">
                  <Icon name="location" className="footer__address-icon" />
                  <span className="footer__address-text">
                    <span>{siteStreet}</span>
                    <span>{siteCity}</span>
                  </span>
                </a>
              </div>
            </div>
          </div>
          <div className="footer__bar">
            <p className="footer__legal">
              <span>{siteLegalName}</span>
              <span className="footer__legal-ids">
                <span>ОГРНИП {siteOgrnip}</span>
                <span className="footer__legal-dot" aria-hidden="true">
                  ·
                </span>
                <span>ИНН {siteInn}</span>
              </span>
            </p>
            <div className="footer__credits">
              <p className="footer__copy">© {siteBrand}, 2026</p>
              <a
                className="footer__madeby"
                href={siteCreditsHref}
                target="_blank"
                rel="noreferrer"
              >
                Сайт <span className="footer__madeby-name">{siteCreditsLabel}</span>
              </a>
            </div>
          </div>
        </div>
        </div>
      </div>
    </footer>
  )
}
