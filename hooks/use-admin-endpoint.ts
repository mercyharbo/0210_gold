'use client'

import { useApiRead } from './use-api-read'
import type { CatalogBanner, CatalogCategory, CatalogPage, CatalogProduct } from '@/types/catalog'
import type { IdentityProfile } from '@/types/identity'

export const adminCheckKey = '/api/admin/auth-check'

export function useAdminCheck(enabled: boolean) {
  return useApiRead<IdentityProfile>(enabled ? adminCheckKey : null, { shouldRetryOnError: false })
}

export function useAdminCategories() {
  return useApiRead<CatalogCategory[]>('/api/admin/categories', { shouldRetryOnError: false })
}

export function useAdminBanners() {
  return useApiRead<CatalogBanner[]>('/api/admin/banners', { shouldRetryOnError: false })
}

export function useAdminCategory(id: string | null) {
  return useApiRead<CatalogCategory>(id ? `/api/admin/categories/${encodeURIComponent(id)}` : null, { shouldRetryOnError: false })
}

export function useAdminProducts(query: string) {
  return useApiRead<CatalogPage>(`/api/admin/products?${query}`, {
    shouldRetryOnError: false, keepPreviousData: true,
  })
}

export function useAdminProduct(id: string | null) {
  return useApiRead<CatalogProduct>(id ? `/api/admin/products/${encodeURIComponent(id)}` : null, {
    shouldRetryOnError: false,
  })
}
