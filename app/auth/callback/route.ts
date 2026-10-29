import { NextResponse, type NextRequest } from 'next/server'

import { getSiteUrl } from '@/lib/site-url'
import { getAuthProvider } from '@/lib/auth/provider'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  if (getAuthProvider() === 'neon') {
    const destination = new URL('/auth/complete', request.url)
    destination.search = new URL(request.url).search
    return NextResponse.redirect(destination)
  }
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/profile'
  const safeNext = next.startsWith('/') && !next.startsWith('//') && !next.includes('\\') ? next : '/profile'
  const redirectUrl = new URL(safeNext, getSiteUrl())
  if (redirectUrl.origin !== new URL(getSiteUrl()).origin) {
    redirectUrl.href = new URL('/profile', getSiteUrl()).href
  }

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
