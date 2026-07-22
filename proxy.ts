import { NextResponse, type NextRequest } from 'next/server'

import { createSupabaseProxyClient } from '@/lib/supabase/proxy'

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
  const pathname = request.nextUrl.pathname

  const { supabase, getResponse } = createSupabaseProxyClient(request)
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const response = getResponse()
  const isAuthenticated = Boolean(user)

  if (matchesRoute(pathname, authRequiredRoutes) && !isAuthenticated && process.env.NODE_ENV !== 'development') {
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
    '/profile/:path*',
    '/checkout/:path*',
    '/admin/:path*',
    '/login',
    '/signup',
    '/register',
    '/forgot-password',
    '/change-password',
  ],
}
