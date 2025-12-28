import { test, expect } from '@playwright/test'

test.describe('Supabase Email Authentication', () => {
  const testEmail = `test${Date.now()}@gmail.com`
  const testPassword = 'Test123456!'
  const testName = 'Test User'

  test.beforeEach(async ({ page }) => {
    // Clear cookies before each test
    await page.context().clearCookies()
  })

  test('should register with email and password', async ({ page }) => {
    // Go to email login page
    await page.goto('/login-email')

    // Click on "Create Account" to switch to registration
    await page.getByRole('button', { name: /create account/i }).click()

    // Fill registration form
    await page.getByLabel(/name/i).fill(testName)
    await page.getByLabel(/email/i).fill(testEmail)
    await page.getByLabel(/password/i).fill(testPassword)

    // Submit form
    await page.getByRole('button', { name: /sign up/i }).click()

    // Check for success message
    await expect(page.getByText(/registration successful/i)).toBeVisible({ timeout: 10000 })
  })

  test('should login with email and password', async ({ page }) => {
    // First register a user
    await page.goto('/login-email')

    // Click on "Create Account" to switch to registration
    await page.getByRole('button', { name: /create account/i }).click()

    // Fill registration form
    await page.getByLabel(/name/i).fill(testName)
    await page.getByLabel(/email/i).fill(testEmail)
    await page.getByLabel(/password/i).fill(testPassword)

    // Submit form
    await page.getByRole('button', { name: /sign up/i }).click()

    // Wait for registration to complete
    await page.waitForTimeout(2000)

    // Now try to login
    await page.goto('/login-email')

    // Fill login form
    await page.getByLabel(/email/i).fill(testEmail)
    await page.getByLabel(/password/i).fill(testPassword)

    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click()

    // Should redirect to studio page
    await expect(page).toHaveURL('/studio', { timeout: 10000 })
  })

  test('should show error for invalid email format', async ({ page }) => {
    await page.goto('/login-email')

    // Click on "Create Account" to switch to registration
    await page.getByRole('button', { name: /create account/i }).click()

    // Fill form with invalid email
    await page.getByLabel(/name/i).fill(testName)
    await page.getByLabel(/email/i).fill('not-an-email')
    await page.getByLabel(/password/i).fill(testPassword)

    // Submit form
    await page.getByRole('button', { name: /sign up/i }).click()

    // Should show error
    await expect(page.getByText(/invalid/i)).toBeVisible()
  })

  test('should show error for short password', async ({ page }) => {
    await page.goto('/login-email')

    // Click on "Create Account" to switch to registration
    await page.getByRole('button', { name: /create account/i }).click()

    // Fill form with short password
    await page.getByLabel(/name/i).fill(testName)
    await page.getByLabel(/email/i).fill(testEmail)
    await page.getByLabel(/password/i).fill('123')

    // Submit form
    await page.getByRole('button', { name: /sign up/i }).click()

    // Should show error
    await expect(page.getByText(/password must be at least/i)).toBeVisible()
  })

  test('should show error for duplicate email', async ({ page }) => {
    // Register first user
    await page.goto('/login-email')
    await page.getByRole('button', { name: /create account/i }).click()
    await page.getByLabel(/name/i).fill(testName)
    await page.getByLabel(/email/i).fill(testEmail)
    await page.getByLabel(/password/i).fill(testPassword)
    await page.getByRole('button', { name: /sign up/i }).click()
    await page.waitForTimeout(2000)

    // Try to register again with same email
    await page.goto('/login-email')
    await page.getByRole('button', { name: /create account/i }).click()
    await page.getByLabel(/name/i).fill('Another User')
    await page.getByLabel(/email/i).fill(testEmail)
    await page.getByLabel(/password/i).fill(testPassword)
    await page.getByRole('button', { name: /sign up/i }).click()

    // Should show error
    await expect(page.getByText(/user already exists/i)).toBeVisible()
  })

  test('should reset password', async ({ page }) => {
    await page.goto('/login-email')

    // Click on "Forgot your password?"
    await page.getByRole('button', { name: /forgot your password/i }).click()

    // Fill reset form
    await page.getByLabel(/email/i).fill(testEmail)

    // Submit form
    await page.getByRole('button', { name: /send reset email/i }).click()

    // Should show success message
    await expect(page.getByText(/password reset email sent/i)).toBeVisible()
  })
})