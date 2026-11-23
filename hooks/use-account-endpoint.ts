'use client'

import useSWR from 'swr'
import { ApiError, apiFetcher } from '@/lib/api/client'
import { accountProfileSchema } from '@/lib/validations/account-profile'
import type { AccountProfile } from '@/types/account'

export const accountProfileKey = '/api/account/profile'

async function fetchProfile(url: string) {
  const response = await apiFetcher<AccountProfile>(url)
  const parsed = accountProfileSchema.safeParse(response.data)
  if (!parsed.success) {
    throw new ApiError({ status: 502, code: 'INVALID_PROFILE_RESPONSE', message: 'Your profile could not be loaded. Try again.' })
  }
  return { ...response, data: parsed.data }
}

// Header and profile subscribe to the same cache; mutations remain in their form.
export function useAccountProfile() {
  return useSWR<Awaited<ReturnType<typeof fetchProfile>>, ApiError>(accountProfileKey, fetchProfile, {
    shouldRetryOnError: false,
    revalidateOnFocus: true,
  })
}
