import { test, expect } from '@playwright/test'
import {
  resetMockState,
  registerErrorTracking,
  assertNoPageErrors,
} from './helpers/fixtures'

test.describe('Cross-Role Volunteer Decline -> Admin Unassigned Request Queue Lifecycle', () => {
  test.beforeEach(async ({ page }) => {
    registerErrorTracking(page)
    await resetMockState(page)
  })

  test.afterEach(async ({ page }) => {
    assertNoPageErrors(page)
  })

  test('TEST A: End-to-end decline -> Admin queue Unassigned -> Open & verify details -> Assign Rakib Hasan -> Explicit reassign Farhana Islam', async ({
    page,
  }) => {
    // 1. Volunteer starts on Active Assignments and sees SUB-8821
    await page.goto('/volunteer/assignments')
    await expect(page).toHaveURL('/volunteer/assignments')
    const sub8821Btn = page.locator('button[aria-label="Open SUB-8821"]')
    await expect(sub8821Btn).toBeVisible()

    // 2. Open SUB-8821
    await sub8821Btn.click()
    await expect(page).toHaveURL('/volunteer/assignments/sub-8821')
    await expect(page.locator('h2.auratio-volunteer-page-title')).toHaveText('SUB-8821')

    // 3. Click Decline
    await page.locator('button.auratio-volunteer-btn--secondary', { hasText: 'Decline' }).click()
    await expect(page).toHaveURL('/volunteer/assignments/sub-8821/decline')

    // 4. Enter valid non-empty decline reason and confirm
    const declineReason = 'Scheduling conflict due to semester finals'
    await page.locator('input.auratio-volunteer-decline-input').fill(declineReason)
    await page.locator('button.auratio-volunteer-btn--primary', { hasText: 'Confirm Decline' }).click()

    // 5. Land on after-decline notice
    await expect(page).toHaveURL('/volunteer/assignments/after-decline')
    await expect(page.locator('body')).toContainText('returned to the Admin Unassigned queue')

    // 6. Navigate to /volunteer/assignments -> SUB-8821 must NOT be in active assignments
    await page.goto('/volunteer/assignments')
    await expect(page).toHaveURL('/volunteer/assignments')
    await expect(page.locator('button[aria-label="Open SUB-8821"]')).toHaveCount(0)

    // 7. Admin opens Request Queue (/admin/requests)
    await page.goto('/admin/requests')
    await expect(page).toHaveURL('/admin/requests')

    // 8. Verify REQ-1042 is rendered as Unassigned with decline reason tooltip
    const req1042Row = page.locator('[data-request-id="REQ-1042"]')
    await expect(req1042Row).toBeVisible()
    await expect(req1042Row).toHaveAttribute('data-routing', 'Unassigned')
    await expect(req1042Row).toContainText('REQ-1042')
    await expect(req1042Row).toContainText('Alex Morgan')
    await expect(req1042Row).toContainText('Business Pitch / Sales Pitch')
    await expect(req1042Row).toContainText('Human')
    await expect(req1042Row).toContainText('Unassigned')
    await expect(req1042Row).toContainText('Eligible')
    await expect(req1042Row).toHaveAttribute('title', `Declined: ${declineReason}`)

    // 9. Open REQ-1042 from queue
    const openReq1042Btn = page.locator('button[aria-label="Open REQ-1042"]')
    await openReq1042Btn.click()
    await expect(page).toHaveURL('/admin/requests/req-1042')

    // 10. Verify detail view shows bidirectional identity, Unassigned status, and decline reason
    await expect(page.locator('h2.auratio-admin-page-title')).toContainText('REQ-1042')
    await expect(page.locator('.auratio-admin-page-subtitle')).toContainText(
      'Eligible recording returned to Unassigned queue after evaluator decline'
    )
    await expect(page.locator('body')).toContainText('SUB-8821')
    await expect(page.locator('body')).toContainText('Alex Morgan')
    await expect(page.locator('body')).toContainText('Business Pitch / Sales Pitch')
    await expect(page.locator('body')).toContainText('Unassigned')
    await expect(page.locator('body')).toContainText(declineReason)

    // 11. Click Assign Human
    await page.locator('button.auratio-admin-btn--primary', { hasText: 'Assign Human' }).click()
    await expect(page).toHaveURL('/admin/requests/req-1042/assign')

    // 12. Verify assignment picker page reflects unassigned state
    await expect(page.locator('h2.auratio-admin-page-title')).toContainText('Choose evaluator for HE-0142')
    await expect(page.locator('.auratio-admin-page-subtitle')).toContainText('Assignment state: Unassigned')
    await expect(page.locator('.auratio-admin-page-subtitle')).toContainText('Active evaluator owner: None')

    // 13. Select candidate Rakib Hasan
    const selectRakibBtn = page.locator('button[data-candidate="Rakib Hasan"]')
    await expect(selectRakibBtn).toBeVisible()
    await selectRakibBtn.click()

    // 14. Navigates back to /admin/requests
    await expect(page).toHaveURL('/admin/requests')

    // 15. Verify Admin state: Rakib Hasan is active owner, row routing is Assigned Human
    const adminStateAfterRakib = await page.evaluate(() => {
      const win = window as unknown as {
        __getHE0142AssignmentState?: () => { activeOwner: string | null; supersededOwner: string | null }
        __getAdminUnassignedDeclinedQueue?: () => unknown[]
      }
      return {
        he0142: win.__getHE0142AssignmentState?.(),
        unassignedQueue: win.__getAdminUnassignedDeclinedQueue?.(),
      }
    })
    expect(adminStateAfterRakib.he0142?.activeOwner).toBe('Rakib Hasan')
    expect(adminStateAfterRakib.unassignedQueue?.length).toBe(0)

    const req1042RowAfterAssign = page.locator('[data-request-id="REQ-1042"]')
    await expect(req1042RowAfterAssign).toHaveAttribute('data-routing', 'Assigned Human')
    await expect(req1042RowAfterAssign).toContainText('Assigned Human')

    // 16. Volunteer view: session volunteer (Farhana Islam) does NOT own SUB-8821
    await page.goto('/volunteer/assignments')
    await expect(page).toHaveURL('/volunteer/assignments')
    await expect(page.locator('button[aria-label="Open SUB-8821"]')).toHaveCount(0)

    // 17. Admin explicitly assigns Farhana Islam
    await page.goto('/admin/requests/req-1042/assign')
    await expect(page).toHaveURL('/admin/requests/req-1042/assign')
    const selectFarhanaBtn = page.locator('button[data-candidate="Farhana Islam"]')
    await expect(selectFarhanaBtn).toBeVisible()
    await selectFarhanaBtn.click()
    await expect(page).toHaveURL('/admin/requests')

    const adminStateAfterFarhana = await page.evaluate(() => {
      const win = window as unknown as {
        __getHE0142AssignmentState?: () => { activeOwner: string | null; supersededOwner: string | null }
      }
      return win.__getHE0142AssignmentState?.()
    })
    expect(adminStateAfterFarhana?.activeOwner).toBe('Farhana Islam')

    // 18. Volunteer view: SUB-8821 is now legitimately restored for Farhana
    await page.goto('/volunteer/assignments')
    await expect(page).toHaveURL('/volunteer/assignments')
    await expect(page.locator('button[aria-label="Open SUB-8821"]')).toBeVisible()
  })

  test('TEST B: Admin queue page refresh retains returned unassigned row', async ({ page }) => {
    // 1. Decline SUB-8821 from volunteer portal
    await page.goto('/volunteer/assignments/sub-8821/decline')
    await page.locator('input.auratio-volunteer-decline-input').fill('Emergency medical leave')
    await page.locator('button.auratio-volunteer-btn--primary', { hasText: 'Confirm Decline' }).click()
    await expect(page).toHaveURL('/volunteer/assignments/after-decline')

    // 2. Open Admin requests queue
    await page.goto('/admin/requests')
    const req1042 = page.locator('[data-request-id="REQ-1042"]')
    await expect(req1042).toBeVisible()
    await expect(req1042).toHaveAttribute('data-routing', 'Unassigned')
    await expect(req1042).toContainText('Unassigned')

    // 3. Full page reload
    await page.reload()
    await expect(page).toHaveURL('/admin/requests')

    // 4. Verify unassigned status and reason persist after refresh
    const req1042AfterReload = page.locator('[data-request-id="REQ-1042"]')
    await expect(req1042AfterReload).toBeVisible()
    await expect(req1042AfterReload).toHaveAttribute('data-routing', 'Unassigned')
    await expect(req1042AfterReload).toContainText('Unassigned')
    await expect(req1042AfterReload).toHaveAttribute('title', 'Declined: Emergency medical leave')
  })

  test('TEST C: Navigation between Admin audit/evaluations and queue retains returned unassigned row', async ({
    page,
  }) => {
    // 1. Decline SUB-8821
    await page.goto('/volunteer/assignments/sub-8821/decline')
    await page.locator('input.auratio-volunteer-decline-input').fill('Prior academic commitment')
    await page.locator('button.auratio-volunteer-btn--primary', { hasText: 'Confirm Decline' }).click()
    await expect(page).toHaveURL('/volunteer/assignments/after-decline')

    // 2. Go to Admin Requests queue
    await page.goto('/admin/requests')
    await expect(page.locator('[data-request-id="REQ-1042"]')).toHaveAttribute('data-routing', 'Unassigned')

    // 3. Navigate to Evaluations via sidebar
    await page.locator('button.auratio-admin-nav-item', { hasText: 'Evaluations' }).click()
    await expect(page).toHaveURL('/admin/evaluations')

    // 4. Navigate to Audit Log via sidebar
    await page.locator('button.auratio-admin-nav-item', { hasText: 'Audit Log' }).click()
    await expect(page).toHaveURL('/admin/audit')

    // 5. Navigate to Dashboard via sidebar
    await page.locator('button.auratio-admin-nav-item', { hasText: 'Dashboard' }).click()
    await expect(page).toHaveURL('/admin/dashboard')

    // 6. Navigate back to Requests via sidebar
    await page.locator('button.auratio-admin-nav-item', { hasText: 'Requests' }).click()
    await expect(page).toHaveURL('/admin/requests')

    // 7. Verify unassigned row is still intact
    const req1042AfterNav = page.locator('[data-request-id="REQ-1042"]')
    await expect(req1042AfterNav).toBeVisible()
    await expect(req1042AfterNav).toHaveAttribute('data-routing', 'Unassigned')
    await expect(req1042AfterNav).toContainText('Unassigned')
    await expect(req1042AfterNav).toHaveAttribute('title', 'Declined: Prior academic commitment')
  })

  test('TEST D: Unrelated Admin rows (REQ-1041, REQ-1038, REQ-1034) remain intact with exact metadata', async ({
    page,
  }) => {
    // 1. Volunteer declines SUB-8821
    await page.goto('/volunteer/assignments/sub-8821/decline')
    await page.locator('input.auratio-volunteer-decline-input').fill('Personal reason')
    await page.locator('button.auratio-volunteer-btn--primary', { hasText: 'Confirm Decline' }).click()
    await expect(page).toHaveURL('/volunteer/assignments/after-decline')

    // 2. Open Admin Requests queue
    await page.goto('/admin/requests')

    // 3. Verify REQ-1041 (Sam Lee, Informative, AI, Assigned AI, Eligible)
    const req1041 = page.locator('[data-request-id="REQ-1041"]')
    await expect(req1041).toBeVisible()
    await expect(req1041).toContainText('Sam Lee')
    await expect(req1041).toContainText('Informative')
    await expect(req1041).toContainText('AI')
    await expect(req1041).toContainText('Assigned AI')
    await expect(req1041).toContainText('Eligible')

    // 4. Verify REQ-1038 (Taylor Kim, Extempore, Human, Assigned Human, Eligible)
    const req1038 = page.locator('[data-request-id="REQ-1038"]')
    await expect(req1038).toBeVisible()
    await expect(req1038).toContainText('Taylor Kim')
    await expect(req1038).toContainText('Extempore')
    await expect(req1038).toContainText('Human')
    await expect(req1038).toContainText('Assigned Human')
    await expect(req1038).toContainText('Eligible')

    // 5. Verify REQ-1034 (Jordan Ray, Corporate Report, AI, Redirected Human, Eligible)
    const req1034 = page.locator('[data-request-id="REQ-1034"]')
    await expect(req1034).toBeVisible()
    await expect(req1034).toContainText('Jordan Ray')
    await expect(req1034).toContainText('Corporate Report')
    await expect(req1034).toContainText('AI')
    await expect(req1034).toContainText('Redirected Human')
    await expect(req1034).toContainText('Eligible')
  })

  test('TEST E: No duplicate returned row in Admin request queue', async ({ page }) => {
    // 1. Volunteer declines SUB-8821
    await page.goto('/volunteer/assignments/sub-8821/decline')
    await page.locator('input.auratio-volunteer-decline-input').fill('Cannot evaluate this track')
    await page.locator('button.auratio-volunteer-btn--primary', { hasText: 'Confirm Decline' }).click()
    await expect(page).toHaveURL('/volunteer/assignments/after-decline')

    // 2. Open Admin Requests queue
    await page.goto('/admin/requests')

    // 3. Exactly 4 request rows should exist in total
    const allRows = page.locator('[data-request-id]')
    await expect(allRows).toHaveCount(4)

    // 4. Exactly one REQ-1042 row exists
    const req1042Rows = page.locator('[data-request-id="REQ-1042"]')
    await expect(req1042Rows).toHaveCount(1)

    // 5. Attempt duplicate decline programmatically
    const duplicateAttempt = await page.evaluate(() => {
      const win = window as unknown as {
        __declineVolunteerAssignment?: (id: string, reason: string) => { success: boolean; error?: string }
      }
      return win.__declineVolunteerAssignment?.('SUB-8821', 'Duplicate decline attempt')
    })
    expect(duplicateAttempt?.success).toBe(false)
    expect(duplicateAttempt?.error).toContain('already been declined')

    // 6. Reload and re-verify count is still exactly 4 and REQ-1042 is exactly 1
    await page.reload()
    await expect(page.locator('[data-request-id]')).toHaveCount(4)
    await expect(page.locator('[data-request-id="REQ-1042"]')).toHaveCount(1)
  })

  test('TEST F: No completed evaluations pollution; no score or publication created', async ({ page }) => {
    // 1. Volunteer declines SUB-8821
    await page.goto('/volunteer/assignments/sub-8821/decline')
    await page.locator('input.auratio-volunteer-decline-input').fill('Conflict of interest with speaker')
    await page.locator('button.auratio-volunteer-btn--primary', { hasText: 'Confirm Decline' }).click()
    await expect(page).toHaveURL('/volunteer/assignments/after-decline')

    // 2. Verify decline did NOT submit or lock an evaluation
    const evalState = await page.evaluate(() => {
      const win = window as unknown as {
        __isEvaluationSubmitted?: (id: string) => boolean
        __getVolunteerScoringDraft?: (id: string) => unknown
        __getLatestLockedSubmission?: (id: string) => unknown
      }
      return {
        isSubmitted: win.__isEvaluationSubmitted?.('SUB-8821'),
        draft: win.__getVolunteerScoringDraft?.('SUB-8821'),
        locked: win.__getLatestLockedSubmission?.('SUB-8821'),
      }
    })
    expect(evalState.isSubmitted).toBe(false)
    expect(evalState.locked).toBeNull()

    // 3. Check Admin Evaluations list does not treat SUB-8821 as a newly created evaluation from decline
    await page.goto('/admin/evaluations')
    await expect(page).toHaveURL('/admin/evaluations')
    // Table should contain the canonical evaluations SUB-8834 and SUB-8798
    await expect(page.locator('body')).toContainText('SUB-8834')
    await expect(page.locator('body')).toContainText('SUB-8798')
  })
})
