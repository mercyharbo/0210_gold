import type { NextRequest } from 'next/server'

import { getNeonAuth } from '@/lib/auth/neon-server'
import { getAuthProvider } from '@/lib/auth/provider'
import { getBackendPath, proxyBackendRequest } from '@/lib/api/backend-proxy'
import type { ApiMethod } from '@/lib/api/types'

type AuthContext = { params: Promise<{ path: string[] }> }

async function handle(request: NextRequest, context: AuthContext) {
  const { path } = await context.params
  const method = request.method as ApiMethod
  const backendPath = getBackendPath(method, `auth/${path.join('/')}`)
  if (backendPath) return proxyBackendRequest(request, method, backendPath)
  if (getAuthProvider() !== 'neon') {
    return Response.json(
      { error: 'Neon authentication is disabled in this environment.' },
      { status: 404 },
    )
  }
  // Cookie/session and OAuth protocol forwarding belongs to the official SDK.
  const handlers = getNeonAuth().handler()
  const sdkMethod = request.method as keyof typeof handlers
  return handlers[sdkMethod](request, context)
}

export {
  handle as GET,
  handle as POST,
  handle as PUT,
  handle as PATCH,
  handle as DELETE,
}
