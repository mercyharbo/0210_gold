import { NextResponse, type NextRequest } from 'next/server'

import { getNeonAuth } from './neon-server'

export async function neonProxy(request: NextRequest) {
  const path = request.nextUrl.pathname
  const catalogAdmin = /^\/admin\/(products|categories|hero-banners)(\/(new|[0-9a-f-]{36})(\/edit)?)?$/.test(path) || path === '/admin/settings'
  const legacy = ['/profile', '/checkout', '/cart', '/make-a-request', '/personal-shopper-request', '/order-success', '/track-order'].some(
    (route) => path === route || path.startsWith(`${route}/`),
  )
  if (legacy || (path.startsWith('/admin/') && !catalogAdmin)) {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return Response.json(
        { error: 'This feature is unavailable in the auth preview.' },
        { status: 409 },
      )
    }
    return NextResponse.redirect(new URL('/auth/preview/account', request.url))
  }
  if (path === '/admin') return NextResponse.redirect(new URL('/admin/products', request.url))
  if (path.startsWith('/auth/preview/') || catalogAdmin) {
    return getNeonAuth().middleware({ loginUrl: '/login' })(request)
  }
  return NextResponse.next()
}
