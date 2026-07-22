import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ProductDetailView } from '@/components/index/product-details'
import {
  getRelatedStorefrontProducts,
  getStorefrontProductBySlug,
} from '@/lib/products/storefront-products'
import { getApprovedProductReviews } from '@/lib/reviews/storefront-reviews'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getStorefrontProductBySlug(slug)

  if (!product) {
    return {
      title: 'Product Not Found | FM LUXE',
    }
  }

  const siteUrl = process.env.SITE_URL ?? 'https://fm-luxe.vercel.app'
  const imageUrl = product.imageSrc || `${siteUrl}/og-image.png`
  const description =
    product.description ||
    `Shop ${product.name} at FM LUXE. Authentic gold jewellery and luxury fashion accessories.`

  return {
    title: `${product.name} | Premium Gold Jewellery`,
    description,
    alternates: {
      canonical: `/products/${product.slug}`,
    },
    openGraph: {
      title: `${product.name} | FM LUXE`,
      description,
      url: `/products/${product.slug}`,
      siteName: 'FM LUXE',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | FM LUXE`,
      description,
      images: [imageUrl],
    },
  }
}

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
  const approvedReviews = await getApprovedProductReviews(product.id)

  // Check wishlist status if user is logged in
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let initiallyWishlisted = false
  if (user) {
    const { data: existing } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', product.id)
      .maybeSingle()
    initiallyWishlisted = !!existing
  }

  const siteUrl = process.env.SITE_URL ?? 'https://fm-luxe.vercel.app'
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.imageUrls || [product.imageSrc],
    description: product.description || `Buy ${product.name} at FM LUXE`,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: 'FM LUXE',
    },
    offers: {
      '@type': 'Offer',
      url: `${siteUrl}/products/${product.slug}`,
      priceCurrency: 'NGN',
      price: product.price,
      availability:
        (product.stock ?? 0) > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  }

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd),
        }}
      />
      <ProductDetailView
        product={product}
        relatedProducts={relatedProducts}
        initiallyWishlisted={initiallyWishlisted}
        approvedReviews={approvedReviews}
      />
    </>
  )
}
