import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

import { getRequiredSupabaseServerEnv } from './server-env'

export function createSupabaseProxyClient(request: NextRequest) {
  let response = NextResponse.next({
    request,
  })
  const { url, publishableKey } = getRequiredSupabaseServerEnv()

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value)
        })

        response = NextResponse.next({
          request,
        })

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  return {
    supabase,
    getResponse: () => response,
  }
}
