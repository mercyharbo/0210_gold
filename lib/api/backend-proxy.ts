import { jsonResponse } from './response'
import type { ApiMethod } from './types'
import { getIdentityHeaders } from '@/lib/auth/backend-headers'

const methodsWithBody = new Set<ApiMethod>(['POST', 'PUT', 'PATCH', 'DELETE'])
const forwardedRequestHeaders = [
  'accept',
  'authorization',
  'content-type',
] as const
const forwardedResponseHeaders = [
  'cache-control',
  'content-type',
  'location',
] as const

const backendRoutes: Partial<Record<ApiMethod, ReadonlyMap<string, string>>> = {
  GET: new Map([
    ['health', '/v1/health'],
    ['identity/me', '/v1/auth/me'],
    ['admin/auth-check', '/v1/admin/auth-check'],
  ]),
  POST: new Map([['identity/bootstrap', '/v1/auth/bootstrap']]),
}

export function getBackendPath(method: ApiMethod, endpoint: string) {
  return backendRoutes[method]?.get(endpoint) ?? null
}

function getBackendOrigin() {
  const configuredOrigin = process.env.BACKEND_URL?.trim()

  if (!configuredOrigin) {
    return null
  }

  try {
    const origin = new URL(configuredOrigin)

    if (origin.protocol !== 'http:' && origin.protocol !== 'https:') {
      return null
    }

    return origin
  } catch {
    return null
  }
}

function getTimeoutMs() {
  const configuredTimeout = Number(process.env.BACKEND_PROXY_TIMEOUT_MS ?? 30000)

  if (!Number.isFinite(configuredTimeout)) {
    return 30000
  }

  return Math.min(Math.max(configuredTimeout, 1000), 30000)
}

function buildUpstreamHeaders(request: Request) {
  const headers = new Headers()

  for (const name of forwardedRequestHeaders) {
    const value = request.headers.get(name)

    if (value) {
      headers.set(name, value)
    }
  }

  return headers
}

function buildClientHeaders(upstream: Response) {
  const headers = new Headers()

  for (const name of forwardedResponseHeaders) {
    const value = upstream.headers.get(name)

    if (value) {
      headers.set(name, value)
    }
  }

  headers.set('Cache-Control', 'private, no-store')
  return headers
}

export async function proxyBackendRequest(
  request: Request,
  method: ApiMethod,
  backendPath: string,
) {
  const backendOrigin = getBackendOrigin()

  if (!backendOrigin) {
    return jsonResponse({
      success: false,
      status: 503,
      error: {
        code: 'BACKEND_NOT_CONFIGURED',
        message: 'Backend service is not configured.',
      },
    })
  }

  const incomingUrl = new URL(request.url)
  const upstreamUrl = new URL(backendPath, backendOrigin)
  upstreamUrl.search = incomingUrl.search

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), getTimeoutMs())

  try {
    const headers = buildUpstreamHeaders(request)
    if (backendPath !== '/v1/health') {
      if (
        methodsWithBody.has(method) &&
        request.headers.get('origin') !== incomingUrl.origin
      ) {
        return jsonResponse({
          success: false,
          status: 403,
          error: {
            code: 'INVALID_ORIGIN',
            message: 'Request origin is not allowed.',
          },
        })
      }
      const identityHeaders = await getIdentityHeaders()
      if (!identityHeaders) {
        return jsonResponse({
          success: false,
          status: 401,
          error: { code: 'UNAUTHENTICATED', message: 'Sign in to continue.' },
        })
      }
      // Never accept an arbitrary browser-supplied identity token at the BFF boundary.
      headers.set('Authorization', identityHeaders.Authorization)
    }
    const body = methodsWithBody.has(method)
      ? await request.arrayBuffer()
      : undefined
    const upstream = await fetch(upstreamUrl, {
      method,
      headers,
      body: body && body.byteLength > 0 ? body : undefined,
      cache: 'no-store',
      redirect: 'manual',
      signal: controller.signal,
    })

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: buildClientHeaders(upstream),
    })
  } catch {
    return jsonResponse({
      success: false,
      status: 503,
      error: {
        code: 'BACKEND_UNAVAILABLE',
        message: 'Backend service is unavailable.',
      },
    })
  } finally {
    clearTimeout(timeout)
  }
}
