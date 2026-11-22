import 'server-only'
import { unstable_rethrow } from 'next/navigation'
import { readCatalog } from './server'
import type { CatalogBanner, CatalogCategory, CatalogPage, CatalogSettings } from '@/types/catalog'

// Failed reads remain undefined so clients show an error, rather than a false empty catalog.
async function initialRead<T>(path: string): Promise<T | undefined> {
  try {
    return await readCatalog<T>(path)
  } catch (error) {
    unstable_rethrow(error)
    return undefined
  }
}

export async function readHomeContent() {
  const [banners, categories, products] = await Promise.all([
    initialRead<CatalogBanner[]>('banners'),
    initialRead<CatalogCategory[]>('categories'),
    initialRead<CatalogPage>('products?sort=newest&page=1&page_size=8'),
  ])
  return { banners, categories, products }
}

export function readStoreSettings() {
  return initialRead<CatalogSettings>('settings')
}
