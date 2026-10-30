import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CatalogProductDetail } from '@/components/catalog/product-detail'
import { CatalogReadError, readCatalog } from '@/lib/catalog/server'
import type { CatalogProduct } from '@/types/catalog'

async function getProduct(slug: string) {
  try {
    return await readCatalog<CatalogProduct>(`products/${encodeURIComponent(slug)}`)
  } catch (error) {
    if (error instanceof CatalogReadError && error.status === 404) notFound()
    throw error
  }
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const product = await getProduct((await params).slug)
  return {
    title: `${product.name} | FM LUXE`,
    description: product.description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images.map((image) => ({ url: image.url, alt: image.alt })),
    },
  }
}
export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const product = await getProduct((await params).slug)
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images.map((image) => image.url),
    description: product.description,
    sku: product.id,
    brand: { '@type': 'Brand', name: 'FM LUXE' },
    ...(product.display_price.available && product.display_price.amount !== null
      ? {
          offers: {
            '@type': 'Offer',
            priceCurrency: 'NGN',
            price: product.display_price.amount,
            availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          },
        }
      : {}),
  }
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }}
      />
      <CatalogProductDetail product={product} />
    </>
  )
}
