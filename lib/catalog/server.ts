import 'server-only'
import { cache } from 'react'
import type { ApiResponse } from '@/lib/api/types'

export class CatalogReadError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}

export const readCatalog = cache(async <T>(endpoint: string): Promise<T> => {
  const origin = process.env.BACKEND_URL
  if (!origin) throw new CatalogReadError(503, 'The catalog is temporarily unavailable.')
  const response = await fetch(new URL(`/v1/catalog/${endpoint}`, origin), {
    cache: 'no-store',
    signal: AbortSignal.timeout(30000),
  })
  const payload: ApiResponse<T> = await response.json()
  if (!response.ok || !payload.success || payload.data === undefined) {
    throw new CatalogReadError(
      response.status,
      typeof payload.error === 'object' ? payload.error.message : 'The catalog is temporarily unavailable.',
    )
  }
  return payload.data
})
