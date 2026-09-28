export const spriteIconNames = [
  'arrow-corner',
  'arrow-right',
  'calendar',
  'camera',
  'car',
  'card',
  'cart',
  'check',
  'chevron-down',
  'clock',
  'close',
  'document',
  'filter',
  'gift',
  'heart',
  'invoice',
  'leaf',
  'location',
  'menu',
  'percent',
  'phone',
  'pin',
  'plant',
  'receipt',
  'search',
  'telegram',
  'timer',
  'transfer',
  'trash',
  'truck',
  'vk',
  'warning',
] as const

export type SpriteIconName = (typeof spriteIconNames)[number]

interface IconProps {
  name: SpriteIconName
  className?: string
}

export function Icon({ name, className = '' }: IconProps) {
  return (
    <svg
      className={['icon', className].filter(Boolean).join(' ')}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <use href={`#${name}`} />
    </svg>
  )
}
