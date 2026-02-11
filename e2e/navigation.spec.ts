import { test, expect } from '@playwright/test'

test.describe('Navigation & i18n', () => {
  test('home page loads in English', async ({ page }) => {
    await page.goto('/en')
    await expect(page).toHaveURL(/\/en/)
  })

  test('home page loads in Spanish', async ({ page }) => {
    await page.goto('/es')
    await expect(page).toHaveURL(/\/es/)
  })

  test('root URL redirects to default locale', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/(en|es)/)
  })

  test('invalid locale falls back gracefully', async ({ page }) => {
    const response = await page.goto('/fr/login')
    // Should either redirect to a valid locale or return 404
    const status = response?.status() ?? 0
    expect([200, 301, 302, 307, 308, 404]).toContain(status)
  })
})
