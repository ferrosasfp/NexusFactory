import { test, expect } from '@playwright/test'

test.describe('Wallet Page', () => {
  test('wallet page requires auth', async ({ page }) => {
    await page.goto('/en/wallet')
    await expect(page).toHaveURL(/\/en\/login/)
  })
})
