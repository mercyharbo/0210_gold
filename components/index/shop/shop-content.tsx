'use client'

import { useMemo, useState } from 'react'
import { ProductGrid } from './product-grid'
import { categories, products, type ProductCategory } from './shop-data'
import { ShopControls } from './shop-controls'

export function ShopContent() {
  const [activeCategory, setActiveCategory] = useState<'All' | ProductCategory>(
    'All',
  )
  const [query, setQuery] = useState('')
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
      if (sort === 'price-low') return first.price - second.price
      if (sort === 'price-high') return second.price - first.price
      if (sort === 'newest') return second.id.localeCompare(first.id)

      return 0
    })
  }, [activeCategory, query, sort])

  return (
    <section>
      <div className='mx-auto w-full px-5 py-16 sm:px-8 lg:px-12 lg:py-20'>
        <div className='mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
          <div>
            <p className='mb-3 text-sm font-medium uppercase text-black/50'>
              Browse
            </p>
            <h2 className='font-heading text-4xl font-bold leading-tight sm:text-5xl'>
              Shop the edit
            </h2>
          </div>
          <p className='text-sm text-black/55'>
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

        <div className='mt-8'>
          <ProductGrid products={filteredProducts} />
        </div>
      </div>
    </section>
  )
}
