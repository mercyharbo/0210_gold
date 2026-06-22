import { getApiHandler } from './handlers'
import { parseJsonBody, normalizeEndpoint } from './request'
import { fail, jsonResponse } from './response'
import type { ApiMethod } from './types'

const methodsWithBody = new Set<ApiMethod>(['POST', 'PUT', 'PATCH', 'DELETE'])

export async function dispatchApiRequest(
  request: Request,
  method: ApiMethod,
  pathSegments: string[] = [],
) {
  const endpoint = normalizeEndpoint(pathSegments)
  const handler = getApiHandler(method, endpoint)

  if (!handler) {
    return jsonResponse(fail('Endpoint not found', 404))
  }

  let body: unknown

  if (methodsWithBody.has(method)) {
    const parsedBody = await parseJsonBody(request)

    if (!parsedBody.success) {
      return jsonResponse(fail('Invalid request body', 400))
    }

    body = parsedBody.body
  }

  try {
    return jsonResponse(
      await handler({
        request,
        method,
        endpoint,
        body,
      }),
    )
  } catch {
    return jsonResponse(fail('Something went wrong', 500))
  }
}
