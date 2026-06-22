import { fail, ok } from './response'
import type { ApiHandler, ApiMethod } from './types'
import { getCities, getCountries, getStates } from '@/lib/locations/location-data'

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
    countries: async () => {
      try {
        return ok(await getCountries())
      } catch {
        return fail('Unable to load countries', 502)
      }
    },
    states: async ({ request }) => {
      const { searchParams } = new URL(request.url)

      try {
        return ok(await getStates(searchParams.get('country')))
      } catch {
        return fail('Unable to load states', 502)
      }
    },
    cities: async ({ request }) => {
      const { searchParams } = new URL(request.url)

      try {
        return ok(
          await getCities(searchParams.get('country'), searchParams.get('state')),
        )
      } catch {
        return fail('Unable to load cities', 502)
      }
    },
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
