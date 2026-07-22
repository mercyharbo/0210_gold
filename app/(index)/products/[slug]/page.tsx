import { notFound } from 'next/navigation'

import { ProductDetailView } from '@/components/index/product-details'
import {
  getRelatedStorefrontProducts,
  getStorefrontProductBySlug,
} from '@/lib/products/storefront-products'
import { getApprovedProductReviews } from '@/lib/reviews/storefront-reviews'
import { createSupabaseServerClient } from '@/lib/supabase/server'

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

  return (
    <ProductDetailView
      product={product}
      relatedProducts={relatedProducts}
      initiallyWishlisted={initiallyWishlisted}
      approvedReviews={approvedReviews}
    />
  )
}
