export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export type ApiResponse<TData = unknown> = {
  success: boolean
  status: number
  data?: TData
  error?: string
  message?: string
}

export type ApiHandlerContext<TBody = unknown> = {
  request: Request
  method: ApiMethod
  endpoint: string
  body?: TBody
}

export type ApiHandler<TBody = unknown, TData = unknown> = (
  context: ApiHandlerContext<TBody>,
) => ApiResponse<TData> | Promise<ApiResponse<TData>>
