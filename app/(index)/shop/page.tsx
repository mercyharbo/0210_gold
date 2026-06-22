import { ShopContent, ShopHero } from '@/components/index/shop'
import {
  getStorefrontCategories,
  getStorefrontProducts,
} from '@/lib/products/storefront-products'

type ShopPageProps = {
  searchParams: Promise<{ q?: string | string[] }>
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const queryParams = await searchParams
  const initialQuery = Array.isArray(queryParams.q)
    ? queryParams.q[0] ?? ''
    : queryParams.q ?? ''
  const products = await getStorefrontProducts()
  const categories = getStorefrontCategories(products)

  return (
    <div className='bg-white text-black'>
      <ShopHero />
      <ShopContent
        categories={categories}
        initialQuery={initialQuery}
        products={products}
      />
    </div>
  )
}
