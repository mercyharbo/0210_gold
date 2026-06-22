import type { ApiResponse } from './types'

export function jsonResponse<TData>(
  response: ApiResponse<TData>,
): Response {
  return Response.json(response, { status: response.status })
}

export function ok<TData>(
  data?: TData,
  options: { message?: string; status?: number } = {},
): ApiResponse<TData> {
  return {
    success: true,
    status: options.status ?? 200,
    ...(data === undefined ? {} : { data }),
    ...(options.message ? { message: options.message } : {}),
  }
}

export function fail(error: string, status = 500): ApiResponse {
  return {
    success: false,
    status,
    error,
  }
}
