import { ProductDetailView } from '@/components/index/product-details'
import { getProductById, products } from '@/components/index/shop/shop-data'
import { notFound } from 'next/navigation'

export function generateStaticParams() {
  return products.map((product) => ({
    slug: product.id,
  }))
}

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = getProductById(slug)

  if (!product) {
    notFound()
  }

  return <ProductDetailView product={product} />
}
