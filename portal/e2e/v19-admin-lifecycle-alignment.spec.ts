import fs from 'node:fs'
import path from 'node:path'
import { expect, test } from '@playwright/test'
import { assertNoPageErrors, registerErrorTracking, resetMockState } from './helpers/fixtures'

const captureDir = path.resolve(process.cwd(), 'capture_output')

async function capture(page: any, name: string) {
  fs.mkdirSync(captureDir, { recursive: true })
  await page.screenshot({ path: path.join(captureDir, name), fullPage: false, animations: 'disabled' })
}

test.use({ viewport: { width: 1366, height: 900 } })

test.describe('v1.9 Admin lifecycle alignment', () => {
  test.beforeEach(async ({ page }) => {
    registerErrorTracking(page)
    await resetMockState(page)
  })

  test.afterEach(async ({ page }) => {
    assertNoPageErrors(page)
  })

  test('REQ-1042 assigned state exposes Reassign Human, not Assign Human, plus Cancel Request', async ({ page }) => {
    await page.goto('/admin/requests/req-1042')
    await expect(page.getByRole('button', { name: 'Reassign Human' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Assign Human', exact: true })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Cancel Request' })).toBeVisible()
    await expect(page.getByTestId('req1042-lifecycle-actions')).toContainText('Farhana Islam')
    await capture(page, 'portal_v19_admin_req1042_assigned_actions.png')
  })

  test('REQ-1042 reassignment stages candidate without mutating owner and confirms dynamically', async ({ page }) => {
    await page.goto('/admin/requests/req-1042')
    await page.getByRole('button', { name: 'Reassign Human' }).click()
    await expect(page).toHaveURL('/admin/requests/req-1042/assign')

    await page.locator('button[data-candidate="Rakib Hasan"]').click()
    await expect(page).toHaveURL('/admin/requests/req-1042/reassign')

    const staged = await page.evaluate(() => {
      const win = window as any
      return {
        owner: win.__getHE0142AssignmentState?.(),
        pending: win.__getHE0142PendingReassignment?.(),
      }
    })
    expect(staged.owner?.activeOwner).toBe('Farhana Islam')
    expect(staged.pending?.candidate).toBe('Rakib Hasan')
    await expect(page.getByTestId('previous-assignment-card')).toContainText('Farhana Islam')
    await expect(page.getByTestId('new-assignment-card')).toContainText('Rakib Hasan')
    await capture(page, 'portal_v19_admin_req1042_reassignment_confirm.png')

    await page.getByRole('button', { name: 'Cancel' }).click()
    await expect(page).toHaveURL('/admin/requests/req-1042')
    const cancelledStage = await page.evaluate(() => {
      const win = window as any
      return { owner: win.__getHE0142AssignmentState?.(), pending: win.__getHE0142PendingReassignment?.() }
    })
    expect(cancelledStage.owner?.activeOwner).toBe('Farhana Islam')
    expect(cancelledStage.pending).toBeNull()

    await page.getByRole('button', { name: 'Reassign Human' }).click()
    await page.locator('button[data-candidate="Rakib Hasan"]').click()
    await page.locator('#reassignment-reason').fill('Coverage adjustment for evaluator workload')
    await page.getByRole('button', { name: 'Confirm Reassignment' }).click()
    await expect(page).toHaveURL('/admin/requests/req-1042')
    const confirmed = await page.evaluate(() => (window as any).__getHE0142AssignmentState?.())
    expect(confirmed?.activeOwner).toBe('Rakib Hasan')
    expect(confirmed?.supersededOwner).toBe('Farhana Islam')
  })

  test('REQ-1042 cancellation requires internal reason and becomes terminal history', async ({ page }) => {
    await page.goto('/admin/requests/req-1042/cancel')
    const confirm = page.getByRole('button', { name: 'Cancel Request' })
    await expect(confirm).toBeDisabled()
    await page.getByLabel('Internal cancellation reason').fill('Duplicate operational request opened in error')
    await expect(confirm).toBeEnabled()
    await capture(page, 'portal_v19_admin_req1042_cancel_reason.png')
    await confirm.click()
    await expect(page).toHaveURL('/admin/requests')
    const row = page.locator('[data-request-id="REQ-1042"]')
    await expect(row).toHaveAttribute('data-routing', 'Cancelled')
    await row.getByRole('button', { name: 'Open REQ-1042' }).click()
    await expect(page.getByTestId('req1042-cancelled-state')).toContainText('Duplicate operational request opened in error')
    await expect(page.getByRole('button', { name: 'Reassign Human' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Assign Human', exact: true })).toHaveCount(0)
  })

  test('SUB-8834 processing screen exposes Reassign and Cancel, with staged/confirmed versioned reassignment', async ({ page }) => {
    await page.goto('/admin/evaluations/sub-8834')
    await expect(page.getByRole('button', { name: 'Reassign Human' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Cancel Request' })).toBeVisible()
    await expect(page.locator('body')).toContainText('Rakib Hasan')
    await capture(page, 'portal_v19_admin_sub8834_processing_actions.png')

    await page.getByRole('button', { name: 'Reassign Human' }).click()
    await page.locator('button[data-sub8834-candidate="Tasnim Noor"]').click()
    await expect(page).toHaveURL('/admin/evaluations/sub-8834/reassign/confirm')

    const staged = await page.evaluate(() => (window as any).__getSUB8834LifecycleState?.())
    expect(staged.activeOwner).toBe('Rakib Hasan')
    expect(staged.pendingCandidate).toBe('Tasnim Noor')
    expect(staged.version).toBe(1)

    await page.getByLabel('SUB-8834 reassignment reason').fill('Balance active evaluator workload')
    await capture(page, 'portal_v19_admin_sub8834_reassign_confirm.png')
    await page.getByRole('button', { name: 'Confirm Reassignment' }).click()
    await expect(page).toHaveURL('/admin/evaluations/sub-8834')

    const confirmed = await page.evaluate(() => (window as any).__getSUB8834LifecycleState?.())
    expect(confirmed.activeOwner).toBe('Tasnim Noor')
    expect(confirmed.supersededOwner).toBe('Rakib Hasan')
    expect(confirmed.pendingCandidate).toBeNull()
    expect(confirmed.version).toBe(2)
  })

  test('SUB-8834 Cancel Request records mandatory internal reason and remains in evaluation history', async ({ page }) => {
    await page.goto('/admin/evaluations/sub-8834/cancel')
    const confirm = page.getByRole('button', { name: 'Cancel Request' })
    await expect(confirm).toBeDisabled()
    await page.getByLabel('SUB-8834 cancellation reason').fill('Submission cannot proceed because the session was withdrawn')
    await capture(page, 'portal_v19_admin_sub8834_cancel_reason.png')
    await confirm.click()
    await expect(page).toHaveURL('/admin/evaluations')

    const row = page.locator('[data-evaluation-id="SUB-8834"]')
    await expect(row).toContainText('Cancelled')
    await row.getByRole('button', { name: 'Open' }).click()
    await expect(page).toHaveURL('/admin/evaluations/sub-8834')
    await expect(page.getByTestId('sub8834-cancelled-state')).toContainText('Submission cannot proceed because the session was withdrawn')
    await expect(page.getByRole('button', { name: 'Reassign Human' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Cancel Request' })).toHaveCount(0)
    await capture(page, 'portal_v19_admin_sub8834_cancelled_history.png')
  })

  test('Pending Moderation exposes Reassign Human and Reject Evaluation; reassignment reopens new evaluator version', async ({ page }) => {
    await page.goto('/admin/moderation/sub-8821')
    await expect(page.getByRole('button', { name: 'Reassign Human' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Reject Evaluation' })).toBeVisible()
    await capture(page, 'portal_v19_admin_moderation_actions.png')

    await page.getByRole('button', { name: 'Reassign Human' }).click()
    await expect(page).toHaveURL('/admin/requests/req-1042/assign?source=moderation')
    await page.locator('button[data-candidate="Rakib Hasan"]').click()
    await expect(page).toHaveURL('/admin/requests/req-1042/reassign')
    await page.locator('#reassignment-reason').fill('Reassign submitted review to alternate qualified evaluator')
    await page.getByRole('button', { name: 'Confirm Reassignment' }).click()
    await expect(page).toHaveURL('/admin/evaluations')

    const state = await page.evaluate(() => {
      const win = window as any
      return {
        owner: win.__getHE0142AssignmentState?.(),
        moderation: win.__getModerationEntityState?.('SUB-8821'),
      }
    })
    expect(state.owner.activeOwner).toBe('Rakib Hasan')
    expect(state.owner.supersededOwner).toBe('Farhana Islam')
    expect(state.moderation.publicationStatus).toBe('Reopened')
  })

  test('Reject Evaluation requires internal reason and preserves score-edit boundary', async ({ page }) => {
    await page.goto('/admin/moderation/sub-8821/reject')
    await expect(page.locator('h2.auratio-admin-page-title')).toHaveText('Reject Evaluation')
    const confirm = page.getByRole('button', { name: 'Reject Evaluation' })
    await expect(confirm).toBeDisabled()
    await page.getByLabel('Internal rejection reason').fill('Evaluator evidence is not valid enough to publish')
    await expect(confirm).toBeEnabled()
    await expect(page.locator('body')).toContainText('not shown to the speaker or Volunteer evaluator')
    await capture(page, 'portal_v19_admin_reject_evaluation.png')
    await confirm.click()
    await expect(page).toHaveURL('/admin/evaluations')
    const state = await page.evaluate(() => (window as any).__getModerationEntityState?.('SUB-8821'))
    expect(state.publicationStatus).toBe('Rejected')
    expect(state.rejectionReason).toBe('Evaluator evidence is not valid enough to publish')
  })
})
