'use client'

import { useCallback, useRef, useState } from 'react'

import {
  ApiError,
  apiRequest,
  type ApiRequestBody,
  type ApiRequestMethod,
  type ApiRequestOptions,
} from '@/lib/api/client'
import type { ApiResponse } from '@/lib/api/types'
import type { AuthCsrf } from '@/types/authentication'
import { useAuthCsrf } from './use-auth-endpoint'

// Coordinate concurrent browser protocol reads, never mutation state or credentials.
let csrfRead: Promise<string> | null = null

function freshCsrf(refresh: () => Promise<ApiResponse<AuthCsrf> | undefined>) {
  if (!csrfRead) {
    csrfRead = refresh().then((response) => {
      const token = response?.data?.csrf_token
      if (!token) {
        throw new ApiError({ status: 503, code: 'CSRF_UNAVAILABLE', message: 'Unable to prepare a secure request. Try again.' })
      }
      return token
    }).finally(() => { csrfRead = null })
  }
  return csrfRead
}

export function useApiRequest<
  TResponse = unknown,
  TBody extends ApiRequestBody = Record<string, unknown>,
>() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [response, setResponse] = useState<ApiResponse<TResponse> | null>(null)
  const pendingRef = useRef(false)
  const { mutate: refreshCsrf } = useAuthCsrf()

  const clearError = useCallback(() => setError(null), [])

  const execute = useCallback(
    async (
      method: ApiRequestMethod,
      endpoint: string,
      payload?: TBody,
      options?: ApiRequestOptions,
    ) => {
      if (pendingRef.current) {
        throw new ApiError({
          message: 'A request is already in progress.',
          status: 0,
          code: 'REQUEST_IN_PROGRESS',
        })
      }

      pendingRef.current = true
      setLoading(true)
      setError(null)

      try {
        const headers = new Headers(options?.headers)
        if (method.toUpperCase() !== 'GET') {
          headers.set('X-CSRF-Token', await freshCsrf(refreshCsrf))
        }
        const nextResponse = await apiRequest<TResponse>(
          method,
          endpoint,
          payload,
          { ...options, headers },
        )
        setResponse(nextResponse)
        return nextResponse
      } catch (requestError: unknown) {
        const normalizedError =
          requestError instanceof ApiError
            ? requestError
            : new ApiError({
                message: 'The request could not be completed.',
                status: 0,
                code: 'UNKNOWN_REQUEST_ERROR',
                payload: requestError,
              })

        setError(normalizedError)
        throw normalizedError
      } finally {
        pendingRef.current = false
        setLoading(false)
      }
    },
    [refreshCsrf],
  )

  return {
    execute,
    loading,
    error,
    response,
    clearError,
  }
}

export type { ApiRequestOptions, ApiResponse }
