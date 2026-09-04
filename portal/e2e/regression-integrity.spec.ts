import { test, expect, resetMockState, registerErrorTracking, assertNoPageErrors } from './helpers/fixtures'

test.describe('Browser Regression & Accessibility Smoke', () => {
  test.beforeEach(async ({ page }) => {
    registerErrorTracking(page)
    await resetMockState(page)
  })

  test.afterEach(async ({ page }) => {
    assertNoPageErrors(page)
  })

  test('browser history navigation (Back, Forward, Refresh) functions reliably across deep routes', async ({ page }) => {
    // Navigate across multi-step flow
    await page.goto('/admin/requests')
    await expect(page).toHaveURL('/admin/requests')

    const reqRow = page.locator('[data-request-id="REQ-1042"]')
    await reqRow.locator('button.auratio-admin-btn--table-open').click()
    await expect(page).toHaveURL('/admin/requests/req-1042')

    await page.locator('button.auratio-admin-btn--primary', { hasText: 'Assign Human' }).click()
    await expect(page).toHaveURL('/admin/requests/req-1042/assign')

    // Browser Back to details
    await page.goBack()
    await expect(page).toHaveURL('/admin/requests/req-1042')
    await expect(page.locator('h2.auratio-admin-page-title')).toContainText('REQ-1042')

    // Browser Back to queue
    await page.goBack()
    await expect(page).toHaveURL('/admin/requests')

    // Browser Forward to details
    await page.goForward()
    await expect(page).toHaveURL('/admin/requests/req-1042')

    // Page refresh maintains loaded route and entity
    await page.reload()
    await expect(page).toHaveURL('/admin/requests/req-1042')
    await expect(page.locator('h2.auratio-admin-page-title')).toContainText('REQ-1042')
    await expect(page.locator('text=Alex Morgan')).toBeVisible()
  })

  test('repeated dialog / subflow open and cancel cycles remain stable and leak no state', async ({ page }) => {
    await page.goto('/admin/volunteers/farhana')
    await expect(page).toHaveURL('/admin/volunteers/farhana')

    const overrideBtn = page.locator('button.auratio-admin-btn--primary', { hasText: 'Override Availability' })

    // Cycle 1: Open and Cancel
    await overrideBtn.click()
    await expect(page).toHaveURL('/admin/volunteers/farhana/availability')
    await page.locator('button.auratio-admin-btn--secondary', { hasText: 'Cancel' }).click()
    await expect(page).toHaveURL('/admin/volunteers/farhana')

    // Cycle 2: Open and Cancel again
    await overrideBtn.click()
    await expect(page).toHaveURL('/admin/volunteers/farhana/availability')
    await page.locator('button.auratio-admin-btn--secondary', { hasText: 'Cancel' }).click()
    await expect(page).toHaveURL('/admin/volunteers/farhana')

    // Cycle 3: Open and Cancel once more
    await overrideBtn.click()
    await expect(page).toHaveURL('/admin/volunteers/farhana/availability')
    await page.locator('button.auratio-admin-btn--secondary', { hasText: 'Cancel' }).click()
    await expect(page).toHaveURL('/admin/volunteers/farhana')

    // Final state remains unmutated
    await expect(page.locator('h2.auratio-admin-page-title')).toHaveText('Farhana Islam')
  })

  test('accessibility smoke: keyboard focus, accessible names, disabled states, and ARIA attributes', async ({ page }) => {
    // 1. Buttons keyboard reachable via Tab order
    await page.goto('/auth/sign-in')
    const emailInput = page.locator('#portal-sign-in-email')
    await emailInput.focus()
    await expect(emailInput).toBeFocused()

    await page.keyboard.press('Tab')
    const passwordInput = page.locator('#portal-sign-in-password')
    await expect(passwordInput).toBeFocused()

    await page.keyboard.press('Tab')
    const forgotBtn = page.locator('button.auratio-auth-link', { hasText: 'Forgot password?' })
    await expect(forgotBtn).toBeFocused()

    await page.keyboard.press('Tab')
    const submitBtn = page.locator('button[type="submit"]')
    await expect(submitBtn).toBeFocused()

    // 2. Form controls have meaningful labels/accessible names
    await page.goto('/admin/volunteers/invite')
    const nameInput = page.locator('#invite-display-name')
    await expect(nameInput).toHaveAttribute('id', 'invite-display-name')
    await expect(page.locator('label[for="invite-display-name"]')).toBeVisible()

    // 3. Disabled controls expose disabled attribute
    await page.goto('/admin/volunteers/nusrat')
    const disabledTrackBtn = page.locator('button', { hasText: 'Manage Track Eligibility' })
    await expect(disabledTrackBtn).toBeDisabled()
    const disabledAvailBtn = page.locator('button', { hasText: 'Override Availability' })
    await expect(disabledAvailBtn).toBeDisabled()

    // 4. Selected filter buttons expose aria-pressed attribute
    await page.goto('/admin/events')
    const publishedFilter = page.locator('button[data-testid="admin-events-filter-published"]')
    await publishedFilter.click()
    await expect(publishedFilter).toHaveAttribute('aria-pressed', 'true')

    const allFilter = page.locator('button[data-testid="admin-events-filter-all"]')
    await allFilter.click()
    await expect(allFilter).toHaveAttribute('aria-pressed', 'true')
    await expect(publishedFilter).toHaveAttribute('aria-pressed', 'false')

    // 5. Track checkbox controls expose role="checkbox" and aria-checked
    await page.goto('/admin/volunteers/farhana/tracks')
    const informativeBox = page.locator('button[role="checkbox"]', { hasText: 'Informative' })
    await expect(informativeBox).toBeVisible()
    await expect(informativeBox).toHaveAttribute('role', 'checkbox')
    await expect(informativeBox).toHaveAttribute('aria-checked', 'true')

    // 6. Destructive confirmation actions have clear accessible names
    await page.goto('/admin/requests/req-1042/reassign')
    const confirmReassignBtn = page.locator('button.auratio-admin-btn--primary', { hasText: 'Confirm Reassignment' })
    await expect(confirmReassignBtn).toBeVisible()
    await expect(confirmReassignBtn).toHaveText('Confirm Reassignment')

    await page.goto('/super-admin/admin-accounts/nadia/deactivate')
    const confirmDeactBtn = page.locator('button.auratio-admin-btn--primary', { hasText: 'Confirm Deactivation' })
    await expect(confirmDeactBtn).toBeVisible()
    await expect(confirmDeactBtn).toHaveText('Confirm Deactivation')
  })
})
