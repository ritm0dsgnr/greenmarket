import { redirect } from 'next/navigation'
import { listProductIds } from '@/catalog'

export default function ProductPage() {
  const firstId = listProductIds()[0]

  if (!firstId) {
    redirect('/catalog')
  }

  redirect(`/product/${firstId}`)
}
