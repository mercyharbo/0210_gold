'use client'

import useSWR from 'swr'
import { ApiError, apiFetcher } from '@/lib/api/client'
import type { ApiResponse } from '@/lib/api/types'
import type { IdentityProfile } from '@/types/identity'

export const currentUserKey = '/api/identity/me'
export const adminCheckKey = '/api/admin/auth-check'

export function useCurrentProfile() {
  return useSWR<ApiResponse<IdentityProfile>, ApiError>(
    currentUserKey,
    apiFetcher,
    {
      shouldRetryOnError: (error) => error.status >= 500 || error.status === 0,
      errorRetryCount: 2,
    },
  )
}

export function useAdminCheck(enabled: boolean) {
  return useSWR<ApiResponse<IdentityProfile>, ApiError>(
    enabled ? adminCheckKey : null,
    apiFetcher,
    {
      shouldRetryOnError: false,
    },
  )
}
