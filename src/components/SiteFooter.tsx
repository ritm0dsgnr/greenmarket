import Link from 'next/link'
import { Logo } from '@/components/Logo'
import {
  siteAddress,
  siteBrand,
  siteHours,
  siteInn,
  siteLegalName,
  siteMapsHref,
  siteOgrnip,
  sitePhoneDisplay,
  sitePhoneHref,
} from '@/components/siteContacts'

export function SiteFooter() {
  return (
    <footer className="footer" id="contacts">
      <div className="container">
        <div className="footer__inner">
          <Link className="footer__logo" href="/" aria-label={siteBrand}>
            <Logo />
          </Link>
          <div className="footer__legal">
            <p>{siteLegalName}</p>
            <p>ОГРНИП {siteOgrnip}</p>
            <p>ИНН {siteInn}</p>
            <p>
              <a className="footer__link" href={siteMapsHref} target="_blank" rel="noreferrer">
                {siteAddress}
              </a>
            </p>
            <p>
              <a className="footer__link" href={sitePhoneHref}>
                {sitePhoneDisplay}
              </a>
            </p>
            <p>{siteHours}</p>
          </div>
          <p className="footer__copy">© {siteBrand}, 2026</p>
        </div>
      </div>
    </footer>
  )
}
