import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import test from 'node:test'
import ts from 'typescript'

const require = createRequire(import.meta.url)
const loaded = new Map()
function load(file) {
  const resolved = path.resolve(file)
  if (loaded.has(resolved)) return loaded.get(resolved)
  const source = ts.transpileModule(fs.readFileSync(resolved, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const module = { exports: {} }
  const localRequire = (name) => name === 'server-only' ? {} : name.startsWith('@/') ? load(`${name.slice(2)}.ts`) :
    name.startsWith('.') ? load(path.resolve(path.dirname(resolved), `${name}.ts`)) : require(name)
  new Function('require', 'module', 'exports', source)(localRequire, module, module.exports)
  loaded.set(resolved, module.exports)
  return module.exports
}
const { getBackendPath, proxyBackendRequest } = load('lib/api/backend-proxy.ts')
const { loginDestination, verifiedSessionRole } = load('lib/auth/login-destination.ts')
process.env.BACKEND_URL = 'http://backend.invalid:8000'

test('allowlist accepts only the selected auth methods and callback path', () => {
  assert.equal(getBackendPath('GET', 'account/profile'), '/v1/account/profile')
  assert.equal(getBackendPath('PATCH', 'account/profile'), '/v1/account/profile')
  for (const method of ['POST', 'PUT', 'DELETE']) assert.equal(getBackendPath(method, 'account/profile'), null)
  assert.equal(getBackendPath('POST', 'auth/login'), '/v1/auth/login')
  assert.equal(getBackendPath('POST', 'auth/signup'), '/v1/auth/signup')
  assert.equal(getBackendPath('GET', 'auth/csrf'), '/v1/auth/csrf')
  assert.equal(getBackendPath('POST', 'auth/email-verification/confirm'), '/v1/auth/email-verification/confirm')
  assert.equal(getBackendPath('POST', 'auth/password-reset/request'), '/v1/auth/password-reset/request')
  assert.equal(getBackendPath('GET', 'auth/password-reset/request'), null)
  assert.equal(getBackendPath('POST', 'auth/password-reset/confirm'), '/v1/auth/password-reset/confirm')
  assert.equal(getBackendPath('GET', 'auth/password-reset/confirm'), null)
  assert.equal(getBackendPath('GET', 'v1/auth/google/callback'), '/v1/auth/google/callback')
  for (const [method, endpoint] of [['GET', 'auth/login'], ['GET', 'auth/signup'],
    ['POST', 'v1/auth/google/callback'], ['POST', 'auth/google/start/extra'], ['DELETE', 'admin/categories/invalid']]) {
    assert.equal(getBackendPath(method, endpoint), null)
  }
})

test('profile proxy requires a session and preserves PATCH field errors and cookies', async (t) => {
  const fetch = t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url.pathname, '/v1/account/profile')
    assert.equal(options.headers.get('cookie'), 'fmluxe_session=opaque; fmluxe_csrf=csrf')
    assert.equal(options.headers.get('x-csrf-token'), 'csrf')
    return Response.json({ success: false, status: 422, error: {
      code: 'VALIDATION_ERROR', message: 'The request contains invalid fields.', fieldErrors: { phone: ['Invalid phone.'] },
    } }, { status: 422 })
  })
  const guest = await proxyBackendRequest(new Request('http://localhost:4100/api/account/profile'), 'GET', '/v1/account/profile')
  assert.equal(guest.status, 401)
  assert.equal(fetch.mock.callCount(), 0)
  const response = await proxyBackendRequest(new Request('http://localhost:4100/api/account/profile', {
    method: 'PATCH', headers: { Origin: 'http://localhost:4100', Cookie: 'fmluxe_session=opaque; fmluxe_csrf=csrf',
      'X-CSRF-Token': 'csrf' }, body: '{"phone":"bad"}',
  }), 'PATCH', '/v1/account/profile')
  assert.equal(response.status, 422)
  assert.deepEqual((await response.json()).error.fieldErrors, { phone: ['Invalid phone.'] })
})

test('profile changes send only contact edits and null clears; validation rejects invalid values', () => {
  const { changedProfileFields, profileFormSchema } = load('lib/validations/account-profile.ts')
  const profile = { first_name: 'Ada', last_name: 'James', phone: '+2348012345678' }
  assert.deepEqual(changedProfileFields({ first_name: ' Ada ', last_name: 'James', phone: '' }, profile), { phone: null })
  assert.deepEqual(changedProfileFields({ ...profile }, profile), {})
  assert.equal(profileFormSchema.safeParse({ first_name: '', last_name: '', phone: '' }).success, true)
  assert.equal(profileFormSchema.safeParse({ ...profile, phone: 'letters' }).success, false)
  assert.equal(profileFormSchema.safeParse({ ...profile, first_name: 'A'.repeat(101) }).success, false)
})

