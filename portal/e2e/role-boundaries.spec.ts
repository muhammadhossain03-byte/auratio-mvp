import { test, expect, resetMockState, registerErrorTracking, assertNoPageErrors } from './helpers/fixtures'

/**
 * STEP IV FRONTEND ROLE PRESENTATION & ROUTING REGRESSION
 * 
 * NOTE & BOUNDARY SPECIFICATION:
 * In Auratio Step IV, authentication and authorization are backed by local/mock frontend state.
 * These tests verify the visual, structural, and client-side navigation boundaries
 * presented to different simulated roles.
 * 
 * IMPORTANT: Production Role-Based Access Control (RBAC) and backend token validation
 * are strictly reserved for Step V+ and backend infrastructure. These tests assert
 * frontend routing consistency without claiming backend cryptographic security.
 */

test.describe('Frontend Role Boundary & Presentation Regression', () => {
  test.beforeEach(async ({ page }) => {
    registerErrorTracking(page)
    await resetMockState(page)
  })

  test.afterEach(async ({ page }) => {
    assertNoPageErrors(page)
  })

  test('role authorization landing presents separate workspace resolutions', async ({ page }) => {
    await page.goto('/auth/role-authorization')
    await expect(page).toHaveURL('/auth/role-authorization')

    // Expect options for Volunteer and Admin workspaces
    const volunteerBtn = page.locator('button.auratio-auth-btn', { hasText: 'Open resolved Volunteer Evaluator workspace' })
    const adminBtn = page.locator('button.auratio-auth-btn', { hasText: 'Open resolved Admin workspace' })

    await expect(volunteerBtn).toBeVisible()
    await expect(adminBtn).toBeVisible()

    // Clicking Volunteer navigates to volunteer workspace
    await volunteerBtn.click()
    await expect(page).toHaveURL('/volunteer/assignments')

    // Navigate back to role authorization and click Admin
    await page.goto('/auth/role-authorization')
    await adminBtn.click()
    await expect(page).toHaveURL('/admin/dashboard')
  })

  test('ordinary admin layout does not leak Super Admin navigation items', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await expect(page).toHaveURL('/admin/dashboard')

    // Admin topbar pill displays Admin
    const topbarPill = page.locator('.auratio-admin-topbar-pill, .auratio-admin-topbar')
    await expect(topbarPill).toContainText('Admin')
    await expect(topbarPill).not.toContainText('Super Admin')

    // Sidebar contains Admin items but NOT Super Admin Admin Accounts
    const sidebar = page.locator('.auratio-admin-sidebar')
    await expect(sidebar.locator('text=Requests')).toBeVisible()
    await expect(sidebar.locator('text=Evaluations')).toBeVisible()
    await expect(sidebar.locator('text=Moderation')).toBeVisible()
    await expect(sidebar.locator('text=Volunteers')).toBeVisible()
    await expect(sidebar.locator('text=Events')).toBeVisible()
    await expect(sidebar.locator('text=Audit Log')).toBeVisible()
    await expect(sidebar.locator('text=Admin Accounts')).toHaveCount(0)
  })

  test('super admin layout renders Super Admin topbar badge and governance directory', async ({ page }) => {
    await page.goto('/super-admin/admin-accounts')
    await expect(page).toHaveURL('/super-admin/admin-accounts')

    // Super Admin topbar pill
    const topbarPill = page.locator('.auratio-admin-topbar-pill')
    await expect(topbarPill).toContainText('Super Admin')

    // Permission boundary documentation card is visible
    await expect(page.locator('text=Permission boundary')).toBeVisible()
    await expect(page.locator('text=Super Admin-only directory')).toBeVisible()
  })
})
