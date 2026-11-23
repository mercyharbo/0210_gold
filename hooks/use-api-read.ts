'use client'

import { useCallback } from 'react'
import useSWR, { type SWRConfiguration } from 'swr'
import type { ZodType } from 'zod'
import { ApiError, apiFetcher } from '@/lib/api/client'
import type { ApiResponse } from '@/lib/api/types'

type ApiReadOptions<T> = Omit<SWRConfiguration<ApiResponse<T>, ApiError>, 'fetcher' | 'fallbackData'> & {
  initialData?: T
  schema?: ZodType<T>
}

// Feature hooks supply their key/options; transport and optional validation live once.
export function useApiRead<T>(key: string | null, options: ApiReadOptions<T> = {}) {
  const { initialData, schema, ...configuration } = options
  const fetcher = useCallback((url: string) => apiFetcher<T>(url, schema), [schema])
  return useSWR<ApiResponse<T>, ApiError>(key, fetcher, {
    ...configuration,
    fallbackData: initialData === undefined ? undefined : { success: true, status: 200, data: initialData },
  })
}
