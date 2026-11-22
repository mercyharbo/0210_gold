import { NextResponse, type NextRequest } from 'next/server'

import { createSupabaseProxyClient } from '@/lib/supabase/proxy'
import { getAuthProvider } from '@/lib/auth/provider'
import { neonProxy } from '@/lib/auth/neon-proxy'
import { readSessionRole } from '@/lib/auth/backend-session'
import { loginDestination } from '@/lib/auth/login-destination'
import { isRemovedServiceRoute } from '@/lib/site/removed-services'

const authRequiredRoutes = ['/profile', '/admin']
const guestOnlyRoutes = ['/login', '/signup', '/register', '/forgot-password']
const changePasswordRoute = '/change-password'

function matchesRoute(pathname: string, routes: string[]) {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  )
}

function redirectTo(
  request: NextRequest,
  path: string,
  responseToCopy?: NextResponse,
) {
  const response = NextResponse.redirect(new URL(path, request.url))

  responseToCopy?.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie)
  })

  return response
}

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === '/login') {
    try {
      const role = await readSessionRole(request.headers.get('cookie'))
      if (role) return NextResponse.redirect(new URL(loginDestination(role), request.url))
    } catch {
      if (!request.nextUrl.searchParams.has('error')) {
        return NextResponse.redirect(new URL('/login?error=service_unavailable', request.url))
      }
    }
    return NextResponse.next()
  }
  if (isRemovedServiceRoute(request.nextUrl.pathname)) return NextResponse.next()
  if (getAuthProvider() === 'neon') return neonProxy(request)
  const pathname = request.nextUrl.pathname

  const { supabase, getResponse } = createSupabaseProxyClient(request)
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const response = getResponse()
  const isAuthenticated = Boolean(user)

  if (matchesRoute(pathname, authRequiredRoutes) && !isAuthenticated) {
    return redirectTo(request, '/login?error=Sign in to continue.', response)
  }

  if (matchesRoute(pathname, guestOnlyRoutes) && isAuthenticated) {
    return redirectTo(request, '/profile', response)
  }

  if (pathname === changePasswordRoute && !isAuthenticated) {
    return redirectTo(
      request,
      '/forgot-password?error=Use the reset link from your email before changing your password.',
      response,
    )
  }

  return response
}

export const config = {
  matcher: [
    '/auth/preview/:path*',
    '/profile/:path*',
    '/checkout/:path*',
    '/cart/:path*',
    '/order-success/:path*',
    '/track-order/:path*',
    '/admin/:path*',
    '/login',
    '/signup',
    '/register',
    '/forgot-password',
    '/change-password',
  ],
}
