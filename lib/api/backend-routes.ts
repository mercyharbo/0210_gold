import type { ApiMethod } from './types'

const routes: Partial<Record<ApiMethod, ReadonlyMap<string, string>>> = {
  GET: new Map([
    ['health', '/v1/health'], ['identity/me', '/v1/auth/me'],
    ['admin/auth-check', '/v1/admin/auth-check'], ['auth/csrf', '/v1/auth/csrf'],
    ['auth/session', '/v1/auth/session'], ['v1/auth/google/callback', '/v1/auth/google/callback'],
  ]),
  POST: new Map([
    ['auth/signup', '/v1/auth/signup'],
    ['identity/bootstrap', '/v1/auth/bootstrap'], ['auth/login', '/v1/auth/login'],
    ['auth/logout', '/v1/auth/logout'], ['auth/google/start', '/v1/auth/google/start'],
    ['auth/email-verification/confirm', '/v1/auth/email-verification/confirm'],
    ['auth/email-verification/request', '/v1/auth/email-verification/request'],
    ['auth/password-reset/request', '/v1/auth/password-reset/request'],
    ['auth/password-reset/confirm', '/v1/auth/password-reset/confirm'],
  ]),
}

export function getBackendPath(method: ApiMethod, endpoint: string) {
  const uuid = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'
  const publicRead = /^catalog\/(products(?:\/[a-z0-9]+(?:-[a-z0-9]+)*(?:\/price)?)?|categories|banners|settings|gold-rates)$/
  if (method === 'GET' && publicRead.test(endpoint)) return `/v1/${endpoint}`
  if (new RegExp(`^admin/(products|categories|banners)(/${uuid})?$`).test(endpoint)) {
    const detail = endpoint.split('/').length === 3
    if (method === 'GET' || (!detail && method === 'POST') ||
      (detail && (method === 'PUT' || method === 'DELETE'))) return `/v1/${endpoint}`
  }
  if (method === 'PUT' && /^admin\/(settings|gold-rates)$/.test(endpoint)) return `/v1/${endpoint}`
  if (method === 'POST' && (/^admin\/media\/(uploads|cleanup)$/.test(endpoint) ||
    new RegExp(`^admin/media/${uuid}/complete$`).test(endpoint))) return `/v1/${endpoint}`
  if (method === 'DELETE' && new RegExp(`^admin/media/${uuid}$`).test(endpoint)) return `/v1/${endpoint}`
  return routes[method]?.get(endpoint) ?? null
}

export function isPublicBackendPath(path: string) {
  return path === '/v1/health' || path.startsWith('/v1/catalog/') ||
    ['/v1/auth/csrf', '/v1/auth/session', '/v1/auth/login', '/v1/auth/logout', '/v1/auth/signup',
      '/v1/auth/google/start', '/v1/auth/google/callback', '/v1/auth/email-verification/confirm',
      '/v1/auth/email-verification/request', '/v1/auth/password-reset/request',
      '/v1/auth/password-reset/confirm'].includes(path)
}
