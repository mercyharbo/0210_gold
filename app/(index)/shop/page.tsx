import type { Metadata } from 'next'
import { ShopContent, ShopHero } from '@/components/index/shop'
import {
  getStorefrontCategories,
  getStorefrontProducts,
} from '@/lib/products/storefront-products'

export const metadata: Metadata = {
  title: 'Shop Gold Jewellery & Accessories',
  description:
    'Browse our curated collection of authentic 18k gold jewellery, gold necklaces, rings, earrings, bracelets, and luxury fashion accessories at FM LUXE.',
  alternates: {
    canonical: '/shop',
  },
  openGraph: {
    title: 'Shop Gold Jewellery & Luxury Accessories | FM LUXE',
    description:
      'Browse our curated collection of authentic 18k gold jewellery, gold necklaces, rings, earrings, bracelets, and luxury fashion accessories.',
    url: '/shop',
  },
}

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
