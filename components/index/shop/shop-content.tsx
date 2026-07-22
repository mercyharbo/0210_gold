'use client'

import { useMemo, useState } from 'react'

import { ProductGrid } from './product-grid'
import { ShopControls } from './shop-controls'
import { ShopPagination } from './shop-pagination'
import type { Product } from './shop-data'

type ShopContentProps = {
  categories: string[]
  initialCategorySlug?: string
  initialQuery?: string
  initialSort?: string
  products: Product[]
}

const ITEMS_PER_PAGE = 12
const sortOptions = ['featured', 'newest', 'price-low', 'price-high'] as const

function getInitialSort(sort: string) {
  return sortOptions.includes(sort as (typeof sortOptions)[number])
    ? sort
    : 'featured'
}

export function ShopContent({
  categories,
  initialCategorySlug = '',
  initialQuery = '',
  initialSort = '',
  products,
}: ShopContentProps) {
  const initialCategory = useMemo(() => {
    if (!initialCategorySlug) {
      return 'All'
    }

    return (
      products.find((product) => product.categorySlug === initialCategorySlug)
        ?.category ?? 'All'
    )
  }, [initialCategorySlug, products])

  const [activeCategory, setActiveCategory] = useState(initialCategory)
  const [query, setQuery] = useState(initialQuery)
  const [sort, setSort] = useState(getInitialSort(initialSort))
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [selectedMaterial, setSelectedMaterial] = useState('All Materials')
  const [currentPage, setCurrentPage] = useState(1)

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat)
    setCurrentPage(1)
  }

  const handleQueryChange = (q: string) => {
    setQuery(q)
    setCurrentPage(1)
  }

  const handleSortChange = (s: string) => {
    setSort(s)
    setCurrentPage(1)
  }

  const handleMinPriceChange = (val: string) => {
    setMinPrice(val)
    setCurrentPage(1)
  }

  const handleMaxPriceChange = (val: string) => {
    setMaxPrice(val)
    setCurrentPage(1)
  }

  const handleMaterialChange = (val: string) => {
    setSelectedMaterial(val)
    setCurrentPage(1)
  }

  const handleResetFilters = () => {
    setActiveCategory('All')
    setQuery('')
    setSort('featured')
    setMinPrice('')
    setMaxPrice('')
    setSelectedMaterial('All Materials')
    setCurrentPage(1)
  }

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const minP = minPrice ? parseFloat(minPrice) : 0
    const maxP = maxPrice ? parseFloat(maxPrice) : Number.MAX_SAFE_INTEGER

    const nextProducts = products.filter((product) => {
      const matchesCategory =
        activeCategory === 'All' || product.category === activeCategory

      const matchesQuery =
        !normalizedQuery ||
        [product.name, product.category, product.label ?? '']
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery)

      const price = product.price ?? 0
      const matchesPrice = price >= minP && price <= maxP

      const matchesMaterial =
        selectedMaterial === 'All Materials' ||
        [product.name, product.category, product.label ?? '']
          .join(' ')
          .toLowerCase()
          .includes(selectedMaterial.toLowerCase().replace('luxury ', ''))

      return matchesCategory && matchesQuery && matchesPrice && matchesMaterial
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
  }, [activeCategory, maxPrice, minPrice, products, query, selectedMaterial, sort])

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE)
  }, [currentPage, filteredProducts])

  return (
    <section>
      <div className='mx-auto w-full px-5 py-12 sm:px-8 lg:px-12 lg:py-16'>
        <div className='flex flex-col gap-8'>
          <div className='flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
            <div className='flex flex-col gap-2'>
              <p className='text-xs font-semibold uppercase tracking-wider text-gold'>
                Storefront Collection
              </p>
              <h2 className='font-heading text-4xl font-bold leading-tight sm:text-5xl'>
                Shop the edit
              </h2>
            </div>
            <p className='text-xs font-mono font-semibold text-muted-foreground'>
              Showing {paginatedProducts.length} of {filteredProducts.length} item
              {filteredProducts.length === 1 ? '' : 's'}
            </p>
          </div>

          <ShopControls
            activeCategory={activeCategory}
            categories={categories}
            onCategoryChange={handleCategoryChange}
            onQueryChange={handleQueryChange}
            onSortChange={handleSortChange}
            query={query}
            sort={sort}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onMinPriceChange={handleMinPriceChange}
            onMaxPriceChange={handleMaxPriceChange}
            selectedMaterial={selectedMaterial}
            onMaterialChange={handleMaterialChange}
            onResetFilters={handleResetFilters}
          />

          {paginatedProducts.length === 0 ? (
            <div className='py-16 text-center border border-black/10 p-8 space-y-3 bg-neutral-50'>
              <h3 className='font-heading text-2xl font-bold'>No items match your filters</h3>
              <p className='text-xs text-muted-foreground max-w-md mx-auto'>
                Try adjusting your price range, clearing search terms, or choosing a different category.
              </p>
              <button
                onClick={handleResetFilters}
                className='h-10 px-6 bg-black text-white text-xs font-semibold uppercase tracking-wider hover:bg-gold hover:text-black transition-colors'
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <ProductGrid products={paginatedProducts} />
              <ShopPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredProducts.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={(page) => {
                  setCurrentPage(page)
                  window.scrollTo({ top: 300, behavior: 'smooth' })
                }}
              />
            </>
          )}
        </div>
      </div>
    </section>
  )
}
