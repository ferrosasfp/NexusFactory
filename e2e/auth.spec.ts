import { test, expect } from '@playwright/test'

test.describe('Auth Flow', () => {
  test('login page loads', async ({ page }) => {
    await page.goto('/en/login')
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
  })

  test('signup page loads', async ({ page }) => {
    await page.goto('/en/signup')
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
  })

  test('login page has Google OAuth button', async ({ page }) => {
    await page.goto('/en/login')
    await expect(page.locator('button:has-text("Google")')).toBeVisible()
  })

  test('unauthenticated user redirected from dashboard', async ({ page }) => {
    await page.goto('/en/dashboard')
    await expect(page).toHaveURL(/\/en\/login/)
  })

  test('locale switch works', async ({ page }) => {
    await page.goto('/es/login')
    await expect(page.locator('input[name="email"]')).toBeVisible()
  })
})
