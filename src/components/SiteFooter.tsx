import Link from 'next/link'
import { FooterTop } from '@/components/FooterTop'
import { Icon } from '@/components/Icon'
import { Logo } from '@/components/Logo'
import {
  siteBrand,
  siteCity,
  siteGardenName,
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

const buyerLinks = [
  { href: '/', label: 'Главная' },
  { href: '/catalog', label: 'Каталог' },
  { href: '/contacts', label: 'Контакты' },
  { href: '/cart', label: 'Корзина' },
] as const

const infoLinks = [
  { href: '/', label: 'Доставка' },
  { href: '/', label: 'Сертификаты' },
  { href: '/bonus-program', label: 'Бонусная программа' },
  { href: '/', label: 'Прайс' },
  { href: '/', label: 'Отзывы' },
] as const

const blogLinks = [
  { href: '/', label: 'Мероприятия' },
  { href: '/', label: 'Статьи' },
  { href: '/', label: 'Новости' },
] as const

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__stack">
        <div className="footer__panel footer__panel--bar">
          <div className="footer__brand">
            <div className="footer__identity">
              <Link className="footer__logo" href="/" aria-label={siteBrand}>
                <Logo />
              </Link>
              <p className="footer__lead">{siteGardenName}</p>
            </div>
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
            <nav className="footer__nav" aria-labelledby="footer-blog-title">
              <div className="footer__col-head">
                <h2 className="footer__title" id="footer-blog-title">
                  Блог
                </h2>
              </div>
              <ul className="footer__list">
                {blogLinks.map((item) => (
                  <li key={item.label}>
                    <Link className="footer__link" href={item.href}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="footer__contacts">
              <div className="footer__col-head">
                <h2 className="footer__title" id="footer-contacts-title">
                  Контакты
                </h2>
              </div>
              <a className="footer__phone" href={sitePhoneHref}>
                {sitePhoneDisplay}
              </a>
              <p className="footer__meta">
                <Icon name="clock" className="footer__meta-icon" />
                <span>{siteHours}</span>
              </p>
              <a className="footer__address" href={siteMapsHref} target="_blank" rel="noreferrer">
                <Icon name="location" className="footer__address-icon" />
                <span className="footer__address-text">
                  <span>{siteStreet}</span>
                  <span>{siteCity}</span>
                </span>
              </a>
            </div>
          </div>
          <div className="footer__bar">
            <p className="footer__legal">
              <span>{siteLegalName}</span>
              <span>
                ОГРНИП {siteOgrnip}
                <span className="footer__legal-dot" aria-hidden="true">
                  ·
                </span>
                ИНН {siteInn}
              </span>
            </p>
            <p className="footer__copy">© {siteBrand}, 2026</p>
          </div>
        </div>
        </div>
      </div>
    </footer>
  )
}
