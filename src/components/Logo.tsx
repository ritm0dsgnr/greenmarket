import Image from 'next/image'
import { siteBrandCaps } from '@/components/siteContacts'

interface LogoProps {
  className?: string
  withMark?: boolean
}

export function Logo({ className = '', withMark = false }: LogoProps) {
  if (withMark) {
    return (
      <span className={['logo', 'logo--with-mark', className].filter(Boolean).join(' ')}>
        <Image
          className="logo__mark"
          src="/img/logo-mark.png"
          alt=""
          width={80}
          height={80}
          unoptimized
        />
        <span className="logo__word">{siteBrandCaps}</span>
      </span>
    )
  }

  return (
    <svg
      className={['logo', className].filter(Boolean).join(' ')}
      viewBox="0 0 188 38"
      aria-hidden="true"
      focusable="false"
    >
      <use href="#logo" />
    </svg>
  )
}
