import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import ts from 'typescript'
import { NextRequest, NextResponse } from 'next/server.js'

function profileProxy(readSessionRole) {
  const source = ts.transpileModule(fs.readFileSync('proxy.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const modules = {
    'next/server': { NextResponse },
    '@/lib/supabase/proxy': {},
    '@/lib/auth/provider': {},
    '@/lib/auth/neon-proxy': {},
    '@/lib/auth/backend-session': { readSessionRole },
    '@/lib/auth/login-destination': {},
    '@/lib/site/removed-services': {},
  }
  const module = { exports: {} }
  new Function('require', 'module', 'exports', source)((name) => {
    assert.ok(name in modules, `Unexpected dependency: ${name}`)
    return modules[name]
  }, module, module.exports)
  return module.exports.proxy
}

for (const role of [null, 'customer', 'admin', 'super_admin']) {
  test(`profile route validates the backend session: ${role ?? 'guest'}`, async () => {
    const proxy = profileProxy(async (cookie) => {
      assert.equal(cookie, 'fmluxe_session=fixture')
      return role
    })
    const response = await proxy(new NextRequest('http://localhost:4100/profile', {
      headers: { Cookie: 'fmluxe_session=fixture' },
    }))
    assert.equal(response.status, role ? 200 : 307)
    assert.equal(response.headers.get('location'), role ? null : 'http://localhost:4100/login')
  })
}

test('profile session service failure returns 503 without granting page access', async () => {
  const proxy = profileProxy(async () => { throw new Error('Service unavailable') })
  const response = await proxy(new NextRequest('http://localhost:4100/profile'))
  assert.equal(response.status, 503)
  assert.equal(response.headers.get('cache-control'), 'no-store')
})
