'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useTransition } from 'react'

import { HomeProductCard } from '@/components/home/product-card'
import { ApiFeedback } from '@/components/ui/api-feedback'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCatalogProducts } from '@/hooks/use-catalog-endpoint'
import { catalogPageCopy } from '@/lib/catalog/browse-copy'
import {
  browseHref,
  catalogSortOptions,
  clearBrowseFilters,
  type BrowsePath,
  type BrowseQuery,
} from '@/lib/catalog/browse-query'
import { useStoreCatalog } from '@/stores/hooks/use-store-catalog'
import type { CatalogCategory, CatalogPage } from '@/types/catalog'

import { CatalogFilters } from './filters'
import { CatalogPagination } from './pagination'

export function CatalogBrowse({
  serverProductResults,
  categories,
  query,
  catalogPath,
  productsLoadError,
  categoriesLoadError,
}: {
  serverProductResults?: CatalogPage
  categories: CatalogCategory[]
  query: BrowseQuery
  catalogPath: BrowsePath
  productsLoadError?: string
  categoriesLoadError?: string
}) {
  const router = useRouter()
  const [isNavigating, startTransition] = useTransition()
  const { reset } = useStoreCatalog()

  const productQueryString = new URLSearchParams(query).toString()
  const {
    data: productsResponse,
    error: productsError,
    isLoading,
    isValidating,
    mutate,
  } = useCatalogProducts(productQueryString, serverProductResults)

  // Render server-loaded products immediately; SWR owns subsequent refreshes.
  const productResults = productsResponse?.data ?? serverProductResults
  const isUpdatingProducts = isNavigating || isValidating
  const { heading, description } = catalogPageCopy[catalogPath]

  useEffect(() => {
    reset()
  }, [catalogPath, productQueryString, reset])

  function handleNavigateCatalog(values: BrowseQuery) {
    startTransition(() => {
      router.push(browseHref(catalogPath, values))
    })
  }

  return (
    <section className='flex w-full flex-col gap-12 px-6 pb-12 pt-10 md:gap-16'>
      <div className='flex flex-col gap-4'>
        <h1 className='text-2xl font-semibold leading-[1.4] md:text-4xl'>
          {heading}
        </h1>

        <p className='max-w-[520px] text-sm leading-[1.6]'>
          {description}
        </p>
      </div>

      <div className='flex min-w-0 flex-col gap-6' aria-busy={isUpdatingProducts}>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <Select
            value={query.sort}
            disabled={isUpdatingProducts}
            onValueChange={(sort) =>
              handleNavigateCatalog({ ...query, sort, page: '1' })
            }
          >
            <SelectTrigger
              aria-label='Sort products'
              className='gap-2 rounded-none border-0 px-0 text-base font-medium shadow-none focus-visible:ring-0'
            >
              <span>
                Sorted by <SelectValue />
              </span>
            </SelectTrigger>

            <SelectContent>
              {catalogSortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <CatalogFilters
            query={query}
            categories={categories}
            categoriesLoadError={categoriesLoadError}
            busy={isUpdatingProducts}
            onApply={handleNavigateCatalog}
          />
        </div>


        <ApiFeedback
          message={productsError?.message || (!productResults ? productsLoadError : undefined)}
          error
          onRetry={() => { void mutate() }}
          isRetrying={isValidating}
        />

        {isLoading && !productResults && (
          <p role='status' className='text-sm'>
            Loading...
          </p>
        )}

        {productResults && (
          <>
            {!!productResults.items.length && (
              <div className='flex flex-col gap-6'>
                <h2 className='sr-only'>Products</h2>

                <div className='grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-2 lg:grid-cols-4'>
                  {productResults.items.map((product) => (
                    <HomeProductCard
                      key={product.id}
                      product={product}
                      imageSizes='(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 25vw'
                    />
                  ))}
                </div>
              </div>
            )}

            {!productResults.items.length && (
              <div className='flex flex-col items-start gap-4 py-12'>
                <h2 className='text-xl font-medium'>No pieces to show yet</h2>
                <p className='text-sm text-gray-600'>
                  Try another search or visit again as our collection grows.
                </p>

                {(query.q || query.category) && (
                  <Button
                    variant='link'
                    className='h-auto p-0 text-black'
                    onClick={() => handleNavigateCatalog(clearBrowseFilters(query))}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            )}

            <CatalogPagination
              productResults={productResults}
              isUpdatingProducts={isUpdatingProducts}
              onPageChange={(pageNumber) => handleNavigateCatalog({ ...query, page: String(pageNumber) })}
            />
          </>
        )}
      </div>
    </section>
  )
}
