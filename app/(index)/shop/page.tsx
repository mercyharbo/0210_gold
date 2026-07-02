import { ShopContent, ShopHero } from '@/components/index/shop'
import {
  getStorefrontCategories,
  getStorefrontProducts,
} from '@/lib/products/storefront-products'

type ShopPageProps = {
  searchParams: Promise<{
    category?: string | string[]
    q?: string | string[]
    sort?: string | string[]
  }>
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const queryParams = await searchParams
  const initialQuery = Array.isArray(queryParams.q)
    ? queryParams.q[0] ?? ''
    : queryParams.q ?? ''
  const initialSort = Array.isArray(queryParams.sort)
    ? queryParams.sort[0] ?? ''
    : queryParams.sort ?? ''
  const initialCategorySlug = Array.isArray(queryParams.category)
    ? queryParams.category[0] ?? ''
    : queryParams.category ?? ''
  const products = await getStorefrontProducts()
  const categories = getStorefrontCategories(products)

  return (
    <div className='bg-white text-black'>
      <ShopHero />
      <ShopContent
        categories={categories}
        initialCategorySlug={initialCategorySlug}
        initialQuery={initialQuery}
        initialSort={initialSort}
        products={products}
      />
    </div>
  )
}
