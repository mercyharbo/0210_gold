import type { NextRequest } from 'next/server'

import { getBackendPath, proxyBackendRequest } from '@/lib/api/backend-proxy'
import { dispatchApiRequest } from '@/lib/api/dispatch'
import type { ApiMethod } from '@/lib/api/types'

type ApiRouteContext = {
  params: Promise<{
    path?: string[]
  }>
}

async function handleApiRequest(
  request: NextRequest,
  method: ApiMethod,
  context: ApiRouteContext,
) {
  const { path = [] } = await context.params
  const endpoint = path
    .map((segment) => segment.trim())
    .filter(Boolean)
    .join('/')
  const backendPath = getBackendPath(method, endpoint)

  if (backendPath) {
    return proxyBackendRequest(request, method, backendPath)
  }

  return dispatchApiRequest(request, method, path)
}

export function GET(request: NextRequest, context: ApiRouteContext) {
  return handleApiRequest(request, 'GET', context)
}

export function POST(request: NextRequest, context: ApiRouteContext) {
  return handleApiRequest(request, 'POST', context)
}

export function PUT(request: NextRequest, context: ApiRouteContext) {
  return handleApiRequest(request, 'PUT', context)
}

export function PATCH(request: NextRequest, context: ApiRouteContext) {
  return handleApiRequest(request, 'PATCH', context)
}

export function DELETE(request: NextRequest, context: ApiRouteContext) {
  return handleApiRequest(request, 'DELETE', context)
}
