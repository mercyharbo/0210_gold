import { NextResponse, type NextRequest } from 'next/server'

import { getNeonAuth } from './neon-server'

export async function neonProxy(request: NextRequest) {
  const path = request.nextUrl.pathname
  const legacy = ['/profile', '/admin', '/checkout'].some(
    (route) => path === route || path.startsWith(`${route}/`),
  )
  if (legacy) {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return Response.json(
        { error: 'This feature is unavailable in the auth preview.' },
        { status: 409 },
      )
    }
    return NextResponse.redirect(new URL('/auth/preview/account', request.url))
  }
  if (path.startsWith('/auth/preview/')) {
    return getNeonAuth().middleware({ loginUrl: '/login' })(request)
  }
  return NextResponse.next()
}
