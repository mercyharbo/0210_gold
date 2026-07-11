import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getStorefrontProducts } from '@/lib/products/storefront-products'
import { ProductGrid } from '@/components/index/shop/product-grid'

export async function FeaturedProducts() {
  const products = await getStorefrontProducts()
  const featuredProducts = products.slice(0, 8)

  if (featuredProducts.length === 0) {
    return null
  }

  return (
    <section className='bg-white text-black border-t border-black/5'>
      <div className='mx-auto flex w-full flex-col gap-10 px-5 py-16 sm:px-8 lg:px-12 lg:py-20'>
        <div className='flex flex-col gap-6 md:flex-row md:items-end md:justify-between'>
          <div className='max-w-2xl'>
            <p className='text-sm font-medium text-muted-foreground'>
              New arrivals
            </p>
            <h2 className='font-heading text-4xl font-bold leading-tight sm:text-5xl'>
              Crafted for every moment, styled for you
            </h2>
          </div>

          <Link
            href='/shop'
            className='inline-flex h-11 w-fit items-center border-b border-black text-sm font-medium text-black transition-opacity hover:opacity-65'
          >
            View all products
          </Link>
        </div>

        <ProductGrid products={featuredProducts} />

        <div className='mt-4 flex justify-center md:hidden'>
          <Link
            href='/shop'
            className='inline-flex h-12 w-full items-center justify-center gap-4 bg-black px-7 text-sm font-medium text-white transition-colors hover:bg-black/82 sm:w-auto'
          >
            Shop the collection
            <ArrowRight className='size-4 stroke-[1.8]' />
          </Link>
        </div>
      </div>
    </section>
  )
}
