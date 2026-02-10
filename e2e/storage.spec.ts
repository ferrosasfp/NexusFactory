import { test, expect } from '@playwright/test'

test.describe('Storage Page', () => {
  test('storage page requires auth', async ({ page }) => {
    await page.goto('/en/storage')
    await expect(page).toHaveURL(/\/en\/login/)
  })
})
