import { ProductDetailView } from '@/components/index/product-details'
import {
  getRelatedStorefrontProducts,
  getStorefrontProductBySlug,
} from '@/lib/products/storefront-products'
import { notFound } from 'next/navigation'

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await getStorefrontProductBySlug(slug)

  if (!product) {
    notFound()
  }

  const relatedProducts = await getRelatedStorefrontProducts(product)

  return (
    <ProductDetailView product={product} relatedProducts={relatedProducts} />
  )
}
