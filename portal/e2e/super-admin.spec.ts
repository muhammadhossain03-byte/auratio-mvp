import { test, expect, captureEvidenceScreenshot, resetMockState, registerErrorTracking, assertNoPageErrors } from './helpers/fixtures'

test.describe('Super Admin Regression & Governance', () => {
  test.beforeEach(async ({ page }) => {
    registerErrorTracking(page)
    await resetMockState(page)
  })

  test.afterEach(async ({ page }) => {
    assertNoPageErrors(page)
  })

  test('admin accounts directory routes correctly to Root, Nadia, and Imran', async ({ page }) => {
    await page.goto('/super-admin/admin-accounts')
    await expect(page).toHaveURL('/super-admin/admin-accounts')
    await expect(page.locator('text=Auratio Root')).toBeVisible()
    await expect(page.locator('text=Nadia Rahman')).toBeVisible()
    await expect(page.locator('text=Imran Ahmed')).toBeVisible()

    // 1. Root opens protected Root state
    const rootRow = page.locator('div[style*="height: 48px"]').filter({ hasText: 'Auratio Root' })
    await rootRow.locator('button', { hasText: 'View' }).click()
    await expect(page).toHaveURL('/super-admin/admin-accounts/root')
    await expect(page.locator('.auratio-admin-page-subtitle', { hasText: 'Protected root Super Admin account' })).toBeVisible()
    await expect(page.locator('text=Root Super Admin provisioning')).toBeVisible()
    await expect(page.locator('button', { hasText: 'Deactivate' })).toHaveCount(0)

    // Capture 09_root_protected.png
    await captureEvidenceScreenshot(page, '09_root_protected.png')

    // 2. Nadia opens Nadia
    await page.goto('/super-admin/admin-accounts')
    const nadiaRow = page.locator('div[style*="height: 48px"]').filter({ hasText: 'Nadia Rahman' })
    await nadiaRow.locator('button', { hasText: 'Open' }).click()
    await expect(page).toHaveURL('/super-admin/admin-accounts/nadia')
    await expect(page.locator('input[aria-label="Display name"]')).toHaveValue('Nadia Rahman')
    await expect(page.locator('input[aria-label="Email / auth identity"]')).toHaveValue('nadia@auratio.org')

    // 3. Imran opens Imran
    await page.goto('/super-admin/admin-accounts')
    const imranRow = page.locator('div[style*="height: 48px"]').filter({ hasText: 'Imran Ahmed' })
    await imranRow.locator('button', { hasText: 'Open' }).click()
    await expect(page).toHaveURL('/super-admin/admin-accounts/imran')
    await expect(page.locator('input[aria-label="Display name"]')).toHaveValue('Imran Ahmed')
    await expect(page.locator('button', { hasText: 'Account Deactivated' })).toBeDisabled()

    // Capture 08_imran.png
    await captureEvidenceScreenshot(page, '08_imran.png')
  })

  test('invite admin provisions ordinary Admin with Invited status, and edits/deactivations isolate accounts', async ({ page }) => {
    await page.goto('/super-admin/admin-accounts')

    // Click Invite Admin
    await page.locator('button.auratio-admin-btn--primary', { hasText: 'Invite Admin' }).click()
    await expect(page).toHaveURL('/super-admin/admin-accounts/invite')

    // Empty validation: clear the default full name
    await page.locator('input[aria-label="Full name"]').fill('')
    await page.locator('button.auratio-admin-btn--primary', { hasText: 'Send Admin Invite' }).click()
    await expect(page).toHaveURL('/super-admin/admin-accounts/invite')
    await expect(page.locator('text=Full name is required.')).toBeVisible()

    // Fill valid invite
    await page.locator('input[aria-label="Full name"]').fill('Kazi Anis')
    await page.locator('input[aria-label="Email"]').fill('kazi@auratio.org')
    await page.locator('button.auratio-admin-btn--primary', { hasText: 'Send Admin Invite' }).click()
    await expect(page).toHaveURL('/super-admin/admin-accounts')

    // Verify Kazi Anis is in directory with Admin role (never Super Admin) and status Invited
    const kaziRow = page.locator('.auratio-admin-panel > div').filter({ hasText: 'Kazi Anis' })
    await expect(kaziRow).toBeVisible()
    await expect(kaziRow).toContainText('Admin')
    await expect(kaziRow).not.toContainText('Super Admin')
    await expect(kaziRow).toContainText('Invited')

    // Open Kazi Anis and verify Invited lifecycle callouts
    await kaziRow.locator('button', { hasText: 'Open' }).click()
    await expect(page).toHaveURL('/super-admin/admin-accounts/kazi-anis')
    await expect(page.locator('text=Invite sent / activation pending')).toBeVisible()
    await expect(page.locator('text=Cancels pending portal access')).toBeVisible()

    // Edit Kazi Anis and Save Changes
    await page.locator('input[aria-label="Display name"]').fill('Kazi Anis QA')
    await page.locator('button.auratio-admin-btn--primary', { hasText: 'Save Changes' }).click()
    await expect(page).toHaveURL('/super-admin/admin-accounts')
    await expect(page.locator('text=Kazi Anis QA')).toBeVisible()

    // Prove Nadia remains unchanged
    const nadiaData = await page.evaluate(() => {
      const win = window as unknown as { __getNadiaAdminAccount?: () => { displayName: string; email: string } }
      return win.__getNadiaAdminAccount?.()
    })
    expect(nadiaData?.displayName).toBe('Nadia Rahman')
    expect(nadiaData?.email).toBe('nadia@auratio.org')

    // Deactivate Kazi Anis
    const updatedKaziRow = page.locator('.auratio-admin-panel > div').filter({ hasText: 'Kazi Anis QA' })
    await updatedKaziRow.locator('button', { hasText: 'Open' }).click()
    await page.locator('button.auratio-admin-btn--secondary', { hasText: 'Deactivate' }).click()
    await expect(page).toHaveURL('/super-admin/admin-accounts/kazi-anis/deactivate')
    await expect(page.locator('text=Deactivate Kazi Anis QA?')).toBeVisible()

    // Confirm Deactivation
    await page.locator('button.auratio-admin-btn--primary', { hasText: 'Confirm Deactivation' }).click()
    await expect(page).toHaveURL('/super-admin/admin-accounts')

    // Kazi Anis is now Deactivated
    const deactivatedKaziRow = page.locator('.auratio-admin-panel > div').filter({ hasText: 'Kazi Anis QA' })
    await expect(deactivatedKaziRow).toContainText('Deactivated')

    // Sibling account Nadia remains Active
    const nadiaRowAfter = page.locator('.auratio-admin-panel > div').filter({ hasText: 'Nadia Rahman' })
    await expect(nadiaRowAfter).toContainText('Active')
  })

  test('root account deactivation is blocked and invalid admin URLs redirect safely', async ({ page }) => {
    // Attempt direct navigation to Root deactivation
    await page.goto('/super-admin/admin-accounts/root/deactivate')
    await expect(page).toHaveURL('/super-admin/admin-accounts/root')
    await expect(page.locator('.auratio-admin-page-subtitle', { hasText: 'Protected root Super Admin account' })).toBeVisible()
    await expect(page.locator('button', { hasText: 'Confirm Deactivation' })).toHaveCount(0)

    // Unknown admin URL redirects to directory
    await page.goto('/super-admin/admin-accounts/unknown-admin')
    await expect(page).toHaveURL('/super-admin/admin-accounts')

    await page.goto('/super-admin/admin-accounts/unknown-admin/deactivate')
    await expect(page).toHaveURL('/super-admin/admin-accounts')
  })
})
