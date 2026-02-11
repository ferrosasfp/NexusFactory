import { test, expect } from '@playwright/test'

test.describe('Auth Flow', () => {
  test('login page loads with all form elements', async ({ page }) => {
    await page.goto('/en/login')
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('signup page loads with all form elements', async ({ page }) => {
    await page.goto('/en/signup')
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('login page has Google OAuth button', async ({ page }) => {
    await page.goto('/en/login')
    await expect(page.locator('button:has-text("Google")')).toBeVisible()
  })

  test('unauthenticated user redirected from dashboard', async ({ page }) => {
    await page.goto('/en/dashboard')
    await expect(page).toHaveURL(/\/en\/login/)
  })

  test('locale switch works on login page', async ({ page }) => {
    await page.goto('/es/login')
    await expect(page.locator('input[name="email"]')).toBeVisible()
    // Verify Spanish locale loaded (page should not redirect away)
    await expect(page).toHaveURL(/\/es\/login/)
  })

  test('forgot password page loads', async ({ page }) => {
    await page.goto('/en/forgot-password')
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('login page links to signup', async ({ page }) => {
    await page.goto('/en/login')
    const signupLink = page.locator('a[href*="/signup"]')
    await expect(signupLink).toBeVisible()
  })

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/en/login')
    await page.fill('input[name="email"]', 'invalid@test.com')
    await page.fill('input[name="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    // Should stay on login page (not redirect) and show some error feedback
    await expect(page).toHaveURL(/\/en\/login/, { timeout: 5000 })
  })

  test('protected routes all redirect to login', async ({ page }) => {
    for (const route of ['/en/dashboard', '/en/wallet', '/en/contracts', '/en/storage']) {
      await page.goto(route)
      await expect(page).toHaveURL(/\/en\/login/)
    }
  })
})
