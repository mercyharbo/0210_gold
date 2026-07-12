import type { Product as StorefrontProduct } from '@/components/index/shop/shop-data'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { AdminProductListItem } from '@/types/product'

function mapStorefrontProduct(product: AdminProductListItem): StorefrontProduct {
  const imageUrls =
    Array.isArray(product.image_urls) && product.image_urls.length > 0
      ? product.image_urls
      : [product.image_src]

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category?.name ?? 'uncategorized',
    categorySlug: product.category?.slug ?? null,
    colors: product.colors,
    createdAt: product.created_at,
    details: product.details,
    description: product.description,
    imageAlt: product.image_alt,
    imageSrc: imageUrls[0] ?? product.image_src,
    imageUrls,
    label: product.label,
    price: product.price,
    pricingType: product.pricing_type,
    sizes: product.sizes,
    stock: product.stock,
  }
}

function getProductsQuery() {
  return `
    *,
    category:categories (
      name,
      slug
    )
  `
}

export async function getStorefrontProducts() {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('products')
    .select(getProductsQuery())
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .returns<AdminProductListItem[]>()

  if (error) {
    console.error('storefront products read failed:', {
      code: error.code,
      message: error.message,
    })

    return []
  }

  return (data ?? []).map(mapStorefrontProduct)
}

export async function getStorefrontProductBySlug(slug: string) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('products')
    .select(getProductsQuery())
    .eq('slug', slug)
    .eq('status', 'active')
    .returns<AdminProductListItem[]>()
    .single()

  if (error) {
    console.error('storefront product read failed:', {
      code: error.code,
      message: error.message,
      slug,
    })

    return null
  }

  return mapStorefrontProduct(data)
}

export async function getRelatedStorefrontProducts(product: StorefrontProduct) {
  const products = await getStorefrontProducts()

  return products
    .filter(
      (nextProduct) =>
        nextProduct.id !== product.id &&
        nextProduct.categorySlug === product.categorySlug,
    )
    .slice(0, 4)
}

export function getStorefrontCategories(products: StorefrontProduct[]) {
  return [
    'All',
    ...Array.from(new Set(products.map((product) => product.category))),
  ]
}

export async function getStorefrontWishlist(userId: string) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('wishlists')
    .select(`
      id,
      product:products (
        *,
        category:categories (
          name,
          slug
        )
      )
    `)
    .eq('user_id', userId)

  if (error) {
    console.error('Failed to load wishlist:', error)
    return []
  }

  return (data ?? [])
    .filter((item: any) => item.product !== null)
    .map((item: any) => ({
      wishlistId: item.id,
      product: mapStorefrontProduct(item.product)
    }))
}
