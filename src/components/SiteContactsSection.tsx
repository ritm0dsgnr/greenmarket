import { Icon } from '@/components/Icon'
import { SiteContactsMap } from '@/components/SiteContactsMap'
import {
  siteCity,
  siteGardenName,
  siteHours,
  siteMapsHref,
  sitePhoneDisplay,
  sitePhoneHref,
  siteStreet,
  siteTelegramHref,
  siteVkHref,
} from '@/components/siteContacts'

export function SiteContacts() {
  return (
    <section className="contacts" aria-labelledby="contacts-title">
      <div className="contacts__layout">
        <div className="contacts__main">
          <header className="contacts__head">
            <h1 className="contacts__title" id="contacts-title">
              Контакты
            </h1>
            <p className="contacts__lead">{siteGardenName}</p>
          </header>
          <div className="contacts__reach">
            <a className="contacts__phone" href={sitePhoneHref}>
              {sitePhoneDisplay}
            </a>
            <p className="contacts__meta">
              <Icon name="clock" className="contacts__meta-icon" />
              <span>{siteHours}</span>
            </p>
            <a className="contacts__address" href={siteMapsHref} target="_blank" rel="noreferrer">
              <Icon name="location" className="contacts__address-icon" />
              <span className="contacts__address-text">
                <span className="contacts__address-street">{siteStreet}</span>
                <span className="contacts__address-city">{siteCity}</span>
              </span>
            </a>
          </div>
          <div className="contacts__actions">
            <div className="contacts__buttons">
              <a className="contacts__action" href={sitePhoneHref}>
                Позвонить
              </a>
              <a className="contacts__action contacts__action--line" href={siteMapsHref} target="_blank" rel="noreferrer">
                Маршрут
              </a>
            </div>
            <div className="contacts__socials">
              <h2 className="contacts__socials-title">Мы в соцсетях</h2>
              <div className="contacts__socials-list">
                <a
                  className="contacts__social"
                  href={siteVkHref}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="ВКонтакте"
                >
                  <Icon name="vk" className="contacts__social-icon" />
                </a>
                <a
                  className="contacts__social"
                  href={siteTelegramHref}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Telegram"
                >
                  <Icon name="telegram" className="contacts__social-icon" />
                </a>
              </div>
            </div>
          </div>
        </div>
        <figure className="contacts__map">
          <div className="contacts__map-view">
            <SiteContactsMap />
          </div>
        </figure>
      </div>
    </section>
  )
}
