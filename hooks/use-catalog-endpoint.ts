'use client'

import { useApiRead } from './use-api-read'
import type { CatalogCategory, CatalogPage, CatalogPrice, CatalogRate, CatalogSettings } from '@/types/catalog'

export function useCatalogProducts(query: string, initial?: CatalogPage) {
  return useApiRead<CatalogPage>(`/api/catalog/products?${query}`, { initialData: initial, shouldRetryOnError: false })
}

export function useCatalogCategories() {
  return useApiRead<CatalogCategory[]>('/api/catalog/categories', { shouldRetryOnError: false })
}

export function useCatalogSettings() {
  return useApiRead<CatalogSettings>('/api/catalog/settings', { shouldRetryOnError: false })
}

export function useCatalogRates() {
  return useApiRead<CatalogRate[]>('/api/catalog/gold-rates', { shouldRetryOnError: false })
}

export function useCatalogPrice(slug: string, karat: string | null) {
  const query = karat ? `?karat=${encodeURIComponent(karat)}` : ''
  return useApiRead<CatalogPrice>(`/api/catalog/products/${encodeURIComponent(slug)}/price${query}`, { shouldRetryOnError: false })
}
