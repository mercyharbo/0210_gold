import type { NextRequest } from 'next/server'

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
