/* Opt-in development QA. Browser plugin not available; use installed Playwright. */
import { createRequire } from 'node:module'
import { randomBytes } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import assert from 'node:assert/strict'
const loadModule = createRequire(import.meta.url)
const { chromium } = loadModule(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright')
const prefix = `phase3-browser-${randomBytes(8).toString('hex')}`
const email = `${prefix}@example.invalid`
const password = randomBytes(24).toString('base64url')
const base = process.env.CATALOG_TEST_URL || 'http://localhost:4100'
const python = path.resolve('backend/.venv/Scripts/python.exe')
const fixture = (action) =>
  JSON.parse(
    execFileSync(python, ['tests/browser_fixture.py', action, email], {
      cwd: path.resolve('backend'),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }),
  )
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=',
  'base64',
)

;(async () => {
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE })
  let identity
  let page
  try {
    page = await browser.newPage()
    page.setDefaultTimeout(60000)
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto(`${base}/signup`)
    await page.getByLabel('Full name').fill('Browser QA')
    await page.getByLabel('Email address', { exact: true }).fill(email)
    await page.getByLabel('Password', { exact: true }).fill(password)
    const signup = page.waitForResponse((response) => response.url().endsWith('/api/auth/sign-up/email'))
    await page.getByRole('button', { name: 'Create account', exact: true }).click()
    assert.equal((await signup).status(), 200, 'Temporary signup')
    identity = fixture('setup').id
    await page.goto(`${base}/login`)
    await page.getByLabel('Email address', { exact: true }).fill(email)
    await page.getByLabel('Password', { exact: true }).fill(password)
    await page.getByRole('button', { name: 'Sign in', exact: true }).click()
    await page.waitForURL('**/auth/preview/account')
    await page.goto(`${base}/admin/categories/new`)
    await page.getByRole('button', { name: 'Save changes' }).click()
    await page.locator('#name-error').waitFor({ state: 'attached' })
    assert(await page.locator('#name-error').isVisible(), 'Inline name error must be visible')
    assert.equal(
      await page.locator(':focus').getAttribute('id'),
      'name',
      'First invalid field receives focus',
    )
    await page.getByLabel('Category name').fill(prefix)
    await page.getByLabel('URL slug').fill(prefix)
    await page.getByRole('button', { name: 'Save changes' }).click()
    await page.waitForURL('**/admin/categories')
    await page.getByRole('cell', { name: prefix, exact: true }).waitFor()
    await page.goto(`${base}/admin/products/new`)
    await page.getByLabel('Product name').fill(prefix)
    await page.getByLabel('URL slug').fill(prefix)
    await page.getByLabel('Category', { exact: true }).selectOption({ label: prefix })
    await page.getByLabel('Description', { exact: true }).fill('Temporary browser verification product')
    await page.getByLabel('Status', { exact: true }).selectOption('active')
    await page.getByLabel('Stock shared across all options').fill('2')
    await page.getByLabel('Fixed / starting price (NGN)').fill('120000')
    await page.getByLabel('Karats, separated', { exact: false }).fill('18k, 24k')
    await page
      .getByLabel('Upload image', { exact: false })
      .setInputFiles({ name: 'qa.png', mimeType: 'image/png', buffer: png })
    await page.getByLabel('Image 1 description').fill('Temporary QA image')
    await page.getByRole('button', { name: 'Save changes' }).click()
    await page.waitForURL('**/admin/products')
    await page.goto(`${base}/products/${prefix}`)
    await page.getByRole('heading', { name: prefix, exact: true }).waitFor()
    await page.getByRole('button', { name: '24k', exact: true }).click()
    await page.getByText('₦120,000', { exact: true }).waitFor()
    assert(await page.locator('head title').textContent(), 'Metadata rendered')
    assert(
      await page
        .locator('script[type="application/ld+json"]')
        .evaluateAll((scripts) =>
          scripts.some((script) => JSON.parse(script.textContent)['@type'] === 'Product'),
        ),
      'Product structured data rendered',
    )
    assert(
      await page
        .getByAltText('Temporary QA image', { exact: true })
        .first()
        .evaluate((image) => image.complete && image.naturalWidth > 0),
      'Uploaded image renders',
    )
    for (const width of [390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      for (const route of [
        `/products/${prefix}`,
        '/admin/products',
        '/admin/products/new',
        '/admin/settings',
      ]) {
        await page.goto(`${base}${route}`, { waitUntil: 'domcontentloaded' })
        assert.equal(
          await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
          false,
          `${route} overflow at ${width}`,
        )
      }
    }
    assert.deepEqual(errors, [], 'No runtime errors')
    console.log(
      'PASS: authenticated admin creation, inline errors/focus, real direct upload, product publishing, fixed-karat pricing, metadata and responsive layouts',
    )
  } catch (error) {
    console.error(error.message)
    if (page) {
      await page.screenshot({ path: 'backend/.venv/catalog-admin-failure.png', fullPage: true })
    }
    throw error
  } finally {
    await browser.close()
    const cleaned = fixture('cleanup')
    identity = cleaned.id || identity
    if (identity) {
      assert(process.env.NEON_CLI_JS, 'Set NEON_CLI_JS to remove the temporary Neon Auth identity')
      execFileSync(
        process.env.NEON_NODE || process.execPath,
        [
          process.env.NEON_CLI_JS,
          'neon-auth',
          'user',
          'delete',
          identity,
          '--project-id',
          'shy-lab-76837067',
          '--branch',
          'phase2-auth',
        ],
        { stdio: ['ignore', 'pipe', 'pipe'] },
      )
    }
    console.log('Temporary browser fixtures removed')
  }
})().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
