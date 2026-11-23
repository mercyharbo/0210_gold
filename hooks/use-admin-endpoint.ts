'use client'

import { useApiRead } from './use-api-read'
import type { CatalogRecord } from '@/lib/catalog/editor'
import type { CatalogBanner, CatalogCategory, CatalogKind, CatalogPage } from '@/types/catalog'
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

export function useAdminCatalogRecords(kind: CatalogKind, page: number) {
  const query = kind === 'products' ? `?page=${page}&page_size=24` : ''
  return useApiRead<CatalogRecord[] | CatalogPage>(`/api/admin/${kind}${query}`, { shouldRetryOnError: false })
}

export function useAdminCatalogRecord(kind: CatalogKind, id?: string) {
  return useApiRead<CatalogRecord>(id ? `/api/admin/${kind}/${id}` : null, { shouldRetryOnError: false })
}
