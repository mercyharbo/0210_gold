import { NextResponse, type NextRequest } from 'next/server'

import { getSiteUrl } from '@/lib/site-url'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/profile'
  const redirectUrl = new URL(next, getSiteUrl())

  if (!code) {
    return NextResponse.redirect(
      new URL('/login?error=Invalid confirmation link', getSiteUrl()),
    )
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(error.message)}`,
        getSiteUrl(),
      ),
    )
  }

  return NextResponse.redirect(redirectUrl)
}
