import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import test from 'node:test'
import ts from 'typescript'

const require = createRequire(import.meta.url)
const loaded = new Map()
const reads = []
let readResult = {}
const swr = (key, fetcher, options) => { reads.push({ key, fetcher, options }); return readResult }
function load(file) {
  const resolved = path.resolve(file)
  if (loaded.has(resolved)) return loaded.get(resolved)
  const source = ts.transpileModule(fs.readFileSync(resolved, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText
  const module = { exports: {} }
  const localRequire = (name) => name === 'react' ? { useCallback: (callback) => callback } : name === 'swr' ? swr :
    name.startsWith('@/') ? load(`${name.slice(2)}.ts`) : name.startsWith('.') ?
      load(path.resolve(path.dirname(resolved), `${name}.ts`)) : require(name)
  new Function('require', 'module', 'exports', source)(localRequire, module, module.exports)
  loaded.set(resolved, module.exports)
  return module.exports
}
const { apiFetcher, ApiError } = load('lib/api/client.ts')
const { accountProfileSchema } = load('lib/validations/account-profile.ts')
const profile = { id: 'identity_fixture', email: 'ada@example.com', name: 'Ada James', first_name: 'Ada',
  last_name: 'James', phone: null, role: 'customer', created_at: '2026-11-18T12:00:00Z', updated_at: '2026-11-23T12:00:00Z' }

test('one fetcher preserves the envelope, credentials and validated profile data', async (t) => {
  const body = { success: true, status: 200, message: 'Loaded.', data: profile }
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, '/api/account/profile')
    assert.equal(options.method, 'GET')
    assert.equal(options.credentials, 'include')
    return Response.json(body)
  })
  assert.deepEqual(await apiFetcher('/api/account/profile', accountProfileSchema), body)
})

test('one fetcher preserves server error details', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => Response.json({ success: false, status: 422,
    error: { code: 'VALIDATION_ERROR', message: 'Check your details.', fieldErrors: { phone: ['Invalid phone.'] } },
  }, { status: 422 }))
  await assert.rejects(apiFetcher('/api/account/profile'), (error) => {
    assert.ok(error instanceof ApiError)
    assert.equal(error.message, 'Check your details.')
    assert.deepEqual(error.fieldErrors, { phone: ['Invalid phone.'] })
    return true
  })
})

test('malformed profile data produces a sanitized typed failure', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => Response.json({ success: true, status: 200, data: { private: 'do not echo' } }))
  await assert.rejects(apiFetcher('/api/account/profile', accountProfileSchema), (error) => {
    assert.ok(error instanceof ApiError)
    assert.equal(error.status, 502)
    assert.equal(error.code, 'INVALID_API_RESPONSE')
    assert.equal(error.message.includes('do not echo'), false)
    return true
  })
})

test('shared read supports null keys, initial data and per-feature SWR options', () => {
  const { useApiRead } = load('hooks/use-api-read.ts')
  readResult = { data: { success: true, status: 200, data: [] }, mutate: () => {} }
  assert.equal(useApiRead(null, { initialData: [], revalidateOnFocus: false }), readResult)
  const read = reads.at(-1)
  assert.equal(read.key, null)
  assert.equal(read.options.revalidateOnFocus, false)
  assert.deepEqual(read.options.fallbackData, { success: true, status: 200, data: [] })
})

test('home fallback and profile keys stay stable; identity and admin policies stay separate', () => {
  const home = load('hooks/use-home-endpoint.ts')
  home.useHomeCollections([])
  assert.equal(reads.at(-1).key, '/api/catalog/categories')
  assert.equal(reads.at(-1).options.shouldRetryOnError, false)
  home.useHomeProducts()
  assert.equal(reads.at(-1).key, '/api/catalog/products?sort=newest&page=1&page_size=8')
  const account = load('hooks/use-account-endpoint.ts')
  account.useAccountProfile()
  assert.equal(reads.at(-1).key, '/api/account/profile')
  load('hooks/use-user-endpoint.ts').useCurrentProfile()
  const identity = reads.at(-1)
  assert.equal(identity.key, '/api/identity/me')
  assert.equal(identity.options.shouldRetryOnError({ status: 401 }), false)
  assert.equal(identity.options.shouldRetryOnError({ status: 503 }), true)
  assert.equal(identity.options.errorRetryCount, 2)
  const admin = load('hooks/use-admin-endpoint.ts')
  admin.useAdminCheck(false)
  assert.equal(reads.at(-1).key, null)
  admin.useAdminCategories()
  assert.equal(reads.at(-1).key, '/api/admin/categories')
  admin.useAdminCatalogRecords('products', 2)
  assert.equal(reads.at(-1).key, '/api/admin/products?page=2&page_size=24')
  admin.useAdminCatalogRecord('categories')
  assert.equal(reads.at(-1).key, null)
})

test('CSRF remains on-demand and profile schema validation uses the shared fetcher', async (t) => {
  load('hooks/use-auth-endpoint.ts').useAuthCsrf()
  assert.equal(reads.at(-1).key, '/api/auth/csrf')
  for (const option of ['revalidateOnMount', 'revalidateOnFocus', 'revalidateOnReconnect', 'shouldRetryOnError']) {
    assert.equal(reads.at(-1).options[option], false)
  }
  load('hooks/use-account-endpoint.ts').useAccountProfile()
  t.mock.method(globalThis, 'fetch', async () => Response.json({ success: true, status: 200, data: profile }))
  assert.deepEqual((await reads.at(-1).fetcher('/api/account/profile')).data, profile)
})

test('location adapters retain their public shapes, conditional reads and encoded keys', () => {
  const locations = load('hooks/use-location-options.ts')
  const options = [{ name: 'Nigeria' }]
  readResult = { data: { success: true, status: 200, data: options }, isLoading: false, error: undefined }
  assert.equal(locations.useCountries().countries, options)
  assert.equal(reads.at(-1).key, '/api/countries')
  assert.equal(locations.useStates().loading, false)
  assert.equal(reads.at(-1).key, null)
  assert.equal(locations.useCities('Nigeria', 'Akwa Ibom').cities, options)
  assert.equal(reads.at(-1).key, '/api/cities?country=Nigeria&state=Akwa%20Ibom')
  readResult = { isLoading: true }
  assert.deepEqual(locations.useStates().states, [])
  assert.equal(locations.useStates().loading, false)
})
