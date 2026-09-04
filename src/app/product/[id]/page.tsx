import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { ProductRelated } from '@/components/ProductRelated'
import { ProductView } from '@/components/ProductView'
import { getProductViewData, listProductIds } from '@/catalog'
import { siteBrand } from '@/components/siteContacts'

export function generateStaticParams() {
  return listProductIds().map((id) => ({ id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const product = getProductViewData(id)

  if (!product) {
    return { title: `Товар — ${siteBrand}` }
  }

  return {
    title: `${product.name} — ${siteBrand}`,
    description: `${product.name} садового центра ${siteBrand}.`,
  }
}

export default async function ProductByIdPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = getProductViewData(id)

  if (!product) {
    notFound()
  }

  return (
    <main className="page">
      <div className="container">
        <Breadcrumbs items={product.breadcrumbs} />
        <ProductView product={product} />
      </div>
      <ProductRelated cards={product.relatedCards} />
    </main>
  )
}
