'use client'

import { useApiRead } from './use-api-read'
import type { CatalogBanner, CatalogCategory, CatalogPage, CatalogSettings } from '@/types/catalog'
import { homeProductQueries } from '@/lib/catalog/home-queries'

export function useHomeBanners(initial?: CatalogBanner[]) {
  return useApiRead<CatalogBanner[]>('/api/catalog/banners', { initialData: initial, shouldRetryOnError: false })
}

export function useHomeCollections(initial?: CatalogCategory[]) {
  return useApiRead<CatalogCategory[]>('/api/catalog/categories', { initialData: initial, shouldRetryOnError: false })
}

export function useHomeProducts(initial?: CatalogPage) {
  return useApiRead<CatalogPage>(`/api/catalog/${homeProductQueries.arrivals}`, {
    initialData: initial, shouldRetryOnError: false,
  })
}

export function useHomeFeaturedNecklaces(initial?: CatalogPage) {
  return useApiRead<CatalogPage>(`/api/catalog/${homeProductQueries.necklaces}`, {
    initialData: initial, shouldRetryOnError: false,
  })
}

export function useHomeFeaturedProducts(initial?: CatalogPage) {
  return useApiRead<CatalogPage>(`/api/catalog/${homeProductQueries.featured}`, {
    initialData: initial, shouldRetryOnError: false,
  })
}

export function useStoreSettings(initial?: CatalogSettings) {
  return useApiRead<CatalogSettings>('/api/catalog/settings', { initialData: initial, shouldRetryOnError: false })
}
