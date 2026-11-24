import 'server-only'

import { unstable_rethrow } from 'next/navigation'

import { CatalogReadError, readCatalog } from './server'
import { parseBrowseQuery, type BrowseSearchParams } from './browse-query'
import type { CatalogCategory, CatalogPage } from '@/types/catalog'

export async function readBrowseContent(searchParams: Promise<BrowseSearchParams>) {
  const query = parseBrowseQuery(await searchParams)

  const [productsReadResult, categoriesReadResult] = await Promise.allSettled([
    readCatalog<CatalogPage>(`products?${new URLSearchParams(query)}`),
    readCatalog<CatalogCategory[]>('categories'),
  ])

  return {
    query,
    serverProductResults: productsReadResult.status === 'fulfilled' ? productsReadResult.value : undefined,
    categories: categoriesReadResult.status === 'fulfilled' ? categoriesReadResult.value : [],
    productsLoadError: getCatalogReadErrorMessage(productsReadResult, 'Products are temporarily unavailable.'),
    categoriesLoadError: getCatalogReadErrorMessage(categoriesReadResult, 'Collections are temporarily unavailable. Refresh to try again.'),
  }
}

function getCatalogReadErrorMessage(result: PromiseSettledResult<unknown>, fallback: string) {
  if (result.status === 'fulfilled') {
    return undefined
  }

  const error: unknown = result.reason

  unstable_rethrow(error)

  return error instanceof CatalogReadError ? error.message : fallback
}
