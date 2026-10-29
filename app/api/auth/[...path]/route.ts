import type { NextRequest } from 'next/server'

import { getNeonAuth } from '@/lib/auth/neon-server'
import { getAuthProvider } from '@/lib/auth/provider'

type AuthContext = { params: Promise<{ path: string[] }> }

async function handle(request: NextRequest, context: AuthContext) {
  if (getAuthProvider() !== 'neon') {
    return Response.json(
      { error: 'Neon authentication is disabled in this environment.' },
      { status: 404 },
    )
  }
  // Cookie/session and OAuth protocol forwarding belongs to the official SDK.
  const handlers = getNeonAuth().handler()
  const method = request.method as keyof typeof handlers
  return handlers[method](request, context)
}

export {
  handle as GET,
  handle as POST,
  handle as PUT,
  handle as PATCH,
  handle as DELETE,
}
