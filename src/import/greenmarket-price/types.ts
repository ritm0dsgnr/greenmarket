import type { ProductSpec } from '@/components/productSpecs'
import type { ProductOfferSize } from './offer-sizes'

export type PriceOffer = {
  sourceRowNumber: number
  container?: string
  plantSize?: string
  availabilityRaw?: string
  available: boolean
  priceRubles?: number
}

export type PriceCatalogProduct = {
  id: string
  sourceRowNumber: number
  name: string
  nameTag?: string
  latin?: string
  description?: string
  tagLabel?: string
  available: boolean
  priceRubles?: number
  specs: ProductSpec[]
  offers: PriceOffer[]
}

export type PriceCatalogSubcategory = {
  slug: string
  label: string
  products: PriceCatalogProduct[]
}

export type PriceCatalogCategory = {
  slug: string
  label: string
  href: string
  subcategories: PriceCatalogSubcategory[]
}

export type PriceCatalogGroup = {
  title: string
  items: PriceCatalogCategory[]
}

export type PriceCatalogSnapshot = {
  sourceFile: string
  generatedAt: string
  sheetCount: number
  productCount: number
  groups: PriceCatalogGroup[]
  categories: PriceCatalogCategory[]
}

export type ProductCardFromPrice = {
  id: string
  tag: 'new' | 'sale' | 'hit' | null
  available: boolean
  name: string
  nameTag?: string
  latin?: string
  href?: string
  specs?: ProductSpec[]
  priceRubles?: number
  sizes?: ProductOfferSize[]
}