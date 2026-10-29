import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { headers } from 'next/headers'
import { assertLegacyAuthEnabled } from '@/lib/auth/provider'

import { getRequiredSupabaseServerEnv } from './server-env'

export async function createSupabaseServerClient() {
  if ((await headers()).has('next-action')) assertLegacyAuthEnabled()
  const cookieStore = await cookies()
  const { url, publishableKey } = getRequiredSupabaseServerEnv()

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // Server Components cannot write cookies. Server Actions and Route
          // Handlers can, which is where auth mutations are performed.
        }
      },
    },
  })
}

export function createSupabaseAdminClient() {
  assertLegacyAuthEnabled()
  const { url, secretKey } = getRequiredSupabaseServerEnv()

  if (!secretKey) {
    throw new Error('Missing SUPABASE_SECRET_KEY environment variable.')
  }

  return createClient(url, secretKey, {
    auth: {
      persistSession: false,
    },
  })
}
