import { Icon } from '@/components/Icon'
import { SiteContactsMap } from '@/components/SiteContactsMap'
import {
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
          <div className="contacts__actions">
            <a className="contacts__action" href={sitePhoneHref}>
              Позвонить
            </a>
            <a className="contacts__action contacts__action--line" href={siteMapsHref} target="_blank" rel="noreferrer">
              Маршрут
            </a>
            <a className="contacts__action contacts__action--line" href={siteVkHref} target="_blank" rel="noreferrer">
              <Icon name="vk" className="contacts__action-icon" />
              ВКонтакте
            </a>
          </div>
          <p className="contacts__legal">
            <span>{siteLegalName}</span>
            <span>
              ОГРНИП {siteOgrnip}
              <span className="contacts__legal-dot" aria-hidden="true">
                ·
              </span>
              ИНН {siteInn}
            </span>
          </p>
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
