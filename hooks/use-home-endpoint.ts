'use client'

import { useCatalogRead } from './use-catalog-endpoint'
import type { CatalogBanner, CatalogCategory, CatalogPage, CatalogSettings } from '@/types/catalog'

export function useHomeBanners(initial?: CatalogBanner[]) {
  return useCatalogRead<CatalogBanner[]>('/api/catalog/banners', initial)
}

export function useHomeCollections(initial?: CatalogCategory[]) {
  return useCatalogRead<CatalogCategory[]>('/api/catalog/categories', initial)
}

export function useHomeProducts(initial?: CatalogPage) {
  return useCatalogRead<CatalogPage>(
    '/api/catalog/products?sort=newest&page=1&page_size=8', initial,
  )
}

export function useStoreSettings(initial?: CatalogSettings) {
  return useCatalogRead<CatalogSettings>('/api/catalog/settings', initial)
}
