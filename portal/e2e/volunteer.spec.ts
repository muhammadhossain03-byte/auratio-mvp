import {
  test,
  expect,
  captureEvidenceScreenshot,
  captureHumanFixH1Screenshot,
  resetMockState,
  registerErrorTracking,
  assertNoPageErrors,
} from './helpers/fixtures'

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

  test('Defect H1-01: Active Assignments button controls and continuation routing (TC 1 - TC 9)', async ({ page }) => {
    await page.goto('/volunteer/assignments')
    await expect(page).toHaveURL('/volunteer/assignments')

    // TC 1: SUB-8814 Open control is an accessible <button>
    const sub8814Btn = page.locator('button[aria-label="Open SUB-8814"]')
    await expect(sub8814Btn).toBeVisible()
    expect(await sub8814Btn.evaluate((el) => el.tagName.toLowerCase())).toBe('button')

    // TC 2: SUB-8799 Open control is an accessible <button>
    const sub8799Btn = page.locator('button[aria-label="Open SUB-8799"]')
    await expect(sub8799Btn).toBeVisible()
    expect(await sub8799Btn.evaluate((el) => el.tagName.toLowerCase())).toBe('button')

    // Verify SUB-8821 is also a button
    const sub8821Btn = page.locator('button[aria-label="Open SUB-8821"]')
    await expect(sub8821Btn).toBeVisible()

    // Screenshot 1: 01_active_assignments_three_buttons.png
    await captureHumanFixH1Screenshot(page, '01_active_assignments_three_buttons.png')

    // TC 3: Click SUB-8814 Open navigates to /volunteer/assignments/sub-8814
    await sub8814Btn.click()
    await expect(page).toHaveURL('/volunteer/assignments/sub-8814')

    // TC 4: Page displays SUB-8814, Extempore, Accepted
    await expect(page.locator('h2.auratio-volunteer-page-title')).toContainText('SUB-8814')
    await expect(page.locator('body')).toContainText('Extempore')
    await expect(page.locator('.auratio-volunteer-pill--accepted')).toBeVisible()

    // TC 5: Does NOT display SUB-8821
    const sub8814Body = await page.innerText('body')
    expect(sub8814Body).not.toContain('SUB-8821')

    // Screenshot 2: 02_sub8814_accepted_view.png
    await captureHumanFixH1Screenshot(page, '02_sub8814_accepted_view.png')

    // TC 6: Clicking SUB-8799 Open from assignments navigates to /volunteer/evaluation/sub-8799 directly
    await page.goto('/volunteer/assignments')
    await page.locator('button[aria-label="Open SUB-8799"]').click()
    await expect(page).toHaveURL('/volunteer/evaluation/sub-8799')

    // TC 7: Page displays SUB-8799, Informative, In Evaluation
    await expect(page.locator('h2.auratio-volunteer-page-title')).toContainText('SUB-8799')
    await expect(page.locator('p.auratio-volunteer-page-subtitle')).toContainText('Informative')
    await expect(page.locator('.auratio-volunteer-pill--in-evaluation-header')).toBeVisible()

    // TC 8: Does NOT display SUB-8821
    const sub8799Body = await page.innerText('body')
    expect(sub8799Body).not.toContain('SUB-8821')

    // Screenshot 3: 03_sub8799_workspace_direct.png
    await captureHumanFixH1Screenshot(page, '03_sub8799_workspace_direct.png')

    // TC 9: Unknown ID redirects safely to /volunteer/assignments
    await page.goto('/volunteer/assignments/sub-9999')
    await expect(page).toHaveURL('/volunteer/assignments')
  })

  test('Defect H1-02: Real editable scoring, anchor-first, whitespace rejection, reactivity, isolation, review & submit, and re-review (TC 10 - TC 33)', async ({ page }) => {
    // Navigate to fresh evaluation for SUB-8821
    await page.goto('/volunteer/evaluation/sub-8821')
    await expect(page).toHaveURL('/volunteer/evaluation/sub-8821')

    // TC 10: Fresh evaluation shows 0 / 100
    const bodyText = await page.innerText('body')
    expect(bodyText).toContain('0 / 100')

    // TC 11: Breakdown shows 0 / 40 and 0 / 20
    expect(bodyText).toContain('0 / 40')
    expect(bodyText).toContain('0 / 20')

    // Screenshot 4: 04_fresh_workspace_empty_scores.png
    await captureHumanFixH1Screenshot(page, '04_fresh_workspace_empty_scores.png')

    // TC 12: 0 / 16 criterion scores
    expect(bodyText).toContain('0 / 16')
    // TC 13: 0 / 16 criteria complete
    expect(bodyText).toContain('0 / 16 criteria complete')
    // TC 14: 0 / 16 assessed
    expect(bodyText).toContain('0 / 16 assessed')
    // TC 15: Not ready
    expect(bodyText).toContain('Not ready')

    // TC 16: Review & Submit disabled
    const reviewSubmitBtn = page.locator('button.auratio-volunteer-btn--primary', { hasText: 'Review & Submit' })
    await expect(reviewSubmitBtn).toBeDisabled()

    // Screenshot 5: 05_fresh_completeness_disabled_submit.png
    await captureHumanFixH1Screenshot(page, '05_fresh_completeness_disabled_submit.png')

    // Navigate to criterion editor
    await page.locator('button.auratio-volunteer-btn--secondary', { hasText: 'Open Universal Delivery' }).click()
    await expect(page).toHaveURL(/\/volunteer\/evaluation\/sub-8821\/criterion/)

    // TC 17: Exact score input is disabled before anchor selection
    const exactScoreInput = page.locator('input[aria-label="Exact score"]')
    await expect(exactScoreInput).toBeDisabled()

    // Screenshot 6: 06_criterion_editor_score_disabled.png
    await captureHumanFixH1Screenshot(page, '06_criterion_editor_score_disabled.png')

    // TC 18: Selecting "Low" enables exact score input and allows scores in 0-30% range (0-1)
    await page.locator('input[name="anchor"][value="Low"]').click()
    await expect(exactScoreInput).toBeEnabled()
    await expect(exactScoreInput).toHaveAttribute('placeholder', '0–1')

    // TC 19: Selecting "Competent" sets range to 31-70% (2-3)
    await page.locator('input[name="anchor"][value="Competent"]').click()
    await expect(exactScoreInput).toHaveAttribute('placeholder', '2–3')

    // TC 20: Selecting "Excellent" sets range to 71-100% (4-5)
    await page.locator('input[name="anchor"][value="Excellent"]').click()
    await expect(exactScoreInput).toHaveAttribute('placeholder', '4–5')

    // Screenshot 7: 07_criterion_editor_anchor_selected.png
    await captureHumanFixH1Screenshot(page, '07_criterion_editor_anchor_selected.png')

    // TC 21: Score above criterion maximum is rejected with error
    await exactScoreInput.fill('15')
    const overflowText = await page.innerText('body')
    expect(overflowText).toMatch(/Score cannot exceed|exceed/)

    // Set valid score for Excellent: 4
    await exactScoreInput.fill('4')

    // Selectors for 4 feedback textareas
    const evidenceTextarea = page.locator('textarea.auratio-volunteer-feedback-textarea--evidence')
    const strengthTextarea = page.locator('textarea.auratio-volunteer-feedback-textarea--strength')
    const weaknessTextarea = page.locator('textarea.auratio-volunteer-feedback-textarea--weakness')
    const adviceTextarea = page.locator('textarea.auratio-volunteer-feedback-textarea--advice')
    const completenessRow = page.locator('.auratio-volunteer-criterion-completeness-row')

    // TC 22: Pure whitespace in timestamped evidence rejected
    await evidenceTextarea.fill('     ')
    await strengthTextarea.fill('Strong vocal delivery')
    await weaknessTextarea.fill('Pacing slowed slightly')
    await adviceTextarea.fill('Calibrate WPM evenly')
    await page.locator('button.auratio-volunteer-btn--primary', { hasText: 'Save Criterion Feedback' }).click()
    await expect(completenessRow).toContainText('Timestamped evidence —')

    // Screenshot 8: 08_criterion_whitespace_rejected.png
    await captureHumanFixH1Screenshot(page, '08_criterion_whitespace_rejected.png')

    // TC 23: Pure whitespace in strength rejected
    await evidenceTextarea.fill('At 01:24, clear pause placement')
    await strengthTextarea.fill('   \n\t  ')
    await page.locator('button.auratio-volunteer-btn--primary', { hasText: 'Save Criterion Feedback' }).click()
    await expect(completenessRow).toContainText('Strength —')

    // TC 24: Pure whitespace in weakness rejected
    await strengthTextarea.fill('Strong pitch')
    await weaknessTextarea.fill('   ')
    await page.locator('button.auratio-volunteer-btn--primary', { hasText: 'Save Criterion Feedback' }).click()
    await expect(completenessRow).toContainText('Weakness —')

    // TC 25: Pure whitespace in advice rejected
    await weaknessTextarea.fill('Could improve')
    await adviceTextarea.fill('  \t ')
    await page.locator('button.auratio-volunteer-btn--primary', { hasText: 'Save Criterion Feedback' }).click()
    await expect(completenessRow).toContainText('Actionable advice —')

    // TC 26: Valid completion marks all complete
    await adviceTextarea.fill('Practice pacing with a timer')
    await expect(completenessRow).toContainText('Anchor ✓')
    await expect(completenessRow).toContainText('Exact score ✓')
    await expect(completenessRow).toContainText('Timestamped evidence ✓')
    await expect(completenessRow).toContainText('Strength ✓')
    await expect(completenessRow).toContainText('Weakness ✓')
    await expect(completenessRow).toContainText('Actionable advice ✓')

    // Screenshot 9: 09_criterion_complete_valid_fields.png
    await captureHumanFixH1Screenshot(page, '09_criterion_complete_valid_fields.png')

    // Save and return to workspace
    await page.locator('button.auratio-volunteer-btn--primary', { hasText: 'Save Criterion Feedback' }).click()
    await expect(page).toHaveURL(/\/volunteer\/evaluation\/sub-8821$/)
    await expect(page.locator('h2.auratio-volunteer-page-title')).toHaveText('SUB-8821')

    // TC 27: Reactive score calculation update
    const reactiveText = await page.innerText('body')
    expect(reactiveText).toContain('4 / 40')
    expect(reactiveText).toContain('4 / 100')
    expect(reactiveText).toContain('1 / 16')

    // Screenshot 10: 10_workspace_reactive_totals_updated.png
    await captureHumanFixH1Screenshot(page, '10_workspace_reactive_totals_updated.png')

    // TC 28: Displays track-specific criteria matching assignment track (Business Pitch)
    expect(reactiveText).toContain('Problem-solution fit')
    expect(reactiveText).toContain('Value proposition clarity')

    // TC 29: Evaluation state isolation between SUB-8821 and SUB-8814
    await page.goto('/volunteer/evaluation/sub-8814')
    const sub8814Text = await page.innerText('body')
    expect(sub8814Text).toContain('0 / 100')
    expect(sub8814Text).toContain('Rapid time-to-thesis')
    expect(sub8814Text).toContain('Spontaneous structure')

    // Return to SUB-8821
    await page.goto('/volunteer/evaluation/sub-8821')

    // TC 30: Overall summary is required before Review & Submit can be enabled
    // Complete all 16 criteria in draft storage, but leave overallSummary empty
    await page.evaluate(() => {
      const raw = window.sessionStorage.getItem('auratio_volunteer_draft_SUB-8821')
      if (raw) {
        const draft = JSON.parse(raw)
        for (const key of Object.keys(draft.criteria)) {
          const c = draft.criteria[key]
          c.anchor = 'Excellent'
          c.exactScore = c.maxPoints
          c.evidenceTimestamp = '01:00'
          c.evidence = 'Strong execution'
          c.strength = 'Clear mastery'
          c.weakness = 'Minor polish'
          c.advice = 'Keep momentum'
        }
        draft.overallSummary = ''
        window.sessionStorage.setItem('auratio_volunteer_draft_SUB-8821', JSON.stringify(draft))
      }
    })
    await page.goto('/volunteer/evaluation/sub-8821')
    await expect(reviewSubmitBtn).toBeDisabled()

    // TC 31: Fill overall summary -> Review & Submit enables and navigates to review
    await page.locator('textarea.auratio-volunteer-overall-summary-textarea').fill('Outstanding pitch demonstrating strong product-market fit, cohesive flow, and compelling delivery.')
    await expect(reviewSubmitBtn).toBeEnabled()

    // Screenshot 11: 11_review_submit_enabled_16_criteria.png
    await captureHumanFixH1Screenshot(page, '11_review_submit_enabled_16_criteria.png')

    await reviewSubmitBtn.click()
    await expect(page).toHaveURL('/volunteer/evaluation/sub-8821/review')

    // Cancel in review returns to scoring workspace
    await page.locator('button.auratio-volunteer-btn--secondary', { hasText: 'Cancel' }).click()
    await expect(page).toHaveURL('/volunteer/evaluation/sub-8821')

    // Reopen review
    await page.locator('button.auratio-volunteer-btn--primary', { hasText: 'Review & Submit' }).click()
    await expect(page).toHaveURL('/volunteer/evaluation/sub-8821/review')

    // TC 32: Confirming submission locks evaluation, records it in completed history, and removes from active assignments
    await page.locator('button.auratio-volunteer-btn--primary', { hasText: 'Confirm & Submit' }).click()
    await expect(page).toHaveURL('/volunteer/evaluation/sub-8821/submitted')
    await expect(page.locator('text=Evaluation submitted')).toBeVisible()

    // Screenshot 12: 12_submitted_page_locked.png
    await captureHumanFixH1Screenshot(page, '12_submitted_page_locked.png')

    // Verify SUB-8821 is removed from Active Assignments list
    await page.goto('/volunteer/assignments')
    const activeAssignmentsText = await page.innerText('body')
    expect(activeAssignmentsText).not.toContain('SUB-8821')

    // TC 33: Reopened evaluation displays preserved prior submission version and score
    await page.goto('/volunteer/evaluation/sub-8821/reopened')
    await expect(page).toHaveURL('/volunteer/evaluation/sub-8821/reopened')
    const reopenedText = await page.innerText('body')
    expect(reopenedText).toContain('100 / 100')

    // Screenshot 13: 13_reopened_page_prior_version.png
    await captureHumanFixH1Screenshot(page, '13_reopened_page_prior_version.png')

    await page.locator('button.auratio-volunteer-btn--primary', { hasText: 'Continue Correction' }).click()
    await expect(page).toHaveURL('/volunteer/evaluation/sub-8821')
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
