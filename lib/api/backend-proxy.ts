import { backendCookieHeader, hasBackendSession } from '@/lib/auth/backend-cookies'
import { isPublicBackendPath } from './backend-routes'
import { jsonResponse } from './response'
import type { ApiMethod } from './types'

export { getBackendPath } from './backend-routes'
const methodsWithBody = new Set<ApiMethod>(['POST', 'PUT', 'PATCH', 'DELETE'])

function unavailable(code: string, message: string) {
  return jsonResponse({ success: false, status: 503, error: { code, message } })
}

function googleFailure(request: Request, error: string) {
  return new Response(null, { status: 303, headers: {
    Location: new URL(`/login?error=${error}`, request.url).toString(),
    'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer',
  } })
}

export async function proxyBackendRequest(request: Request, method: ApiMethod, backendPath: string) {
  const callback = backendPath === '/v1/auth/google/callback'
  let backend: URL
  try {
    backend = new URL(process.env.BACKEND_URL ?? '')
    if (!['http:', 'https:'].includes(backend.protocol)) throw new Error('Invalid protocol')
  } catch {
    return callback ? googleFailure(request, 'service_unavailable') :
      unavailable('BACKEND_NOT_CONFIGURED', 'Backend service is not configured.')
  }
  const incoming = new URL(request.url)
  const writes = methodsWithBody.has(method)
  if (writes && request.headers.get('origin') !== incoming.origin) {
    return jsonResponse({ success: false, status: 403,
      error: { code: 'INVALID_ORIGIN', message: 'Request origin is not allowed.' } })
  }
  if (!isPublicBackendPath(backendPath) && !hasBackendSession(request.headers.get('cookie'))) {
    return jsonResponse({ success: false, status: 401,
      error: { code: 'UNAUTHENTICATED', message: 'Sign in to continue.' } })
  }
  const headers = new Headers()
  for (const name of ['accept', 'content-type', 'origin', 'x-csrf-token', 'sec-fetch-site']) {
    const value = request.headers.get(name)
    if (value) headers.set(name, value)
  }
  const cookies = backendCookieHeader(request.headers.get('cookie'))
  if (cookies) headers.set('Cookie', cookies)
  // The browser-facing API uses backend cookies, never a browser or SDK bearer token.
  const target = new URL(backendPath, backend)
  target.search = incoming.search
  const configured = Number(process.env.BACKEND_PROXY_TIMEOUT_MS ?? 30000)
  const timeout = Number.isFinite(configured) ? Math.min(Math.max(configured, 1000), 30000) : 30000
  try {
    const body = writes ? await request.arrayBuffer() : undefined
    const upstream = await fetch(target, {
      method, headers, body: body?.byteLength ? body : undefined,
      cache: 'no-store', redirect: 'manual', signal: AbortSignal.timeout(timeout),
    })
    if (callback && upstream.status !== 303) {
      await upstream.body?.cancel()
      return googleFailure(request, 'google_sign_in')
    }
    const responseHeaders = new Headers({ 'Cache-Control': 'private, no-store' })
    for (const name of ['content-type', 'location', 'referrer-policy']) {
      const value = upstream.headers.get(name)
      if (value) responseHeaders.set(name, value)
    }
    for (const cookie of upstream.headers.getSetCookie()) responseHeaders.append('Set-Cookie', cookie)
    return new Response(upstream.body, { status: upstream.status, headers: responseHeaders })
  } catch {
    return callback ? googleFailure(request, 'service_unavailable') :
      unavailable('BACKEND_UNAVAILABLE', 'Backend service is unavailable.')
  }
}
