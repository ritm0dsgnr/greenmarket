interface LogoProps {
  className?: string
}

export function Logo({ className = '' }: LogoProps) {
  return (
    <svg
      className={['logo', className].filter(Boolean).join(' ')}
      viewBox="0 0 188 38"
      aria-hidden="true"
      focusable="false"
    >
      <use href="/img/sprite.svg#logo" />
    </svg>
  )
}
