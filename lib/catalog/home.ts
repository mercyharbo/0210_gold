import 'server-only'
import { unstable_rethrow } from 'next/navigation'
import { readCatalog } from './server'
import type { CatalogBanner, CatalogCategory, CatalogPage, CatalogSettings } from '@/types/catalog'
import { homeProductQueries } from './home-queries'

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
  const [banners, categories, products, necklaces, featuredProducts] = await Promise.all([
    initialRead<CatalogBanner[]>('banners'),
    initialRead<CatalogCategory[]>('categories'),
    initialRead<CatalogPage>(homeProductQueries.arrivals),
    initialRead<CatalogPage>(homeProductQueries.necklaces),
    initialRead<CatalogPage>(homeProductQueries.featured),
  ])
  return { banners, categories, products, necklaces, featuredProducts }
}

export function readStoreSettings() {
  return initialRead<CatalogSettings>('settings')
}
