import { NextResponse, type NextRequest } from 'next/server'

import { getNeonAuth } from './neon-server'

export async function neonProxy(request: NextRequest) {
  const path = request.nextUrl.pathname
  const legacy = ['/checkout', '/cart', '/order-success', '/track-order'].some(
    (route) => path === route || path.startsWith(`${route}/`),
  )
  if (legacy) {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return Response.json(
        { error: 'This feature is unavailable in the auth preview.' },
        { status: 409 },
      )
    }
    // These routes now render UI only; legacy order/payment submissions stay blocked.
    if (path === '/cart' || path === '/checkout') {
      return NextResponse.next()
    }
    return NextResponse.redirect(new URL('/auth/preview/account', request.url))
  }
  // The admin layout and FastAPI validate the backend session and role.
  if (path === '/admin' || path.startsWith('/admin/') || path === '/login') return NextResponse.next()
  if (path.startsWith('/auth/preview/')) {
    return getNeonAuth().middleware({ loginUrl: '/login' })(request)
  }
  return NextResponse.next()
}
