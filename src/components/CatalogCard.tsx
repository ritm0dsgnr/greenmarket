import Image from 'next/image'
import Link from 'next/link'
import { bindHangingWords } from '@/components/bindHangingWords'
import { Icon } from '@/components/Icon'
import { catalogCardImageSrc } from '@/catalog/catalog-card-images'

function CatalogCardTitleText({ title }: { title: string }) {
  const newlineIndex = title.indexOf('\n')

  if (newlineIndex === -1) {
    return bindHangingWords(title)
  }

  const primary = title.slice(0, newlineIndex)
  const secondary = title.slice(newlineIndex + 1).trim()

  return (
    <>
      {bindHangingWords(primary)}
      {secondary ? (
        <span className="catalog-card__title-secondary">{bindHangingWords(secondary)}</span>
      ) : null}
    </>
  )
}

function productCountAriaLabel(count: number) {
  const mod10 = count % 10
  const mod100 = count % 100

  if (mod10 === 1 && mod100 !== 11) {
    return `${count} товар`
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${count} товара`
  }

  return `${count} товаров`
}

export function CatalogCard({
  href,
  title,
  variant = 'category',
  count = 8,
}: {
  href: string
  title: string
  variant?: 'category' | 'sub'
  count?: number
}) {
  const imageSrc = catalogCardImageSrc(href)

  return (
    <Link
      className={variant === 'sub' ? 'catalog-card catalog-card--sub' : 'catalog-card'}
      href={href}
    >
      {variant === 'sub' ? (
        <span className="catalog-card__visual">
          <span className="catalog-card__meta">
            <span className="catalog-card__count" aria-label={productCountAriaLabel(count)}>
              {count}
            </span>
            <Icon name="arrow-corner" className="catalog-card__arrow" />
          </span>
          <span className="catalog-card__media">
            <Image src={imageSrc} alt="" width={309} height={220} />
          </span>
        </span>
      ) : (
        <span className="catalog-card__media">
          <Image src={imageSrc} alt="" width={309} height={220} />
        </span>
      )}
      <span className="catalog-card__title">
        <span className="catalog-card__title-text">
          <CatalogCardTitleText title={title} />
        </span>
        {variant === 'category' ? (
          <Icon name="arrow-corner" className="catalog-card__arrow" />
        ) : null}
      </span>
    </Link>
  )
}
