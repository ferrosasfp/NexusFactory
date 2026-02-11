import { test, expect } from '@playwright/test'

test.describe('Wallet Page', () => {
  test('wallet page requires auth', async ({ page }) => {
    await page.goto('/en/wallet')
    await expect(page).toHaveURL(/\/en\/login/)
  })

  test('wallet page requires auth in Spanish locale', async ({ page }) => {
    await page.goto('/es/wallet')
    await expect(page).toHaveURL(/\/es\/login/)
  })

  test('contracts page requires auth', async ({ page }) => {
    await page.goto('/en/contracts')
    await expect(page).toHaveURL(/\/en\/login/)
  })
})
