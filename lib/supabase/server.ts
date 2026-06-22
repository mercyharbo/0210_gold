import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

import { getRequiredSupabaseServerEnv } from './server-env'

export async function createSupabaseServerClient() {
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
