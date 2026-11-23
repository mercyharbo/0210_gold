import type { ApiErrorDetail } from './types'

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

function isErrorPayload(payload: unknown): payload is ErrorPayload {
  return typeof payload === 'object' && payload !== null
}

export function getErrorDetails(response: Response, payload: unknown) {
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

