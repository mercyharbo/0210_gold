'use client'

import useSWR from 'swr'
import { apiFetcher } from '@/lib/api/client'
import type { AuthCsrf } from '@/types/authentication'

export function useAuthCsrf() {
  return useSWR('/api/auth/csrf', apiFetcher<AuthCsrf>, {
    revalidateOnMount: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: false,
  })
}
