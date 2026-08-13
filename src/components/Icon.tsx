export const spriteIconNames = [
  'arrow-right',
  'cart',
  'check',
  'chevron-down',
  'clock',
  'close',
  'filter',
  'heart',
  'leaf',
  'location',
  'menu',
  'search',
  'telegram',
  'vk',
] as const

export type SpriteIconName = (typeof spriteIconNames)[number]

interface IconProps {
  name: SpriteIconName
  className?: string
}

export function Icon({ name, className = '' }: IconProps) {
  return (
    <svg className={['icon', className].filter(Boolean).join(' ')} aria-hidden="true" focusable="false">
      <use href={`/img/sprite.svg#${name}`} />
    </svg>
  )
}
