'use client'

import { useApiRead } from './use-api-read'
import { accountProfileSchema } from '@/lib/validations/account-profile'
import type { AccountProfile } from '@/types/account'

export const accountProfileKey = '/api/account/profile'

export function useAccountProfile() {
  return useApiRead<AccountProfile>(accountProfileKey, {
    schema: accountProfileSchema,
    shouldRetryOnError: false,
    revalidateOnFocus: true,
  })
}
