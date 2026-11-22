import 'server-only'

import { backendCookieHeader, hasBackendSession } from './backend-cookies'
import { verifiedSessionRole } from './login-destination'

export async function readSessionRole(cookieHeader: string | null) {
  if (!hasBackendSession(cookieHeader)) return null
  const headers = { Cookie: backendCookieHeader(cookieHeader) }
  if (!process.env.BACKEND_URL) throw new Error('Backend service is not configured.')
  const response = await fetch(new URL('/v1/auth/session', process.env.BACKEND_URL), {
    headers, cache: 'no-store', signal: AbortSignal.timeout(30000),
  })
  if (response.status === 401) return null
  if (!response.ok) throw new Error('Your session could not be checked. Please try again.')
  const payload: unknown = await response.json()
  const role = payload && typeof payload === 'object' && 'data' in payload ? verifiedSessionRole(payload.data) : null
  if (!role) throw new Error('Your account could not be loaded. Please try again.')
  return role
}
