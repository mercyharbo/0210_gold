'use client'

import { useHomeFeaturedNecklaces, useHomeFeaturedProducts } from '@/hooks/use-home-endpoint'
import type { CatalogPage } from '@/types/catalog'
import { HomeProductSection } from './product-section'

export function FeaturedNecklaces({ initial }: { initial?: CatalogPage }) {
  const { data, error, isLoading, mutate } = useHomeFeaturedNecklaces(initial)
  return <HomeProductSection id='featured-necklaces' title='Featured Necklaces'
    products={data?.data} error={error} isLoading={isLoading} handleRetry={() => { void mutate() }}
    emptyMessage='Featured necklaces will appear here soon.' />
}

export function FeaturedProducts({ initial }: { initial?: CatalogPage }) {
  const { data, error, isLoading, mutate } = useHomeFeaturedProducts(initial)
  return <HomeProductSection id='featured-products' title='Featured Products'
    products={data?.data} error={error} isLoading={isLoading} handleRetry={() => { void mutate() }}
    emptyMessage='Featured products will appear here soon.' />
}
