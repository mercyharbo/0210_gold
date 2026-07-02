import Link from 'next/link'

import { getFeaturedCategories } from '@/lib/categories/storefront-categories'
import { FeaturedCollectionsCarousel } from './featured-collections-carousel'

export async function FeaturedCollections() {
  const categories = await getFeaturedCategories()

  if (categories.length === 0) {
    return null
  }

  const collections = categories.map((category) => ({
    title: category.name,
    description: category.description ?? '',
    href: `/shop?category=${encodeURIComponent(category.slug)}`,
    imageAlt: category.image_alt ?? category.name,
    imageSrc: category.image_src ?? '',
    meta: category.category_type,
  }))

  return (
    <section className='bg-white text-black'>
      <div className='mx-auto flex w-full flex-col gap-8 px-5 py-16 sm:px-8 lg:px-12 lg:py-20 lg:gap-8'>
        <div className='flex flex-col gap-6 md:flex-row md:items-end md:justify-between'>
          <div className='max-w-2xl'>
            <p className='text-sm font-medium text-muted-foreground'>
              Featured collections
            </p>
            <h2 className='font-heading text-4xl font-bold leading-tight sm:text-5xl'>
              Fashion, gold, and the pieces that finish the look
            </h2>
          </div>

          <Link
            href='/categories'
            className='inline-flex h-11 w-fit items-center border-b border-black text-sm font-medium text-black transition-opacity hover:opacity-65'
          >
            View all collections
          </Link>
        </div>

        <FeaturedCollectionsCarousel collections={collections} />
      </div>
    </section>
  )
}
