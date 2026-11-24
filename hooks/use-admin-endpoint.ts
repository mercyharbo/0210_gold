'use client'

import { useApiRead } from './use-api-read'
import type { CatalogBanner, CatalogCategory } from '@/types/catalog'
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
