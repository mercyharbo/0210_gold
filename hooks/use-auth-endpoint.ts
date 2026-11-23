'use client'

import { useApiRead } from './use-api-read'
import type { AuthCsrf } from '@/types/authentication'

export function useAuthCsrf() {
  return useApiRead<AuthCsrf>('/api/auth/csrf', {
    revalidateOnMount: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: false,
  })
}
