import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import test from 'node:test'
import ts from 'typescript'

const require = createRequire(import.meta.url)
const loaded = new Map()
const reads = []

function load(file) {
  const resolved = path.resolve(file)
  if (loaded.has(resolved)) return loaded.get(resolved)

  const source = ts.transpileModule(fs.readFileSync(resolved, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText
  const compiled = { exports: {} }
  const localRequire = (name) => name === 'server-only' ? {} : name === 'react' ?
    { cache: (callback) => callback, useCallback: (callback) => callback } : name === 'next/navigation' ?
      { unstable_rethrow: (error) => { if (error?.digest?.startsWith('NEXT_')) throw error } } :
      name === 'swr' ? (key, fetcher, options) => { reads.push({ key, options }); return {} } :
      name.startsWith('@/') ? load(`${name.slice(2)}.ts`) : name.startsWith('.') ?
        load(path.resolve(path.dirname(resolved), `${name}.ts`)) : require(name)

  new Function('require', 'module', 'exports', source)(localRequire, compiled, compiled.exports)
  loaded.set(resolved, compiled.exports)
  return compiled.exports
}

const { parseBrowseQuery, browseHref, clearBrowseFilters, activeBrowseFilters } = load('lib/catalog/browse-query.ts')

test('query parsing preserves existing supported filters and rejects invalid URL values', () => {
  assert.deepEqual(parseBrowseQuery({}), { q: '', category: '', sort: 'newest', page: '1' })
  assert.deepEqual(parseBrowseQuery({ q: ['ambiguous'], category: ['ambiguous'], sort: 'unsupported', page: '-1' }),
    { q: '', category: '', sort: 'newest', page: '1' })
  const query = parseBrowseQuery({ q: 'a'.repeat(120), category: 'b'.repeat(200), sort: 'price_desc', page: '3' })
  assert.equal(query.q.length, 100)
  assert.equal(query.category.length, 180)
  assert.equal(query.sort, 'price_desc')
  assert.equal(query.page, '3')
})

test('both page URLs retain filters and sorting across pages without introducing API parameters', () => {
  const query = parseBrowseQuery({ q: 'Gold & rings', category: 'gold-rings', sort: 'name', page: '2' })

  for (const route of ['/shop', '/new-arrivals']) {
    const url = new URL(browseHref(route, { ...query, page: '3' }), 'https://example.invalid')
    assert.equal(url.pathname, route)
    assert.deepEqual(Object.fromEntries(url.searchParams), { ...query, page: '3' })
    assert.equal(url.searchParams.has('label'), false)
  }

  assert.equal(activeBrowseFilters(query), 2)
  assert.deepEqual(clearBrowseFilters(query), { q: '', category: '', sort: 'name', page: '1' })
  assert.equal(activeBrowseFilters(clearBrowseFilters(query)), 0)
})

test('catalog dialog state contains no records or query data and resets at logout', () => {
  const { useCatalogBrowseUi } = load('stores/catalog-browse-ui.ts')
  const store = useCatalogBrowseUi.getState()

  assert.deepEqual(Object.keys(store).sort(), ['filtersOpen', 'reset', 'setFiltersOpen'])
  store.setFiltersOpen(true)
  assert.equal(useCatalogBrowseUi.getState().filtersOpen, true)
  load('lib/auth/client-session.ts').resetSessionUi()
  assert.equal(useCatalogBrowseUi.getState().filtersOpen, false)
})

test('both pages share existing FastAPI reads and SWR keys with graceful partial failures', async (t) => {
  const previousOrigin = process.env.BACKEND_URL
  process.env.BACKEND_URL = 'https://backend.example.invalid'
  let failCategories = false
  let failProducts = false
  const requests = []

  t.mock.method(globalThis, 'fetch', async (url, options) => {
    requests.push(url.pathname + url.search)
    assert.equal(options.cache, 'no-store')
    const category = url.pathname.endsWith('/categories')

    if (category ? failCategories : failProducts) {
      return Response.json({ success: false, error: { message: 'Catalog unavailable.' } }, { status: 503 })
    }

    return Response.json({ success: true, status: 200,
      data: category ? [] : { items: [], total: 0, page: 1, page_size: 24 } })
  })

  try {
    const { readBrowseContent } = load('lib/catalog/browse.ts')
    const content = await readBrowseContent(Promise.resolve({ q: 'gold', category: 'rings' }))
    assert.deepEqual(requests, ['/v1/catalog/products?q=gold&category=rings&sort=newest&page=1', '/v1/catalog/categories'])

    load('hooks/use-catalog-endpoint.ts').useCatalogProducts(new URLSearchParams(content.query).toString(), content.serverProductResults)
    assert.equal(reads.at(-1).key, requests[0].replace('/v1/', '/api/'))
    assert.deepEqual(reads.at(-1).options.fallbackData.data, content.serverProductResults)

    failCategories = true
    const partial = await readBrowseContent(Promise.resolve({}))
    assert.equal(partial.serverProductResults.total, 0)
    assert.equal(partial.categoriesLoadError, 'Catalog unavailable.')

    failProducts = true
    const failed = await readBrowseContent(Promise.resolve({}))
    assert.equal(failed.serverProductResults, undefined)
    assert.equal(failed.productsLoadError, 'Catalog unavailable.')
  } finally {
    if (previousOrigin === undefined) delete process.env.BACKEND_URL
    else process.env.BACKEND_URL = previousOrigin
  }
})
