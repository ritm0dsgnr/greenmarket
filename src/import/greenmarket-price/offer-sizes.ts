import type { PriceCatalogProduct, PriceOffer } from './types'
import type { ProductSpec } from '@/components/productSpecs'

export type ProductOfferSize = {
  id: string
  label: string
  priceRubles: number
  hint: string
  available: boolean
}

type OfferFieldFlags = {
  containerVaries: boolean
  plantSizeVaries: boolean
}

function trimPart(value?: string) {
  return value?.trim() || undefined
}

function uniqueNonEmpty(values: Array<string | undefined>) {
  return [...new Set(values.filter((value): value is string => Boolean(value)))]
}

export function pricedOffers(offers: readonly PriceOffer[]) {
  return offers.filter((offer) => offer.priceRubles != null)
}

export function analyzeOfferFields(offers: readonly PriceOffer[]): OfferFieldFlags {
  const priced = pricedOffers(offers)
  const containers = uniqueNonEmpty(priced.map((offer) => trimPart(offer.container)))
  const plantSizes = uniqueNonEmpty(priced.map((offer) => trimPart(offer.plantSize)))

  return {
    containerVaries: containers.length > 1,
    plantSizeVaries: plantSizes.length > 1,
  }
}

function offerLabel(
  offer: PriceOffer,
  { containerVaries, plantSizeVaries }: OfferFieldFlags,
  multiOffer: boolean,
) {
  const container = trimPart(offer.container)
  const plantSize = trimPart(offer.plantSize)

  if (!multiOffer) {
    const parts = [container, plantSize].filter(Boolean)
    return parts.length > 0 ? parts.join(' · ') : offer.available === false ? 'Нет в наличии' : '1 шт'
  }

  const parts: string[] = []

  if (containerVaries && container) {
    parts.push(container)
  }

  if (plantSizeVaries && plantSize) {
    parts.push(plantSize)
  }

  if (parts.length > 0) {
    return parts.join(' · ')
  }

  const fallback = [container, plantSize].filter(Boolean).join(' · ')
  if (fallback) {
    return fallback
  }

  return offer.available === false ? 'Нет в наличии' : '1 шт'
}

export function buildOfferSizes(
  product: Pick<PriceCatalogProduct, 'priceRubles' | 'offers'> & {
    offers: PriceOffer[]
  },
): ProductOfferSize[] {
  const offers = pricedOffers(product.offers)

  if (offers.length === 0) {
    if (product.priceRubles == null) {
      return []
    }

    return [
      {
        id: 'default',
        label: '1 шт',
        priceRubles: product.priceRubles,
        hint: 'Базовая позиция',
        available: true,
      },
    ]
  }

  const flags = analyzeOfferFields(offers)
  const multiOffer = offers.length > 1
  const seen = new Set<string>()
  const sizes: ProductOfferSize[] = []

  for (const [index, offer] of offers.entries()) {
    const label = offerLabel(offer, flags, multiOffer)
    const key = `${label.toLowerCase()}|${offer.available === false ? 'out' : 'in'}`

    if (seen.has(key)) {
      continue
    }

    seen.add(key)
    sizes.push({
      id: `offer-${index}`,
      label,
      priceRubles: offer.priceRubles!,
      hint:
        trimPart(offer.plantSize) ||
        trimPart(offer.container) ||
        (offer.available === false ? 'Нет в наличии' : 'Вариант из прайса'),
      available: offer.available !== false,
    })
  }

  return sizes
}

/** Hide specs that only duplicate the variant picker criterion. */
export function specsWithoutVariantAxes(
  specs: readonly ProductSpec[],
  offers: readonly PriceOffer[],
): ProductSpec[] {
  const priced = pricedOffers(offers)

  if (priced.length < 2) {
    return [...specs]
  }

  const flags = analyzeOfferFields(priced)
  const hidden = new Set<string>()

  if (flags.plantSizeVaries) {
    hidden.add('Размер')
  }

  if (flags.containerVaries) {
    hidden.add('Контейнер')
  }

  if (hidden.size === 0) {
    return [...specs]
  }

  return specs.filter((spec) => !hidden.has(spec.label))
}

export function availableOfferSizes(sizes: readonly ProductOfferSize[]) {
  return sizes.filter((size) => size.available)
}

export function offerSizesHaveChoices(sizes: readonly ProductOfferSize[]) {
  return availableOfferSizes(sizes).length > 1
}

export function firstAvailableSizeId(sizes: readonly ProductOfferSize[]) {
  return sizes.find((size) => size.available)?.id ?? sizes[0]?.id
}

export function minOfferPrice(sizes: readonly ProductOfferSize[], fallback = 0) {
  if (sizes.length === 0) {
    return fallback
  }

  const inStock = availableOfferSizes(sizes)
  const source = inStock.length > 0 ? inStock : sizes

  return Math.min(...source.map((size) => size.priceRubles))
}

export function offerPricesVary(sizes: readonly ProductOfferSize[]) {
  const inStock = availableOfferSizes(sizes)
  const source = inStock.length > 0 ? inStock : sizes

  if (source.length < 2) {
    return false
  }

  const first = source[0]?.priceRubles
  return source.some((size) => size.priceRubles !== first)
}
