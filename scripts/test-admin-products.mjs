import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { createRequire } from 'node:module'
import ts from 'typescript'

const require = createRequire(import.meta.url)
const modules = new Map()
const reads = []
function load(file) {
  const resolved = path.resolve(file)
  if (modules.has(resolved)) return modules.get(resolved)
  const source = ts.transpileModule(fs.readFileSync(resolved, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText
  const compiled = { exports: {} }
  const localRequire = (name) => name === 'react' ? { useCallback: (callback) => callback } : name === 'swr' ?
    (key, fetcher, options) => { reads.push({ key, options }); return {} } :
    name.startsWith('@/') ? load(`${name.slice(2)}.ts`) : name.startsWith('.') ?
      load(path.resolve(path.dirname(resolved), `${name}.ts`)) : require(name)
  new Function('require', 'module', 'exports', source)(localRequire, compiled, compiled.exports)
  modules.set(resolved, compiled.exports)
  return compiled.exports
}

const { productFormSchema, productFormValues, productPayload } = load('lib/validations/admin-product.ts')
const { validateProductImages } = load('lib/products/media.ts')
const { adminProductsQuery } = load('lib/products/admin-query.ts')
const { useAdminProductsUi } = load('stores/admin-products-ui.ts')
const { createSlug } = load('lib/slug.ts')
const valid = () => ({ ...productFormValues(), name: 'Gold pendant', slug: 'gold-pendant',
  description: 'A sanitized description.', category_id: '00000000-0000-4000-8000-000000000001', price: '100.50' })

test('draft defaults, slug normalization and money payload preserve the API contract', () => {
  assert.equal(productFormValues().status, 'draft')
  assert.equal(createSlug(' Gold Rings & Chains! '), 'gold-rings-and-chains')
  const values = productFormSchema.parse({ ...valid(), details: ' Detail one \n\nDetail two', note: '  ' })
  const payload = productPayload(values)
  assert.equal(payload.price, '100.50')
  assert.equal(payload.label, null)
  assert.equal(payload.note, null)
  assert.equal(payload.gold_weight_grams, null)
  assert.deepEqual(payload.details, ['Detail one', 'Detail two'])
})

test('fixed pricing remains fixed when karats are selected; gold pricing requires weight and karats', () => {
  const fixed = productFormSchema.parse({ ...valid(), gold_karats: ['18k'] })
  assert.equal(productPayload(fixed).is_gold_karat_priced, false)
  assert.equal(productPayload(fixed).price, '100.50')
  assert.equal(productFormSchema.safeParse({ ...valid(), is_gold_karat_priced: true }).success, false)
  const gold = productFormSchema.parse({ ...valid(), price: '', is_gold_karat_priced: true,
    pricing_type: 'starting_from', gold_weight_grams: '2.125', making_charge: '50.25', gold_karats: ['18k', '24k'] })
  assert.equal(productPayload(gold).price, null)
  assert.equal(productPayload(gold).making_charge, '50.25')
  assert.equal(productFormSchema.safeParse({ ...gold, gold_karats: ['18k'] }).success, false)
})

test('validation rejects invalid price, stock, options, legacy presentation and missing publication images', () => {
  for (const change of [{ price: '0' }, { price: 'NaN' }, { price: '1.234' }, { stock: -1 },
    { stock: 1.5 }, { colors: ['purple'] }, { sizes: ['s', 's'] }, { pricing_type: '' },
    { pricing_type: 'price_on_request' }, { status: 'active' }]) {
    assert.equal(productFormSchema.safeParse({ ...valid(), ...change }).success, false)
  }
})

test('images keep order and only send completed IDs/alt text; edits preserve slugs and independent arrays', () => {
  const first = { media_id: '00000000-0000-4000-8000-000000000001', url: 'https://storage.example.com/first.jpg', alt: 'First' }
  const second = { ...first, media_id: '00000000-0000-4000-8000-000000000002', alt: 'Second' }
  const values = productFormSchema.parse({ ...valid(), status: 'active', images: [second, first] })
  assert.deepEqual(productPayload(values).images, [{ media_id: second.media_id, alt: 'Second' }, { media_id: first.media_id, alt: 'First' }])
  assert.equal(productFormSchema.safeParse({ ...values, images: [{ ...first, alt: '' }] }).success, false)
  const saved = { ...productPayload(values), slug: 'manual-slug', images: [first], sizes: ['s'] }
  const draft = productFormValues(saved)
  assert.equal(draft.slug, 'manual-slug')
  draft.sizes.push('m')
  assert.deepEqual(saved.sizes, ['s'])
  assert.equal(productFormValues({ ...saved, pricing_type: 'price_on_request' }).pricing_type, '')
})

test('upload validation enforces batch count, replacement count, MIME and per-file size', () => {
  const file = { type: 'image/png', size: 5 * 1024 * 1024 }
  assert.doesNotThrow(() => validateProductImages([file], 7))
  assert.doesNotThrow(() => validateProductImages([file], 8, true))
  for (const [files, count, replace] of [[[file, file], 7, false], [[file, file], 2, true],
    [[{ ...file, type: 'image/svg+xml' }], 0, false], [[{ ...file, size: file.size + 1 }], 0, false],
    [[{ ...file, size: 0 }], 0, false]]) assert.throws(() => validateProductImages(files, count, replace))
})

test('UI store resets pagination on filters and clears on logout, without persisting server data', () => {
  useAdminProductsUi.getState().setPage(3)
  useAdminProductsUi.getState().setFilter('status', 'draft')
  assert.equal(useAdminProductsUi.getState().page, 1)
  useAdminProductsUi.getState().setPage(0)
  assert.equal(useAdminProductsUi.getState().page, 1)
  useAdminProductsUi.getState().setFilter('search', 'private search')
  load('lib/auth/client-session.ts').resetSessionUi()
  assert.equal(useAdminProductsUi.getState().search, '')
  assert.equal(useAdminProductsUi.getState().status, '')
  assert.equal('products' in useAdminProductsUi.getState(), false)
})

test('admin hooks use encoded server-side filters, stable pagination and a null new-product key', () => {
  const filters = { ...useAdminProductsUi.getState(), search: 'Gold & rings', category: 'gold-rings', status: 'active', label: 'featured', availability: 'false', page: 2 }
  const query = adminProductsQuery(filters)
  const parameters = new URLSearchParams(query)
  assert.equal(parameters.get('q'), 'Gold & rings')
  assert.equal(parameters.get('in_stock'), 'false')
  assert.equal(parameters.get('page_size'), '24')
  assert.equal(parameters.get('page'), '2')
  const hooks = load('hooks/use-admin-endpoint.ts')
  hooks.useAdminProducts(query)
  assert.equal(reads.at(-1).key, `/api/admin/products?${query}`)
  assert.equal(reads.at(-1).options.keepPreviousData, true)
  hooks.useAdminProduct(null)
  assert.equal(reads.at(-1).key, null)
  hooks.useAdminProduct('opaque-id')
  assert.equal(reads.at(-1).key, '/api/admin/products/opaque-id')
})
