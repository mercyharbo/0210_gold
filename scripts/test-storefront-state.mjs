import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import test from 'node:test'
import ts from 'typescript'

const require = createRequire(import.meta.url)

function compile(file, loader = require) {
  const compiledModule = { exports: {} }
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText

  new Function('require', 'module', 'exports', source)(loader, compiledModule, compiledModule.exports)
  return compiledModule.exports
}

const store = compile('stores/storefront-navigation.ts').useStorefrontNavigation
const navigation = (selector) => selector(store.getState())
navigation.getState = store.getState

let pathname = '/'
let effects = []
let cartItems = []
let scrollState = false
let hydration
const subscribe = () => () => {}
const values = new Map()
const listeners = new Map()

const react = {
  useCallback: (callback) => callback,
  useEffect: (callback) => effects.push(callback),
  useState: () => [false, (value) => { scrollState = value }],
  useSyncExternalStore: (subscription, client, server) => {
    hydration = { subscription, client: client(), server: server() }
    return hydration.client
  },
}

function loader(name) {
  if (name === 'react') return react
  if (name === 'next/navigation') return { usePathname: () => pathname }
  if (name === 'zustand/react/shallow') return { useShallow: (selector) => selector }
  if (name === '@/stores/storefront-navigation') return { useStorefrontNavigation: navigation }
  if (name === './use-cart') return { useCartStore: { subscribe, getState: () => ({ items: cartItems }) } }
  return require(name)
}

const hooks = compile('stores/hooks/use-storefront-navigation.ts', loader)
const { useStoreHeader } = compile('stores/hooks/use-store-header.ts', loader)

function browser(t) {
  const previousWindow = globalThis.window
  const previousStorage = globalThis.sessionStorage

  effects = []
  values.clear()
  listeners.clear()
  store.getState().reset()

  globalThis.window = {
    setTimeout: (...args) => setTimeout(...args),
    clearTimeout: (id) => clearTimeout(id),
    scrollY: 0,
    innerHeight: 900,
    addEventListener: (name, listener) => listeners.set(name, listener),
    removeEventListener: (name) => listeners.delete(name),
  }
  globalThis.sessionStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  }

  t.after(() => {
    if (previousWindow === undefined) delete globalThis.window
    else globalThis.window = previousWindow
    if (previousStorage === undefined) delete globalThis.sessionStorage
    else globalThis.sessionStorage = previousStorage
    store.getState().reset()
  })
}

test('navigation facades select their purpose-specific state and keep reset behavior', () => {
  store.getState().reset()
  store.getState().setMenuOpen(true)

  assert.deepEqual(Object.keys(hooks.useStoreMenu()), ['menuOpen', 'reset'])
  assert.equal(hooks.useStoreMenu().menuOpen, true)
  assert.deepEqual(Object.keys(hooks.useStoreSearch()), ['searchOpen', 'setSearchOpen'])
  assert.deepEqual(Object.keys(hooks.useStoreFooter()), ['setNewsletterOpen'])

  hooks.useStoreSearch().setSearchOpen(true)
  hooks.useStoreFooter().setNewsletterOpen(true)
  hooks.useStoreMenu().reset()

  assert.equal(hooks.useStoreMenu().menuOpen, false)
  assert.equal(hooks.useStoreSearch().searchOpen, false)
  assert.equal(store.getState().newsletterOpen, false)
})

test('header keeps a zero server cart snapshot, reads current totals and cleans scroll subscriptions', (t) => {
  browser(t)
  pathname = '/'
  cartItems = [{ quantity: 2 }, { quantity: 3 }]
  store.getState().setMenuOpen(true)

  const header = useStoreHeader()
  assert.equal(header.home, true)
  assert.equal(header.totalItems, 5)
  assert.deepEqual(hydration, { subscription: subscribe, client: 5, server: 0 })

  effects[0]()
  assert.equal(store.getState().menuOpen, false)

  const cleanup = effects[1]()
  assert.equal(scrollState, false)
  window.scrollY = 818
  listeners.get('scroll')()
  assert.equal(scrollState, true)
  cleanup()
  assert.equal(listeners.size, 0)
})

test('newsletter checks fresh overlay state at the timeout and preserves seen/dismiss behavior', (t) => {
  browser(t)
  t.mock.timers.enable({ apis: ['setTimeout'] })
  pathname = '/'

  hooks.useStoreNewsletter(true)
  let cleanup = effects.pop()()
  store.getState().setMenuOpen(true)
  t.mock.timers.tick(8000)
  assert.equal(store.getState().newsletterOpen, false)
  assert.equal(values.size, 0)
  cleanup()

  store.getState().reset()
  const newsletter = hooks.useStoreNewsletter(true)
  cleanup = effects.pop()()
  t.mock.timers.tick(7999)
  assert.equal(store.getState().newsletterOpen, false)
  t.mock.timers.tick(1)
  assert.equal(store.getState().newsletterOpen, true)
  assert.equal(values.get('fm-luxe-newsletter-seen'), '1')
  newsletter.handleNewsletterOpenChange(false)
  assert.equal(store.getState().newsletterOpen, false)
  cleanup()
})

test('newsletter respects disabled, profile, already-seen and cancelled timers', (t) => {
  browser(t)
  t.mock.timers.enable({ apis: ['setTimeout'] })

  for (const [route, autoOpen, seen] of [['/', false, false], ['/profile/orders', true, false], ['/', true, true]]) {
    pathname = route
    values.clear()
    if (seen) values.set('fm-luxe-newsletter-seen', '1')
    hooks.useStoreNewsletter(autoOpen)
    assert.equal(effects.pop()(), undefined)
    t.mock.timers.tick(8000)
    assert.equal(store.getState().newsletterOpen, false)
  }

  values.clear()
  pathname = '/'
  hooks.useStoreNewsletter(true)
  effects.pop()()()
  t.mock.timers.tick(8000)
  assert.equal(store.getState().newsletterOpen, false)
})
