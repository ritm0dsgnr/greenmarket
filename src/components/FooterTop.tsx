'use client'

import { Icon } from '@/components/Icon'

export function FooterTop() {
  return (
    <a
      className="footer__top"
      href="#top"
      aria-label="Наверх"
      onClick={(event) => {
        event.preventDefault()
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
      }}
    >
      <span className="footer__top-label">Наверх</span>
      <Icon name="arrow-corner" className="footer__top-icon" />
    </a>
  )
}
