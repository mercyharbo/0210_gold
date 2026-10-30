'use client'
import useSWR from 'swr'
import { apiFetcher } from '@/lib/api/client'
import type { ApiResponse } from '@/lib/api/types'
import type {
  CatalogBanner,
  CatalogCategory,
  CatalogPage,
  CatalogPrice,
  CatalogRate,
  CatalogSettings,
} from '@/types/catalog'

export function useCatalogRead<T>(endpoint: string | null, initial?: T) {
  return useSWR(endpoint, apiFetcher<T>, {
    fallbackData:
      initial === undefined
        ? undefined
        : ({ success: true, status: 200, data: initial } satisfies ApiResponse<T>),
    shouldRetryOnError: false,
  })
}
export function useCatalogProducts(query: string, initial?: CatalogPage) {
  return useCatalogRead<CatalogPage>(`/api/catalog/products?${query}`, initial)
}
export function useCatalogCategories(admin = false) {
  return useCatalogRead<CatalogCategory[]>(admin ? '/api/admin/categories' : '/api/catalog/categories')
}
export function useCatalogBanners() {
  return useCatalogRead<CatalogBanner[]>('/api/admin/banners')
}
export function useCatalogSettings() {
  return useCatalogRead<CatalogSettings>('/api/catalog/settings')
}
export function useCatalogRates() {
  return useCatalogRead<CatalogRate[]>('/api/catalog/gold-rates')
}
export function useCatalogPrice(slug: string, karat: string | null) {
  const query = karat ? `?karat=${encodeURIComponent(karat)}` : ''
  return useCatalogRead<CatalogPrice>(`/api/catalog/products/${encodeURIComponent(slug)}/price${query}`)
}
