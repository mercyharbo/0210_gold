'use client'

import { useHomeProducts } from '@/hooks/use-home-endpoint'
import type { CatalogPage } from '@/types/catalog'
import { HomeProductSection } from './product-section'

export function NewArrivals({ initial }: { initial?: CatalogPage }) {
  const { data, error, isLoading, mutate } = useHomeProducts(initial)
  return <HomeProductSection id='new-arrivals' title='New Arrivals'
    products={data?.data} error={error} isLoading={isLoading} handleRetry={() => { void mutate() }}
    emptyMessage='Our next pieces are on their way. Explore FM LUXE while we prepare the collection.' />
}
