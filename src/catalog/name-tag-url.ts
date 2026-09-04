import { slugify } from '../import/greenmarket-price/slugify'
import { getCategoryBySlug, getSubcategory } from './generated-price-catalog'

export const listingPromoTags = ['new', 'sale', 'hit'] as const

export type ListingPromoTag = (typeof listingPromoTags)[number]

export function categoryListingPath(categorySlug: string) {
  return `/catalog/${categorySlug}`
}

export function subcategoryListingPath(categorySlug: string, subcategorySlug: string) {
  return `/catalog/${categorySlug}/${subcategorySlug}`
}

export function isListingPromoTag(value: string): value is ListingPromoTag {
  return (listingPromoTags as readonly string[]).includes(value)
}

export function resolveNameTagLabel(
  nameTags: readonly string[],
  nameTagSlug: string,
): string | null {
  const normalized = nameTagSlug.trim().toLowerCase()

  if (!normalized) {
    return null
  }

  return nameTags.find((label) => slugify(label) === normalized) ?? null
}

function splitQueryValues(raw: string | string[] | undefined) {
  const chunks = Array.isArray(raw) ? raw : raw ? [raw] : []

  return chunks.flatMap((chunk) => chunk.split(',')).map((part) => part.trim()).filter(Boolean)
}

export function parseNameTagQuery(
  availableLabels: readonly string[],
  raw: string | string[] | undefined,
): string[] {
  const labels: string[] = []

  for (const part of splitQueryValues(raw)) {
    const label = resolveNameTagLabel(availableLabels, part)

    if (label && !labels.includes(label)) {
      labels.push(label)
    }
  }

  return labels
}

export function parsePromoTagQuery(raw: string | string[] | undefined): ListingPromoTag[] {
  const tags: ListingPromoTag[] = []

  for (const part of splitQueryValues(raw)) {
    const normalized = part.toLowerCase()

    if (isListingPromoTag(normalized) && !tags.includes(normalized)) {
      tags.push(normalized)
    }
  }

  return tags
}

export function withListingTagQuery(
  listingPath: string,
  {
    nameTags = [],
    promoTags = [],
  }: {
    nameTags?: readonly string[]
    promoTags?: readonly ListingPromoTag[]
  },
) {
  if (nameTags.length === 0 && promoTags.length === 0) {
    return listingPath
  }

  const params = new URLSearchParams()
  const sortedPromo = [...promoTags].sort((left, right) => left.localeCompare(right))
  const sortedName = [...nameTags].sort((left, right) => slugify(left).localeCompare(slugify(right)))

  for (const promo of sortedPromo) {
    params.append('promo', promo)
  }

  for (const tag of sortedName) {
    params.append('tag', slugify(tag))
  }

  return `${listingPath}?${params.toString()}`
}

/** @deprecated Prefer withListingTagQuery — kept name for existing call sites */
export function withNameTagQuery(listingPath: string, nameTags: readonly string[]) {
  return withListingTagQuery(listingPath, { nameTags })
}

export function nameTagListingPath(
  categorySlug: string,
  subcategorySlug: string,
  nameTags: string | readonly string[],
) {
  const tags = typeof nameTags === 'string' ? [nameTags] : nameTags

  return withListingTagQuery(subcategoryListingPath(categorySlug, subcategorySlug), {
    nameTags: tags,
  })
}

export function promoTagListingPath(
  categorySlug: string,
  subcategorySlug: string,
  promoTags: ListingPromoTag | readonly ListingPromoTag[],
) {
  const tags = typeof promoTags === 'string' ? [promoTags] : promoTags

  return withListingTagQuery(subcategoryListingPath(categorySlug, subcategorySlug), {
    promoTags: tags,
  })
}

function collectNameTags(products: Array<{ nameTag?: string }>) {
  const labels = new Set<string>()

  for (const product of products) {
    const tag = product.nameTag?.trim()

    if (tag) {
      labels.add(tag)
    }
  }

  return [...labels].sort((left, right) => left.localeCompare(right, 'ru'))
}

export function listSubcategoryNameTags(
  categorySlug: string,
  subcategorySlug: string,
): string[] {
  const match = getSubcategory(categorySlug, subcategorySlug)

  if (!match) {
    return []
  }

  return collectNameTags(match.subcategory.products)
}

export function listCategoryNameTags(categorySlug: string): string[] {
  const category = getCategoryBySlug(categorySlug)

  if (!category) {
    return []
  }

  return collectNameTags(category.subcategories.flatMap((subcategory) => subcategory.products))
}
