'use client'

import { useCallback } from 'react'

import { useApiRequestStore } from '@/stores/use-api-request-store'

export type ApiResponse<TData = unknown> = {
  success: boolean
  status: number
  data?: TData
  error?: string
  message?: string
}

export type ApiRequestOptions = Omit<RequestInit, 'body' | 'method'>

type RequestPayload = BodyInit | Record<string, unknown> | unknown[] | null

function normalizeApiUrl(endpoint: string) {
  if (/^https?:\/\//.test(endpoint)) {
    return endpoint
  }

  const trimmedEndpoint = endpoint.replace(/^\/+/, '')

  if (!trimmedEndpoint) {
    return '/api'
  }

  if (trimmedEndpoint === 'api' || trimmedEndpoint.startsWith('api/')) {
    return `/${trimmedEndpoint}`
  }

  return `/api/${trimmedEndpoint}`
}

function isBodyInit(payload: RequestPayload): payload is BodyInit {
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
  payload: RequestPayload | undefined,
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

function normalizeApiResponse<TData>(
  response: Response,
  parsedBody: unknown,
): ApiResponse<TData> {
  if (
    parsedBody &&
    typeof parsedBody === 'object' &&
    'success' in parsedBody &&
    'status' in parsedBody
  ) {
    return parsedBody as ApiResponse<TData>
  }

  return {
    success: response.ok,
    status: response.status,
    data: parsedBody as TData,
    ...(response.ok ? {} : { error: response.statusText }),
  }
}

async function parseResponseBody(response: Response) {
  const contentType = response.headers.get('Content-Type') ?? ''

  if (response.status === 204) {
    return undefined
  }

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

export async function apiRequest<TData = unknown>(
  method: string,
  endpoint: string,
  payload?: RequestPayload,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<TData>> {
  const headers = new Headers(options.headers)
  const body = buildRequestBody(payload, headers)
  const response = await fetch(normalizeApiUrl(endpoint), {
    ...options,
    method,
    headers,
    body,
  })
  const parsedBody = await parseResponseBody(response)

  return normalizeApiResponse<TData>(response, parsedBody)
}

export function GET<TData = unknown>(
  endpoint: string,
  options?: ApiRequestOptions,
) {
  return apiRequest<TData>('GET', endpoint, undefined, options)
}

export function POST<TData = unknown>(
  endpoint: string,
  payload?: RequestPayload,
  options?: ApiRequestOptions,
) {
  return apiRequest<TData>('POST', endpoint, payload, options)
}

export function PUT<TData = unknown>(
  endpoint: string,
  payload?: RequestPayload,
  options?: ApiRequestOptions,
) {
  return apiRequest<TData>('PUT', endpoint, payload, options)
}

export function PATCH<TData = unknown>(
  endpoint: string,
  payload?: RequestPayload,
  options?: ApiRequestOptions,
) {
  return apiRequest<TData>('PATCH', endpoint, payload, options)
}

export function DELETE<TData = unknown>(
  endpoint: string,
  payload?: RequestPayload,
  options?: ApiRequestOptions,
) {
  return apiRequest<TData>('DELETE', endpoint, payload, options)
}

export function useApiRequest() {
  const {
    loading,
    error,
    response,
    setLoading,
    setError,
    setResponse,
  } = useApiRequestStore()

  const request = useCallback(
    async <TData = unknown,>(
      method: string,
      endpoint: string,
      payload?: RequestPayload,
      options?: ApiRequestOptions,
    ) => {
      setLoading(true)
      setError(null)

      try {
        const nextResponse = await apiRequest<TData>(
          method,
          endpoint,
          payload,
          options,
        )

        setResponse(nextResponse)
        setError(nextResponse.success ? null : (nextResponse.error ?? null))

        return nextResponse
      } catch {
        const nextResponse: ApiResponse<TData> = {
          success: false,
          status: 0,
          error: 'Network request failed',
        }

        setResponse(nextResponse)
        setError(nextResponse.error ?? null)

        return nextResponse
      } finally {
        setLoading(false)
      }
    },
    [setError, setLoading, setResponse],
  )

  return {
    loading,
    error,
    response,
    request,
    GET: <TData = unknown,>(endpoint: string, options?: ApiRequestOptions) =>
      request<TData>('GET', endpoint, undefined, options),
    POST: <TData = unknown,>(
      endpoint: string,
      payload?: RequestPayload,
      options?: ApiRequestOptions,
    ) => request<TData>('POST', endpoint, payload, options),
    PUT: <TData = unknown,>(
      endpoint: string,
      payload?: RequestPayload,
      options?: ApiRequestOptions,
    ) => request<TData>('PUT', endpoint, payload, options),
    PATCH: <TData = unknown,>(
      endpoint: string,
      payload?: RequestPayload,
      options?: ApiRequestOptions,
    ) => request<TData>('PATCH', endpoint, payload, options),
    DELETE: <TData = unknown,>(
      endpoint: string,
      payload?: RequestPayload,
      options?: ApiRequestOptions,
    ) => request<TData>('DELETE', endpoint, payload, options),
  }
}
