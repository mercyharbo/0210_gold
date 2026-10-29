import type { ApiErrorDetail, ApiMethod, ApiResponse } from './types'

export type ApiRequestOptions = Omit<
  RequestInit,
  'body' | 'credentials' | 'method'
>

export type ApiRequestMethod = Lowercase<ApiMethod> | ApiMethod
export type ApiRequestBody = BodyInit | Record<string, unknown> | unknown[] | null

type ErrorPayload = {
  error?: string | ApiErrorDetail
  message?: string
}

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly fieldErrors?: Record<string, string[]>
  readonly payload?: unknown

  constructor(options: {
    message: string
    status: number
    code: string
    fieldErrors?: Record<string, string[]>
    payload?: unknown
  }) {
    super(options.message)
    this.name = 'ApiError'
    this.status = options.status
    this.code = options.code
    this.fieldErrors = options.fieldErrors
    this.payload = options.payload
  }
}

function normalizeApiUrl(endpoint: string) {
  const trimmedEndpoint = endpoint.trim()

  if (/^https?:\/\//i.test(trimmedEndpoint)) {
    throw new ApiError({
      message: 'API requests must use a same-origin path.',
      status: 0,
      code: 'INVALID_API_ENDPOINT',
    })
  }

  const withoutLeadingSlash = trimmedEndpoint.replace(/^\/+/, '')

  if (!withoutLeadingSlash || withoutLeadingSlash === 'api') {
    return '/api'
  }

  if (withoutLeadingSlash.startsWith('api/')) {
    return `/${withoutLeadingSlash}`
  }

  return `/api/${withoutLeadingSlash}`
}

function isBodyInit(payload: ApiRequestBody): payload is BodyInit {
  return (
    typeof payload === 'string' ||
    payload instanceof Blob ||
    payload instanceof ArrayBuffer ||
    payload instanceof FormData ||
    payload instanceof URLSearchParams ||
    payload instanceof ReadableStream
  )
}

function buildRequestBody(
  payload: ApiRequestBody | undefined,
  headers: Headers,
) {
  if (payload === undefined) {
    return undefined
  }

  if (isBodyInit(payload)) {
    return payload
  }

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  return JSON.stringify(payload)
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return undefined
  }

  const contentType = response.headers.get('Content-Type') ?? ''

  try {
    if (contentType.includes('application/json')) {
      return await response.json()
    }

    const text = await response.text()
    return text || undefined
  } catch {
    return undefined
  }
}

function isErrorPayload(payload: unknown): payload is ErrorPayload {
  return typeof payload === 'object' && payload !== null
}

function getErrorDetails(response: Response, payload: unknown) {
  if (!isErrorPayload(payload)) {
    return {
      code: response.status === 0 ? 'NETWORK_ERROR' : 'REQUEST_FAILED',
      message: response.statusText || 'The request could not be completed.',
    }
  }

  if (typeof payload.error === 'object' && payload.error !== null) {
    return {
      code: payload.error.code,
      message: payload.error.message,
      fieldErrors: payload.error.fieldErrors,
    }
  }

  return {
    code: 'REQUEST_FAILED',
    message:
      typeof payload.error === 'string'
        ? payload.error
        : (payload.message ?? response.statusText ?? 'The request failed.'),
  }
}

function isApiResponse<TData>(payload: unknown): payload is ApiResponse<TData> {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'success' in payload &&
    typeof payload.success === 'boolean' &&
    'status' in payload &&
    typeof payload.status === 'number'
  )
}

export async function apiRequest<TData = unknown>(
  method: ApiRequestMethod,
  endpoint: string,
  payload?: ApiRequestBody,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<TData>> {
  const headers = new Headers(options.headers)
  const body = buildRequestBody(payload, headers)
  let response: Response

  try {
    response = await fetch(normalizeApiUrl(endpoint), {
      ...options,
      method: method.toUpperCase(),
      headers,
      body,
      credentials: 'include',
    })
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw error
    }

    const aborted = error instanceof DOMException && error.name === 'AbortError'
    throw new ApiError({
      message: aborted ? 'The request was cancelled.' : 'Network request failed.',
      status: 0,
      code: aborted ? 'REQUEST_CANCELLED' : 'NETWORK_ERROR',
      payload: error,
    })
  }

  const parsedBody = await parseResponseBody(response)
  const normalizedResponse: ApiResponse<TData> = isApiResponse<TData>(parsedBody)
    ? parsedBody
    : {
        success: response.ok,
        status: response.status,
        ...(parsedBody === undefined ? {} : { data: parsedBody as TData }),
      }

  if (!response.ok || !normalizedResponse.success) {
    const details = getErrorDetails(response, parsedBody)
    throw new ApiError({
      ...details,
      status: response.status,
      payload: parsedBody,
    })
  }

  return normalizedResponse
}

export function apiFetcher<TData>(url: string) {
  return apiRequest<TData>('GET', url)
}
