import { z } from 'zod'
import type { AccountProfile, ProfilePatch } from '@/types/account'

const optionalName = z.string().trim().max(100, 'Use no more than 100 characters.')

export const profileFormSchema = z.object({
  first_name: optionalName,
  last_name: optionalName,
  phone: z.string().trim().refine(
    (value) => !value || /^\+?[0-9 ()-]{7,30}$/.test(value),
    'Enter a phone number using 7–30 characters: digits, spaces, brackets or hyphens.',
  ),
})

export type ProfileFormValues = z.infer<typeof profileFormSchema>

// Validate server data before it becomes shared customer state in SWR.
export const accountProfileSchema = z.object({
  id: z.string(), email: z.string(), name: z.string(),
  first_name: z.string().nullable(), last_name: z.string().nullable(), phone: z.string().nullable(),
  role: z.enum(['customer', 'admin', 'super_admin']),
  created_at: z.iso.datetime({ offset: true }), updated_at: z.iso.datetime({ offset: true }),
})

export function profileFormValues(profile: AccountProfile): ProfileFormValues {
  return { first_name: profile.first_name ?? '', last_name: profile.last_name ?? '', phone: profile.phone ?? '' }
}

export function profileDisplayName(profile: AccountProfile) {
  return [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.name
}

export function changedProfileFields(values: ProfileFormValues, profile: AccountProfile): ProfilePatch {
  const payload: ProfilePatch = {}
  for (const name of ['first_name', 'last_name', 'phone'] as const) {
    const value = values[name].trim() || null
    if (value !== profile[name]) payload[name] = value
  }
  return payload
}
