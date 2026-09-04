import { test, expect, captureEvidenceScreenshot, resetMockState, registerErrorTracking, assertNoPageErrors } from './helpers/fixtures'

test.describe('Volunteer Critical Regression', () => {
  test.beforeEach(async ({ page }) => {
    registerErrorTracking(page)
    await resetMockState(page)
  })

  test.afterEach(async ({ page }) => {
    assertNoPageErrors(page)
  })

  test('active assignments list loads and opens canonical assignment SUB-8821', async ({ page }) => {
    await page.goto('/volunteer/assignments')
    await expect(page).toHaveURL('/volunteer/assignments')
    await expect(page.locator('h2.auratio-volunteer-page-title')).toHaveText('My Active Assignments')

    // Open SUB-8821
    await page.locator('button.auratio-volunteer-btn', { hasText: 'Open' }).first().click()
    await expect(page).toHaveURL('/volunteer/assignments/sub-8821')
    await expect(page.locator('h2.auratio-volunteer-page-title')).toHaveText('SUB-8821')

    // Retain canonical volunteer assignment screenshot
    await captureEvidenceScreenshot(page, '02_volunteer_assignment.png')
  })

  test('decline assignment flow handles Cancel, validation blocking, and valid decline', async ({ page }) => {
    await page.goto('/volunteer/assignments/sub-8821')

    // Click Decline
    await page.locator('button.auratio-volunteer-btn--secondary', { hasText: 'Decline' }).click()
    await expect(page).toHaveURL('/volunteer/assignments/sub-8821/decline')

    // Cancel returns to assignment without declining
    await page.locator('button.auratio-volunteer-btn--secondary', { hasText: 'Cancel' }).click()
    await expect(page).toHaveURL('/volunteer/assignments/sub-8821')

    // Reopen Decline
    await page.locator('button.auratio-volunteer-btn--secondary', { hasText: 'Decline' }).click()
    await expect(page).toHaveURL('/volunteer/assignments/sub-8821/decline')

    // Empty reason blocked
    await page.locator('input.auratio-volunteer-decline-input').fill('')
    await page.locator('button.auratio-volunteer-btn--primary', { hasText: 'Confirm Decline' }).click()
    await expect(page).toHaveURL('/volunteer/assignments/sub-8821/decline')

    // Whitespace reason blocked
    await page.locator('input.auratio-volunteer-decline-input').fill('     ')
    await page.locator('button.auratio-volunteer-btn--primary', { hasText: 'Confirm Decline' }).click()
    await expect(page).toHaveURL('/volunteer/assignments/sub-8821/decline')

    // Valid reason navigates to after-decline view
    await page.locator('input.auratio-volunteer-decline-input').fill('Schedule conflict for this week')
    await page.locator('button.auratio-volunteer-btn--primary', { hasText: 'Confirm Decline' }).click()
    await expect(page).toHaveURL('/volunteer/assignments/after-decline')
  })

  test('availability toggle flow toggles Available and Unavailable states', async ({ page }) => {
    await page.goto('/volunteer/availability')
    await expect(page).toHaveURL('/volunteer/availability')

    // Set Unavailable
    await page.locator('button.auratio-volunteer-btn--primary', { hasText: 'Set Unavailable' }).click()
    await expect(page).toHaveURL('/volunteer/availability/unavailable')

    // Set Available
    await page.locator('button.auratio-volunteer-btn--primary', { hasText: 'Set Available' }).click()
    await expect(page).toHaveURL('/volunteer/availability')
  })

  test('scoring workspace, criterion feedback completeness, and review submission flow', async ({ page }) => {
    // Accept assignment -> navigates to scoring workspace
    await page.goto('/volunteer/assignments/sub-8821')
    await page.locator('button.auratio-volunteer-btn--primary', { hasText: 'Accept' }).click()
    await expect(page).toHaveURL('/volunteer/evaluation/sub-8821')
    await expect(page.locator('h2.auratio-volunteer-page-title')).toHaveText('SUB-8821')

    // Open Criterion Feedback Editor
    await page.locator('button.auratio-volunteer-btn--secondary', { hasText: 'Open Universal Delivery' }).click()
    await expect(page).toHaveURL('/volunteer/evaluation/sub-8821/criterion')

    // Completeness row check
    const completeness = page.locator('.auratio-volunteer-criterion-completeness-row')
    await expect(completeness).toContainText('Timestamped evidence ✓')

    // Back to Scores returns to workspace
    await page.locator('button.auratio-volunteer-btn--secondary', { hasText: 'Back to Scores' }).click()
    await expect(page).toHaveURL('/volunteer/evaluation/sub-8821')

    // Reopen editor and test empty field blocks Save
    await page.locator('button.auratio-volunteer-btn--secondary', { hasText: 'Open Universal Delivery' }).click()
    await page.locator('textarea.auratio-volunteer-feedback-textarea--evidence').fill('')
    await expect(completeness).toContainText('Timestamped evidence —')
    await page.locator('button.auratio-volunteer-btn--primary', { hasText: 'Save Criterion Feedback' }).click()
    await expect(page).toHaveURL('/volunteer/evaluation/sub-8821/criterion')

    // Whitespace blocks Save
    await page.locator('textarea.auratio-volunteer-feedback-textarea--evidence').fill('   \n  \t ')
    await expect(completeness).toContainText('Timestamped evidence —')
    await page.locator('button.auratio-volunteer-btn--primary', { hasText: 'Save Criterion Feedback' }).click()
    await expect(page).toHaveURL('/volunteer/evaluation/sub-8821/criterion')

    // Restored valid evidence permits Save
    await page.locator('textarea.auratio-volunteer-feedback-textarea--evidence').fill('At 01:38, speaker articulates value proposition clearly.')
    await expect(completeness).toContainText('Timestamped evidence ✓')
    await page.locator('button.auratio-volunteer-btn--primary', { hasText: 'Save Criterion Feedback' }).click()
    await expect(page).toHaveURL('/volunteer/evaluation/sub-8821')

    // Review & Submit flow
    await page.locator('button.auratio-volunteer-btn--primary', { hasText: 'Review & Submit' }).click()
    await expect(page).toHaveURL('/volunteer/evaluation/sub-8821/review')

    // Cancel in review returns to scoring workspace
    await page.locator('button.auratio-volunteer-btn--secondary', { hasText: 'Cancel' }).click()
    await expect(page).toHaveURL('/volunteer/evaluation/sub-8821')

    // Confirm & Submit
    await page.locator('button.auratio-volunteer-btn--primary', { hasText: 'Review & Submit' }).click()
    await page.locator('button.auratio-volunteer-btn--primary', { hasText: 'Confirm & Submit' }).click()
    await expect(page).toHaveURL('/volunteer/evaluation/sub-8821/submitted')
    await expect(page.locator('text=Evaluation submitted')).toBeVisible()

    // Navigate to Completed History
    await page.locator('button.auratio-volunteer-btn--primary', { hasText: 'Go to Completed / History' }).click()
    await expect(page).toHaveURL('/volunteer/completed')
  })

  test('completed history routes and reopened evaluation flow', async ({ page }) => {
    await page.goto('/volunteer/completed')
    await expect(page).toHaveURL('/volunteer/completed')

    const openButtons = page.locator('button.auratio-volunteer-btn--secondary', { hasText: 'Open' })
    await expect(openButtons).toHaveCount(4)

    // SUB-8821 Pending Moderation
    await openButtons.nth(0).click()
    await expect(page).toHaveURL('/volunteer/completed/sub-8821')
    await expect(page.locator('h2.auratio-volunteer-page-title')).toContainText('SUB-8821')

    // SUB-8792 Approved
    await page.goto('/volunteer/completed')
    await openButtons.nth(1).click()
    await expect(page).toHaveURL('/volunteer/completed/sub-8792')
    await expect(page.locator('h2.auratio-volunteer-page-title')).toContainText('SUB-8792')

    // SUB-8755 Rejected
    await page.goto('/volunteer/completed')
    await openButtons.nth(2).click()
    await expect(page).toHaveURL('/volunteer/completed/sub-8755')
    await expect(page.locator('h2.auratio-volunteer-page-title')).toContainText('SUB-8755')

    // SUB-8741 Processing
    await page.goto('/volunteer/completed')
    await openButtons.nth(3).click()
    await expect(page).toHaveURL('/volunteer/completed/sub-8741')
    await expect(page.locator('h2.auratio-volunteer-page-title')).toContainText('SUB-8741')

    // Reopened evaluation flow
    await page.goto('/volunteer/evaluation/sub-8821/reopened')
    await expect(page).toHaveURL('/volunteer/evaluation/sub-8821/reopened')
    await page.locator('button.auratio-volunteer-btn--primary', { hasText: 'Continue Correction' }).click()
    await expect(page).toHaveURL('/volunteer/evaluation/sub-8821')
  })

  test('sidebar navigation links navigate between volunteer sections', async ({ page }) => {
    await page.goto('/volunteer/assignments')

    await page.locator('button.auratio-volunteer-nav-item', { hasText: 'Availability' }).click()
    await expect(page).toHaveURL('/volunteer/availability')

    await page.locator('button.auratio-volunteer-nav-item', { hasText: 'Completed / History' }).click()
    await expect(page).toHaveURL('/volunteer/completed')

    await page.locator('button.auratio-volunteer-nav-item', { hasText: 'Active Assignments' }).click()
    await expect(page).toHaveURL('/volunteer/assignments')
  })
})
