'use client'

import { useHomeProducts } from '@/hooks/use-home-endpoint'
import type { homeProductQueries } from '@/lib/catalog/home-queries'
import type { CatalogPage } from '@/types/catalog'
import { HomeProductCard } from './product-card'

const sections = {
  arrivals: {
    id: 'new-arrivals',
    title: 'New Arrivals',
    empty:
      'Our next pieces are on their way. Explore FM LUXE while we prepare the collection.',
  },
  necklaces: {
    id: 'featured-necklaces',
    title: 'Featured Necklaces',
    empty: 'Featured necklaces will appear here soon.',
  },
  featured: {
    id: 'featured-products',
    title: 'Featured Products',
    empty: 'Featured products will appear here soon.',
  },
}

export function HomeProductSection({
  section,
  initial,
}: {
  section: keyof typeof homeProductQueries
  initial?: CatalogPage
}) {
  const { data } = useHomeProducts(section, initial)
  const products = data?.data
  const { id, title, empty } = sections[section]

  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className='flex scroll-mt-[106px] flex-col gap-8 px-6 py-8 md:gap-12 md:py-12'
    >
      <h2
        id={`${id}-title`}
        className='text-[28px] font-semibold leading-[1.4] md:text-[34px]'
      >
        {title}
      </h2>
      {!!products?.items.length && (
        <div className='grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4'>
          {products.items.map((product) => (
            <HomeProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
      {products && !products.items.length && (
        <p className='px-6 py-8 text-sm text-gray-600'>{empty}</p>
      )}
    </section>
  )
}
