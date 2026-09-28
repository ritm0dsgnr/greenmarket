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
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: reduceMotion ? 'auto' : 'smooth',
        })
      }}
    >
      <Icon name="arrow-right" className="footer__top-icon" />
      <span className="footer__top-label">Наверх</span>
    </a>
  )
}
