import { ok } from './response'
import type { ApiHandler, ApiMethod } from './types'

type HandlerMap = Partial<Record<ApiMethod, Record<string, ApiHandler>>>

const handlers: HandlerMap = {
  GET: {
    health: () =>
      ok(
        {
          service: '0210 Gold API',
          timestamp: new Date().toISOString(),
        },
        { message: 'API is healthy' },
      ),
  },
  POST: {
    contact: ({ body }) =>
      ok(
        { received: body ?? null },
        { message: 'Contact request received' },
      ),
    'personal-shopper-request': ({ body }) =>
      ok(
        { received: body ?? null },
        { message: 'Personal shopper request received' },
      ),
  },
}

export function getApiHandler(method: ApiMethod, endpoint: string) {
  return handlers[method]?.[endpoint]
}
