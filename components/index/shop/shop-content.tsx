'use client'

import { useMemo, useState } from 'react'
import type { Product } from './shop-data'
import { ProductGrid } from './product-grid'
import { ShopControls } from './shop-controls'

type ShopContentProps = {
  categories: string[]
  initialQuery?: string
  products: Product[]
}

export function ShopContent({
  categories,
  initialQuery = '',
  products,
}: ShopContentProps) {
  const [activeCategory, setActiveCategory] = useState('All')
  const [query, setQuery] = useState(initialQuery)
  const [sort, setSort] = useState('featured')

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    const nextProducts = products.filter((product) => {
      const matchesCategory =
        activeCategory === 'All' || product.category === activeCategory
      const matchesQuery =
        !normalizedQuery ||
        [product.name, product.category, product.label ?? '']
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery)

      return matchesCategory && matchesQuery
    })

    return [...nextProducts].sort((first, second) => {
      const firstPrice = first.price ?? Number.MAX_SAFE_INTEGER
      const secondPrice = second.price ?? Number.MAX_SAFE_INTEGER

      if (sort === 'price-low') return firstPrice - secondPrice
      if (sort === 'price-high') return secondPrice - firstPrice
      if (sort === 'newest') {
        return second.createdAt.localeCompare(first.createdAt)
      }

      return 0
    })
  }, [activeCategory, products, query, sort])

  return (
    <section>
      <div className='mx-auto w-full px-5 py-16 sm:px-8 lg:px-12 lg:py-20'>
        <div className='flex flex-col gap-8'>
          <div className='flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
            <div className='flex flex-col gap-3'>
              <p className='text-sm font-medium uppercase text-muted-foreground'>
              Browse
              </p>
              <h2 className='font-heading text-4xl font-bold leading-tight sm:text-5xl'>
                Shop the edit
              </h2>
            </div>
            <p className='text-sm text-muted-foreground'>
              {filteredProducts.length} item
              {filteredProducts.length === 1 ? '' : 's'}
            </p>
          </div>

          <ShopControls
            activeCategory={activeCategory}
            categories={categories}
            onCategoryChange={setActiveCategory}
            onQueryChange={setQuery}
            onSortChange={setSort}
            query={query}
            sort={sort}
          />

          <ProductGrid products={filteredProducts} />
        </div>
      </div>
    </section>
  )
}
