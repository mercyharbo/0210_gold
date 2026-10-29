import { jsonResponse } from './response'
import type { ApiMethod } from './types'

const methodsWithBody = new Set<ApiMethod>(['POST', 'PUT', 'PATCH', 'DELETE'])
const forwardedRequestHeaders = ['accept', 'authorization', 'content-type'] as const
const forwardedResponseHeaders = ['cache-control', 'content-type', 'location'] as const

const backendRoutes: Partial<Record<ApiMethod, ReadonlyMap<string, string>>> = {
  GET: new Map([['health', '/v1/health']]),
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
  const configuredTimeout = Number(process.env.BACKEND_PROXY_TIMEOUT_MS ?? 8000)

  if (!Number.isFinite(configuredTimeout)) {
    return 8000
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
    const body = methodsWithBody.has(method) ? await request.arrayBuffer() : undefined
    const upstream = await fetch(upstreamUrl, {
      method,
      headers: buildUpstreamHeaders(request),
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