test('login forwards CSRF and backend cookies; preserves distinct HttpOnly cookies', async (t) => {
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url.pathname, '/v1/auth/login')
    assert.equal(options.headers.get('cookie'), 'fmluxe_csrf=csrf')
    assert.equal(options.headers.get('x-csrf-token'), 'csrf')
    assert.equal(options.headers.get('origin'), 'http://localhost:4100')
    assert.equal(options.headers.get('authorization'), null)
    assert.equal(options.cache, 'no-store')
    assert.equal(new TextDecoder().decode(options.body), '{"email":"qa@example.com","password":"private"}')
    return new Response('{"success":true}', { status: 200, headers: [
      ['Content-Type', 'application/json'], ['Set-Cookie', 'fmluxe_session=opaque; HttpOnly; Path=/'],
      ['Set-Cookie', 'fmluxe_csrf=next; HttpOnly; Path=/'],
    ] })
  })
  const response = await proxyBackendRequest(new Request('http://localhost:4100/api/auth/login', {
    method: 'POST', headers: { Origin: 'http://localhost:4100', Cookie: 'sdk=ignore; fmluxe_csrf=csrf',
      Authorization: 'Bearer ignored', 'X-CSRF-Token': 'csrf' },
    body: '{"email":"qa@example.com","password":"private"}',
  }), 'POST', '/v1/auth/login')
  assert.equal(response.status, 200)
  assert.equal(response.headers.getSetCookie().length, 2)
  assert.equal(response.headers.get('cache-control'), 'private, no-store')
})

test('cross-origin writes and protected requests without cookies never reach backend', async (t) => {
  const fetch = t.mock.method(globalThis, 'fetch', () => { throw Error('Must not run') })
  assert.equal((await proxyBackendRequest(new Request('http://localhost:4100/api/auth/login', {
    method: 'POST', headers: { Origin: 'https://evil.invalid' },
  }), 'POST', '/v1/auth/login')).status, 403)
  assert.equal((await proxyBackendRequest(new Request('http://localhost:4100/api/admin/categories', {
    headers: { Authorization: 'Bearer ignored' },
  }), 'GET', '/v1/admin/categories')).status, 401)
  assert.equal(fetch.mock.callCount(), 0)
})

test('backend permission failures are preserved, not treated as successful empty data', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => Response.json({ error: { code: 'FORBIDDEN' } }, { status: 403 }))
  const response = await proxyBackendRequest(new Request('http://localhost:4100/api/admin/categories', {
    headers: { Cookie: 'fmluxe_session=customer' },
  }), 'GET', '/v1/admin/categories')
  assert.equal(response.status, 403)
  assert.equal((await response.json()).error.code, 'FORBIDDEN')
})

test('Google callback preserves success redirect and sanitizes failure URLs', async (t) => {
  const mock = t.mock.method(globalThis, 'fetch', async () => new Response(null, {
    status: 303, headers: { Location: 'http://localhost:4100/login', 'Set-Cookie': 'fmluxe_session=opaque; HttpOnly' },
  }))
  const request = () => new Request('http://localhost:4100/api/v1/auth/google/callback?state=private&neon_auth_session_verifier=private')
  let response = await proxyBackendRequest(request(), 'GET', '/v1/auth/google/callback')
  assert.equal(response.status, 303)
  assert.equal(response.headers.get('location'), 'http://localhost:4100/login')
  assert.equal(response.headers.getSetCookie().length, 1)
  mock.mock.mockImplementation(async () => Response.json({ error: { message: 'private' } }, { status: 400 }))
  response = await proxyBackendRequest(request(), 'GET', '/v1/auth/google/callback')
  assert.equal(response.status, 303)
  assert.equal(response.headers.get('location'), 'http://localhost:4100/login?error=google_sign_in')
  assert.equal(response.headers.get('referrer-policy'), 'no-referrer')
})

test('unavailable upstream returns a sanitized service failure', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => { throw Error('private backend URL') })
  const response = await proxyBackendRequest(new Request('http://localhost:4100/api/auth/csrf'), 'GET', '/v1/auth/csrf')
  assert.equal(response.status, 503)
  assert.equal((await response.json()).error.code, 'BACKEND_UNAVAILABLE')
})

test('only verified backend roles select protected destinations', () => {
  assert.equal(loginDestination('customer'), '/')
  assert.equal(loginDestination('admin'), '/admin/categories')
  assert.equal(loginDestination('super_admin'), '/admin/categories')
  assert.equal(verifiedSessionRole({ identity: { email_verified: false }, profile: { role: 'admin' } }), null)
  assert.equal(verifiedSessionRole({ identity: { email_verified: true }, profile: { role: 'invented' } }), null)
})

test('session guard validates cookies with FastAPI and fails closed on outages', async (t) => {
  const { readSessionRole } = load('lib/auth/backend-session.ts')
  const mock = t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url.pathname, '/v1/auth/session')
    assert.equal(options.headers.Cookie, 'fmluxe_session=opaque')
    return Response.json({ data: { identity: { email_verified: true }, profile: { role: 'super_admin' } } })
  })
  assert.equal(await readSessionRole(null), null)
  assert.equal(mock.mock.callCount(), 0)
  assert.equal(await readSessionRole('sdk=ignored; fmluxe_session=opaque'), 'super_admin')
  mock.mock.mockImplementation(async () => new Response(null, { status: 401 }))
  assert.equal(await readSessionRole('fmluxe_session=opaque'), null)
  mock.mock.mockImplementation(async () => new Response(null, { status: 503 }))
  await assert.rejects(readSessionRole('fmluxe_session=opaque'), /session could not be checked/)
})
