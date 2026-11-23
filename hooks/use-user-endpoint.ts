'use client'

import { useApiRead } from './use-api-read'
import type { IdentityProfile } from '@/types/identity'

export const currentUserKey = '/api/identity/me'

export function useCurrentProfile() {
  return useApiRead<IdentityProfile>(currentUserKey, {
    shouldRetryOnError: (error) => error.status >= 500 || error.status === 0,
    errorRetryCount: 2,
  })
}
