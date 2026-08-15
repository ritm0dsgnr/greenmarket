export const spriteIconNames = [
  'arrow-corner',
  'arrow-right',
  'cart',
  'check',
  'chevron-down',
  'clock',
  'close',
  'document',
  'filter',
  'heart',
  'leaf',
  'location',
  'menu',
  'phone',
  'search',
  'telegram',
  'trash',
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
      <use href={`#${name}`} />
    </svg>
  )
}
