import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import test from 'node:test'
import ts from 'typescript'

const require = createRequire(import.meta.url)
const module = { exports: {} }
const compiled = ts.transpileModule(fs.readFileSync('stores/hooks/use-toast.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText
new Function('require', 'module', 'exports', compiled)(require, module, module.exports)
const store = module.exports.useToastStore

test('toast variants normalize legacy errors and have an explicit reset', () => {
  store.getState().reset()
  store.getState().addToast('Saved', 'success')
  store.getState().addToast('Watch out', 'warning')
  store.getState().addToast('Failed', 'error')
  store.getState().addToast('FYI', 'info')
  assert.deepEqual(store.getState().toasts.map((toast) => toast.type), ['success', 'warning', 'failure'])
  assert.equal(store.getState().queue[0].type, 'info')
  store.getState().reset()
  assert.equal(store.getState().toasts.length + store.getState().queue.length, 0)
})

test('dismissal allows an exit transition and promotes queued notifications only afterward', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  for (const text of ['One', 'Two', 'Three', 'Four']) store.getState().addToast(text)
  const id = store.getState().toasts[0].id
  store.getState().removeToast(id)
  assert.equal(store.getState().toasts[0].open, false)
  assert.equal(store.getState().toasts.length, 3)
  t.mock.timers.tick(200)
  assert.deepEqual(store.getState().toasts.map((toast) => toast.text), ['Two', 'Three', 'Four'])
  assert.equal(store.getState().queue.length, 0)
  store.getState().reset()
})
