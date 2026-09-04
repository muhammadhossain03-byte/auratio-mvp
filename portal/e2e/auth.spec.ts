import { test, expect, captureEvidenceScreenshot, resetMockState, registerErrorTracking, assertNoPageErrors } from './helpers/fixtures'

test.describe('Auth Critical Regression', () => {
  test.beforeEach(async ({ page }) => {
    registerErrorTracking(page)
    await resetMockState(page)
  })

  test.afterEach(async ({ page }) => {
    assertNoPageErrors(page)
  })

  test('root redirects to /auth/sign-in and renders sign-in page', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL('/auth/sign-in')
    await expect(page.locator('h1.auratio-auth-title')).toHaveText('Auratio Portal')
    await expect(page.locator('#portal-sign-in-email')).toBeVisible()
    await expect(page.locator('#portal-sign-in-password')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toHaveText('Sign In')

    // Retain canonical auth screenshot
    await captureEvidenceScreenshot(page, '01_auth.png')
  })

  test('sign-in form rejects empty and malformed inputs', async ({ page }) => {
    await page.goto('/auth/sign-in')

    // Empty submission
    await page.locator('#portal-sign-in-email').fill('')
    await page.locator('#portal-sign-in-password').fill('')
    await page.locator('button[type="submit"]').click()
    await expect(page).toHaveURL('/auth/sign-in')
    await expect(page.locator('text=Email is required.')).toBeVisible()

    // Malformed email
    await page.locator('#portal-sign-in-email').fill('notanemail')
    await page.locator('#portal-sign-in-password').fill('password123')
    await page.locator('button[type="submit"]').click()
    await expect(page).toHaveURL('/auth/sign-in')
    await expect(page.locator('text=Please enter a valid email address.')).toBeVisible()

    // Empty password
    await page.locator('#portal-sign-in-email').fill('admin@auratio.org')
    await page.locator('#portal-sign-in-password').fill('')
    await page.locator('button[type="submit"]').click()
    await expect(page).toHaveURL('/auth/sign-in')
    await expect(page.locator('text=Password is required.')).toBeVisible()

    // Valid credentials navigate to /auth/role-authorization
    await page.locator('#portal-sign-in-password').fill('validsecret123')
    await page.locator('button[type="submit"]').click()
    await expect(page).toHaveURL('/auth/role-authorization')
  })

  test('complete forgot password and reset password journey', async ({ page }) => {
    await page.goto('/auth/sign-in')

    // Navigate to Forgot Password
    await page.locator('button.auratio-auth-link', { hasText: 'Forgot password?' }).click()
    await expect(page).toHaveURL('/auth/forgot-password')

    // Empty email validation
    await page.locator('#portal-forgot-password-email').fill('')
    await page.locator('button[type="submit"]').click()
    await expect(page).toHaveURL('/auth/forgot-password')
    await expect(page.locator('text=Email is required.')).toBeVisible()

    // Invalid email validation
    await page.locator('#portal-forgot-password-email').fill('invalid-email')
    await page.locator('button[type="submit"]').click()
    await expect(page).toHaveURL('/auth/forgot-password')
    await expect(page.locator('text=Please enter a valid email address.')).toBeVisible()

    // Valid email submission
    await page.locator('#portal-forgot-password-email').fill('user@auratio.org')
    await page.locator('button[type="submit"]').click()
    await expect(page).toHaveURL('/auth/reset-link-sent')
    await expect(page.locator('h1.auratio-auth-title')).toHaveText('Reset link sent')

    // Open Reset Link prototype
    await page.locator('button.auratio-auth-btn', { hasText: 'Open Reset Link — Prototype' }).click()
    await expect(page).toHaveURL('/auth/reset-password')

    // Empty password validation
    await page.locator('#portal-reset-password-new').fill('')
    await page.locator('#portal-reset-password-confirm').fill('')
    await page.locator('button[type="submit"]').click()
    await expect(page).toHaveURL('/auth/reset-password')
    await expect(page.locator('text=New password is required.')).toBeVisible()

    // Short password (< 8 chars)
    await page.locator('#portal-reset-password-new').fill('short7')
    await page.locator('#portal-reset-password-confirm').fill('short7')
    await page.locator('button[type="submit"]').click()
    await expect(page).toHaveURL('/auth/reset-password')
    await expect(page.locator('text=Password must be at least 8 characters.')).toBeVisible()

    // Mismatched passwords
    await page.locator('#portal-reset-password-new').fill('newpassword123')
    await page.locator('#portal-reset-password-confirm').fill('differentpass456')
    await page.locator('button[type="submit"]').click()
    await expect(page).toHaveURL('/auth/reset-password')
    await expect(page.locator('text=Passwords do not match.')).toBeVisible()

    // Valid matching passwords
    await page.locator('#portal-reset-password-new').fill('SecurePassword123!')
    await page.locator('#portal-reset-password-confirm').fill('SecurePassword123!')
    await page.locator('button[type="submit"]').click()
    await expect(page).toHaveURL('/auth/password-reset-complete')
    await expect(page.locator('h1.auratio-auth-title')).toHaveText('Password updated')

    // Return to sign in
    await page.locator('button.auratio-auth-btn', { hasText: 'Return to Sign In' }).click()
    await expect(page).toHaveURL('/auth/sign-in')
  })

  test('browser Back and Forward navigation works across auth flows', async ({ page }) => {
    await page.goto('/auth/sign-in')
    await page.locator('button.auratio-auth-link', { hasText: 'Forgot password?' }).click()
    await expect(page).toHaveURL('/auth/forgot-password')

    await page.goBack()
    await expect(page).toHaveURL('/auth/sign-in')

    await page.goForward()
    await expect(page).toHaveURL('/auth/forgot-password')
  })

  test('direct nested route loading and refresh works seamlessly', async ({ page }) => {
    await page.goto('/auth/forgot-password')
    await expect(page).toHaveURL('/auth/forgot-password')
    await expect(page.locator('#portal-forgot-password-email')).toBeVisible()

    await page.reload()
    await expect(page).toHaveURL('/auth/forgot-password')
    await expect(page.locator('#portal-forgot-password-email')).toBeVisible()

    await page.goto('/auth/reset-password')
    await expect(page).toHaveURL('/auth/reset-password')
    await expect(page.locator('#portal-reset-password-new')).toBeVisible()
  })
})
