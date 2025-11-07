import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    globalThis.__transitionTime = null
    const original = document.startViewTransition

    // patch the startViewTransition
    document.startViewTransition = function (...args) {
      globalThis.__transitionTime = null
      const start = performance.now()
      const result = original.apply(this, args)
      result.finished.then(() => {
        globalThis.__transitionTime = performance.now() - start
      })
      return result
    }
  })
})

test('box', async ({ page }) => {
  await page.goto('http://localhost:3000/demos/box')
  await page.locator('div').click()
  await page.waitForFunction(() => globalThis.__transitionTime !== null)
  const duration = await page.evaluate(() => globalThis.__transitionTime)

  expect(duration).toBeGreaterThan(200)
})

test('list', async ({ page }) => {
  await page.goto('http://localhost:3000/demos/list')

  await page.getByText('Matt').click()
  await page.waitForFunction(() => globalThis.__transitionTime !== null)
  const deleteDuration = await page.evaluate(() => globalThis.__transitionTime)
  expect(deleteDuration).toBeGreaterThan(200)

  await page.getByRole('button', { name: 'add' }).click()
  await page.waitForFunction(() => globalThis.__transitionTime !== null)
  const addDuration = await page.evaluate(() => globalThis.__transitionTime)
  // the add duration has a delay, it will take a bit longer
  expect(addDuration).toBeGreaterThan(300)

  await page.getByRole('button', { name: 'reverse' }).click()
  await page.waitForFunction(() => globalThis.__transitionTime !== null)
  const reverseDuration = await page.evaluate(() => globalThis.__transitionTime)
  expect(reverseDuration).toBeGreaterThan(200)
})

test('gallery', async ({ page }) => {
  await page.goto('http://localhost:3000/demos/gallery')

  await page.locator('img').nth(1).click()
  await page.waitForFunction(() => globalThis.__transitionTime !== null)
  const deleteDuration = await page.evaluate(() => globalThis.__transitionTime)
  expect(deleteDuration).toBeGreaterThan(300)
})
