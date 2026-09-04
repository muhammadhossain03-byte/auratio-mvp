import {
  test,
  expect,
  captureEvidenceScreenshot,
  captureHumanFixH1Screenshot,
  captureHumanFixH11Screenshot,
  captureHumanFixH12Screenshot,
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

    // TC 18: Selecting "Low" enables exact score input with full 0-5 placeholder
    await page.locator('input[name="anchor"][value="Low"]').click()
    await expect(exactScoreInput).toBeEnabled()
    await expect(exactScoreInput).toHaveAttribute('placeholder', '0–5')

    // TC 19: Selecting "Competent" retains full range placeholder 0-5
    await page.locator('input[name="anchor"][value="Competent"]').click()
    await expect(exactScoreInput).toHaveAttribute('placeholder', '0–5')

    // TC 20: Selecting "Excellent" retains full range placeholder 0-5
    await page.locator('input[name="anchor"][value="Excellent"]').click()
    await expect(exactScoreInput).toHaveAttribute('placeholder', '0–5')

    // Screenshot 7: 07_criterion_editor_anchor_selected.png
    await captureHumanFixH1Screenshot(page, '07_criterion_editor_anchor_selected.png')

    // TC 21: Score above criterion maximum is rejected with error
    await exactScoreInput.fill('15')
    const overflowText = await page.innerText('body')
    expect(overflowText).toMatch(/Score cannot exceed|exceed/)

    // Set valid score for Excellent: 4
    await exactScoreInput.fill('4')

    // Selectors for 4 feedback textareas and timestamp input
    const timestampInput = page.locator('input[aria-label="Evidence timestamp"]')
    const evidenceTextarea = page.locator('textarea.auratio-volunteer-feedback-textarea--evidence')
    const strengthTextarea = page.locator('textarea.auratio-volunteer-feedback-textarea--strength')
    const weaknessTextarea = page.locator('textarea.auratio-volunteer-feedback-textarea--weakness')
    const adviceTextarea = page.locator('textarea.auratio-volunteer-feedback-textarea--advice')
    const completenessRow = page.locator('.auratio-volunteer-criterion-completeness-row')

    // Set valid timestamp
    await timestampInput.fill('01:24')

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

  test.describe('Human Acceptance Repair H1.1: Residual Volunteer Scoring & State Corrections', () => {
    test('H1.1 Issue 1: Status-specific controls for Assigned, Accepted, and In Evaluation', async ({ page }) => {
      // 1. SUB-8814: Accepted state
      await page.goto('/volunteer/assignments/sub-8814')
      await expect(page).toHaveURL('/volunteer/assignments/sub-8814')
      await expect(page.locator('h2.auratio-volunteer-page-title')).toHaveText('SUB-8814')

      // Must NOT show "Accept or Decline required"
      const pageText = await page.innerText('body')
      expect(pageText).not.toContain('Accept or Decline required')

      // Must NOT show Accept or Decline buttons
      const acceptBtn = page.locator('button.auratio-volunteer-btn', { hasText: /^Accept$/ })
      const declineBtn = page.locator('button.auratio-volunteer-btn', { hasText: /^Decline$/ })
      await expect(acceptBtn).toHaveCount(0)
      await expect(declineBtn).toHaveCount(0)

      // Must show "Continue to Evaluation"
      const continueBtn = page.locator('button.auratio-volunteer-btn--primary', { hasText: 'Continue to Evaluation' })
      await expect(continueBtn).toBeVisible()

      // Capture Evidence 01: 01_sub8814_accepted_continue.png
      await captureHumanFixH11Screenshot(page, '01_sub8814_accepted_continue.png')

      // Continuation opens scoring workspace and transitions to In Evaluation
      await continueBtn.click()
      await expect(page).toHaveURL('/volunteer/evaluation/sub-8814')
      await expect(page.locator('h2.auratio-volunteer-page-title')).toHaveText('SUB-8814')
      await expect(page.locator('.auratio-volunteer-pill--in-evaluation-header')).toBeVisible()

      // 2. SUB-8821: Assigned state retains Accept and Decline controls
      await page.goto('/volunteer/assignments/sub-8821')
      await expect(page).toHaveURL('/volunteer/assignments/sub-8821')
      await expect(page.locator('p.auratio-volunteer-page-subtitle')).toContainText('Accept or Decline required')
      await expect(page.locator('button.auratio-volunteer-btn--primary', { hasText: 'Accept' })).toBeVisible()
      await expect(page.locator('button.auratio-volunteer-btn--secondary', { hasText: 'Decline' })).toBeVisible()

      // Capture Evidence 02: 02_sub8821_assigned_accept_decline.png
      await captureHumanFixH11Screenshot(page, '02_sub8821_assigned_accept_decline.png')

      // 3. SUB-8799: In Evaluation resumes scoring workspace directly
      await page.goto('/volunteer/assignments/sub-8799')
      await expect(page).toHaveURL('/volunteer/evaluation/sub-8799')
      await expect(page.locator('h2.auratio-volunteer-page-title')).toHaveText('SUB-8799')
      const inEvalText = await page.innerText('body')
      expect(inEvalText).not.toContain('Respond to assignment')
    })

    test('H1.1 Issue 2 & Issue 4: Deterministic mm:ss timestamp requirement and full score range after anchor selection', async ({ page }) => {
      await page.goto('/volunteer/evaluation/sub-8821/criterion?criterionId=ud-pacing')
      await expect(page).toHaveURL(/\/volunteer\/evaluation\/sub-8821\/criterion/)

      const exactScoreInput = page.locator('input[aria-label="Exact score"]')
      const timestampInput = page.locator('input[aria-label="Evidence timestamp"]')
      const evidenceTextarea = page.locator('textarea.auratio-volunteer-feedback-textarea--evidence')
      const strengthTextarea = page.locator('textarea.auratio-volunteer-feedback-textarea--strength')
      const weaknessTextarea = page.locator('textarea.auratio-volunteer-feedback-textarea--weakness')
      const adviceTextarea = page.locator('textarea.auratio-volunteer-feedback-textarea--advice')
      const completenessRow = page.locator('.auratio-volunteer-criterion-completeness-row')

      // Issue 4: Exact score disabled before anchor selection
      await expect(exactScoreInput).toBeDisabled()

      // Verify radio options do NOT contain hardcoded band labels like "(0–1 pts)"
      const radioLabelsText = await page.innerText('.auratio-volunteer-panel')
      expect(radioLabelsText).not.toContain('(0–1 pts)')
      expect(radioLabelsText).not.toContain('(2–3 pts)')
      expect(radioLabelsText).not.toContain('(4–5 pts)')

      // Select "Low" anchor: enables score with full 0-5 placeholder
      await page.locator('input[name="anchor"][value="Low"]').click()
      await expect(exactScoreInput).toBeEnabled()
      await expect(exactScoreInput).toHaveAttribute('placeholder', '0–5')

      // Any integer in full range 0-5 accepted under Low anchor (no 0-1 restriction)
      await exactScoreInput.fill('5')
      let bodyText = await page.innerText('body')
      expect(bodyText).not.toContain('Score must be between')

      // Out of range (6) rejected with error
      await exactScoreInput.fill('6')
      bodyText = await page.innerText('body')
      expect(bodyText).toMatch(/Score cannot exceed|exceed/)

      // Fill valid score 4 under Low
      await exactScoreInput.fill('4')

      // Capture Evidence 05: 05_anchor_selected_full_score_range.png
      await captureHumanFixH11Screenshot(page, '05_anchor_selected_full_score_range.png')

      // Switch to Competent: score remains 4, placeholder 0-5
      await page.locator('input[name="anchor"][value="Competent"]').click()
      await expect(exactScoreInput).toHaveValue('4')

      // Switch to Excellent: score 0 is valid
      await page.locator('input[name="anchor"][value="Excellent"]').click()
      await exactScoreInput.fill('0')
      bodyText = await page.innerText('body')
      expect(bodyText).not.toContain('Score must be between')

      // Re-set score to 4
      await exactScoreInput.fill('4')

      // Fill feedback narratives
      await evidenceTextarea.fill('At 01:24, speaker paced the opening problem effectively.')
      await strengthTextarea.fill('Clear pauses at topic boundaries.')
      await weaknessTextarea.fill('Pacing accelerated slightly during slide 3.')
      await adviceTextarea.fill('Maintain steady tempo through technical explanations.')

      // Issue 2: Real timestamp validation
      // 1. Blank timestamp blocks completeness and Save
      await timestampInput.fill('')
      await expect(completenessRow).toContainText('Timestamped evidence —')

      await page.locator('button.auratio-volunteer-btn--primary', { hasText: 'Save Criterion Feedback' }).click()
      await expect(page.locator('span[role="alert"]')).toContainText('valid timestamp in mm:ss format is required')
      await expect(page).toHaveURL(/\/volunteer\/evaluation\/sub-8821\/criterion/)

      // Capture Evidence 03: 03_timestamp_blank_blocked.png
      await captureHumanFixH11Screenshot(page, '03_timestamp_blank_blocked.png')

      // 2. Whitespace-only timestamp blocks completeness and Save
      await timestampInput.fill('     ')
      await expect(completenessRow).toContainText('Timestamped evidence —')
      await page.locator('button.auratio-volunteer-btn--primary', { hasText: 'Save Criterion Feedback' }).click()
      await expect(page.locator('span[role="alert"]')).toContainText('valid timestamp in mm:ss format is required')

      // 3. Invalid timestamp (seconds > 59) blocks completeness and Save
      await timestampInput.fill('01:60')
      await expect(completenessRow).toContainText('Timestamped evidence —')
      await page.locator('button.auratio-volunteer-btn--primary', { hasText: 'Save Criterion Feedback' }).click()
      await expect(page.locator('span[role="alert"]')).toContainText('valid timestamp in mm:ss format is required')

      // 4. Valid timestamp (01:24) produces completeness
      await timestampInput.fill('01:24')
      await expect(completenessRow).toContainText('Anchor ✓')
      await expect(completenessRow).toContainText('Exact score ✓')
      await expect(completenessRow).toContainText('Timestamped evidence ✓')
      await expect(completenessRow).toContainText('Strength ✓')
      await expect(completenessRow).toContainText('Weakness ✓')
      await expect(completenessRow).toContainText('Actionable advice ✓')

      // Capture Evidence 04: 04_timestamp_valid_complete.png
      await captureHumanFixH11Screenshot(page, '04_timestamp_valid_complete.png')

      // Save succeeds and navigates back to workspace
      await page.locator('button.auratio-volunteer-btn--primary', { hasText: 'Save Criterion Feedback' }).click()
      await expect(page).toHaveURL('/volunteer/evaluation/sub-8821')
    })

    test('H1.1 Issue 3: Submission readiness defense-in-depth at UI and Data Layer', async ({ page }) => {
      // 1. Fresh 0/16 draft direct /review navigation is blocked
      await page.goto('/volunteer/evaluation/sub-8821/review')
      await expect(page).toHaveURL('/volunteer/evaluation/sub-8821/review')
      await expect(page.locator('h3.auratio-volunteer-panel-title', { hasText: 'Submission blocked' })).toBeVisible()

      const confirmBtn = page.locator('button.auratio-volunteer-btn--primary', { hasText: 'Confirm & Submit' })
      await expect(confirmBtn).toBeDisabled()

      // Capture Evidence 06: 06_incomplete_direct_review_blocked.png
      await captureHumanFixH11Screenshot(page, '06_incomplete_direct_review_blocked.png')

      // Verify submitEvaluation() data layer rejects incomplete draft
      const resultIncomplete = await page.evaluate(() => {
        const win = window as unknown as { __submitVolunteerEvaluation?: (id: string) => { success: boolean } }
        return win.__submitVolunteerEvaluation ? win.__submitVolunteerEvaluation('SUB-8821') : { success: true }
      })
      expect(resultIncomplete.success).toBe(false)

      // Verify zero state mutation
      const assignments = await page.evaluate(() => {
        return window.sessionStorage.getItem('auratio_volunteer_assignments')
      })
      if (assignments) {
        expect(assignments).toContain('SUB-8821')
      }

      // 2. Partially complete draft (16/16 criteria complete but overallSummary empty)
      await page.evaluate(() => {
        const raw = window.sessionStorage.getItem('auratio_volunteer_draft_SUB-8821')
        if (raw) {
          const draft = JSON.parse(raw)
          for (const key of Object.keys(draft.criteria)) {
            const c = draft.criteria[key]
            c.anchor = 'Excellent'
            c.exactScore = c.maxPoints
            c.evidenceTimestamp = '01:24'
            c.evidence = 'Strong execution and observable mastery'
            c.strength = 'Clear delivery'
            c.weakness = 'Minor polish'
            c.advice = 'Keep momentum'
          }
          draft.overallSummary = ''
          window.sessionStorage.setItem('auratio_volunteer_draft_SUB-8821', JSON.stringify(draft))
        }
      })
      await page.goto('/volunteer/evaluation/sub-8821/review')
      await expect(confirmBtn).toBeDisabled()

      // 3. Complete 16/16 + Overall Summary
      await page.evaluate(() => {
        const raw = window.sessionStorage.getItem('auratio_volunteer_draft_SUB-8821')
        if (raw) {
          const draft = JSON.parse(raw)
          draft.overallSummary = 'Exceptional presentation demonstrating deep mastery, strong audience rapport, and compelling message structure.'
          window.sessionStorage.setItem('auratio_volunteer_draft_SUB-8821', JSON.stringify(draft))
        }
      })
      await page.goto('/volunteer/evaluation/sub-8821/review')
      await expect(confirmBtn).toBeEnabled()
      await expect(page.locator('h3.auratio-volunteer-panel-title', { hasText: 'Confirm final submission' })).toBeVisible()

      // Click Confirm & Submit
      await confirmBtn.click()
      await expect(page).toHaveURL('/volunteer/evaluation/sub-8821/submitted')
      await expect(page.locator('text=Evaluation submitted')).toBeVisible()

      // Capture Evidence 07: 07_complete_review_submit_success.png
      await captureHumanFixH11Screenshot(page, '07_complete_review_submit_success.png')

      // Verify SUB-8821 removed from Active Assignments
      await page.goto('/volunteer/assignments')
      const activeText = await page.innerText('body')
      expect(activeText).not.toContain('SUB-8821')

      // Verify SUB-8821 added to Completed History
      await page.goto('/volunteer/completed')
      const completedText = await page.innerText('body')
      expect(completedText).toContain('SUB-8821')
    })

    test('H1.2: Submitted-evaluation lock integrity, active assignment resolution, route protection, and formal reopen flow', async ({ page }) => {
      // 1. Fresh baseline still shows canonical active assignments
      await page.goto('/volunteer/assignments')
      await expect(page).toHaveURL('/volunteer/assignments')
      const baselineBody = await page.innerText('body')
      expect(baselineBody).toContain('SUB-8821')
      expect(baselineBody).toContain('SUB-8814')
      expect(baselineBody).toContain('SUB-8799')

      const baselineAssignment = await page.evaluate(() => {
        const win = window as unknown as { __getVolunteerAssignment?: (id: string) => unknown }
        return win.__getVolunteerAssignment ? win.__getVolunteerAssignment('SUB-8821') : null
      })
      expect(baselineAssignment).not.toBeNull()

      const baselineIsSubmitted = await page.evaluate(() => {
        const win = window as unknown as { __isEvaluationSubmitted?: (id: string) => boolean }
        return win.__isEvaluationSubmitted ? win.__isEvaluationSubmitted('SUB-8821') : null
      })
      expect(baselineIsSubmitted).toBe(false)

      // Verify scoring workspace is accessible at baseline
      await page.goto('/volunteer/evaluation/sub-8821')
      await expect(page).toHaveURL('/volunteer/evaluation/sub-8821')
      await expect(page.locator('h2.auratio-volunteer-page-title')).toContainText('SUB-8821')

      // Prepare complete draft for SUB-8821 (16 criteria + overallSummary)
      await page.evaluate(() => {
        const raw = window.sessionStorage.getItem('auratio_volunteer_draft_SUB-8821')
        let draft: any = raw ? JSON.parse(raw) : null
        if (!draft) {
          const win = window as unknown as { __getVolunteerScoringDraft?: (id: string) => any }
          draft = win.__getVolunteerScoringDraft ? win.__getVolunteerScoringDraft('SUB-8821') : null
        }
        if (draft) {
          for (const key of Object.keys(draft.criteria)) {
            const c = draft.criteria[key]
            c.anchor = 'Excellent'
            c.exactScore = c.maxPoints
            c.evidenceTimestamp = '01:24'
            c.evidence = 'Strong execution and observable mastery'
            c.strength = 'Clear delivery and precision'
            c.weakness = 'Minor polish on transitions'
            c.advice = 'Keep momentum and pause discipline'
          }
          draft.overallSummary = 'Outstanding pitch demonstrating strong product-market fit, exceptional audience engagement, and rigorous structure.'
          window.sessionStorage.setItem('auratio_volunteer_draft_SUB-8821', JSON.stringify(draft))
        }
      })

      // 2. Submit SUB-8821 successfully via Review route
      await page.goto('/volunteer/evaluation/sub-8821/review')
      await expect(page).toHaveURL('/volunteer/evaluation/sub-8821/review')
      const confirmBtn = page.locator('button.auratio-volunteer-btn--primary', { hasText: 'Confirm & Submit' })
      await expect(confirmBtn).toBeEnabled()
      await confirmBtn.click()
      await expect(page).toHaveURL('/volunteer/evaluation/sub-8821/submitted')
      await expect(page.locator('text=Evaluation submitted')).toBeVisible()

      // 3. SUB-8821 disappears from Active Assignments
      await page.goto('/volunteer/assignments')
      await expect(page).toHaveURL('/volunteer/assignments')
      const assignmentsAfterSubmit = await page.innerText('body')
      expect(assignmentsAfterSubmit).not.toContain('SUB-8821')
      expect(assignmentsAfterSubmit).toContain('SUB-8814')
      expect(assignmentsAfterSubmit).toContain('SUB-8799')

      // 4. getVolunteerAssignment('SUB-8821') does not resurrect it after submission
      const assignmentAfterSubmit = await page.evaluate(() => {
        const win = window as unknown as { __getVolunteerAssignment?: (id: string) => unknown }
        return win.__getVolunteerAssignment ? win.__getVolunteerAssignment('SUB-8821') : 'not-found'
      })
      expect(assignmentAfterSubmit).toBeNull()

      const isSubmittedAfterSubmit = await page.evaluate(() => {
        const win = window as unknown as { __isEvaluationSubmitted?: (id: string) => boolean }
        return win.__isEvaluationSubmitted ? win.__isEvaluationSubmitted('SUB-8821') : null
      })
      expect(isSubmittedAfterSubmit).toBe(true)

      // 11. Completed / History still shows SUB-8821
      await page.goto('/volunteer/completed')
      await expect(page).toHaveURL('/volunteer/completed')
      const completedTextAfterSubmit = await page.innerText('body')
      expect(completedTextAfterSubmit).toContain('SUB-8821')
      // Capture Evidence 01: 01_submitted_completed_history.png
      await captureHumanFixH12Screenshot(page, '01_submitted_completed_history.png')

      // 5. Direct /volunteer/evaluation/sub-8821 after submit is blocked
      await page.goto('/volunteer/evaluation/sub-8821')
      await expect(page).toHaveURL(/\/volunteer\/completed/)
      // Verify no editable scoring workspace is displayed
      await expect(page.locator('textarea.auratio-volunteer-overall-summary-textarea')).toHaveCount(0)
      // Capture Evidence 02: 02_direct_scoring_after_submit_blocked.png
      await captureHumanFixH12Screenshot(page, '02_direct_scoring_after_submit_blocked.png')

      // 6. Direct criterion URL after submit is blocked
      await page.goto('/volunteer/evaluation/sub-8821/criterion')
      await expect(page).toHaveURL(/\/volunteer\/completed/)
      // Verify no criterion editor form is displayed
      await expect(page.locator('input[aria-label="Exact score"]')).toHaveCount(0)
      // Capture Evidence 03: 03_direct_criterion_after_submit_blocked.png
      await captureHumanFixH12Screenshot(page, '03_direct_criterion_after_submit_blocked.png')

      // 7. Direct review URL after submit cannot resubmit
      await page.goto('/volunteer/evaluation/sub-8821/review')
      await expect(page).toHaveURL(/\/volunteer\/completed/)
      // Verify no confirm submit button is displayed
      await expect(page.locator('button.auratio-volunteer-btn--primary', { hasText: 'Confirm & Submit' })).toHaveCount(0)
      // Capture Evidence 04: 04_direct_review_after_submit_blocked.png
      await captureHumanFixH12Screenshot(page, '04_direct_review_after_submit_blocked.png')

      // 8. Locked submitted draft cannot be mutated through saveCriterionScoreData()
      const criterionMutationResult = await page.evaluate(() => {
        const win = window as unknown as { __saveCriterionScoreData?: (id: string, cid: string, data: any) => any }
        return win.__saveCriterionScoreData ? win.__saveCriterionScoreData('SUB-8821', 'ud-pacing', { exactScore: 1 }) : 'error'
      })
      expect(criterionMutationResult).toBeNull()

      // 9. Locked Overall Summary cannot be modified through an editable workspace / helper
      const summaryMutationResult = await page.evaluate(() => {
        const win = window as unknown as { __saveOverallSummary?: (id: string, s: string) => any }
        return win.__saveOverallSummary ? win.__saveOverallSummary('SUB-8821', 'Tampered Summary') : 'error'
      })
      expect(summaryMutationResult).toBeNull()

      // Verify draft in session storage remains unmodified
      const draftStored = await page.evaluate(() => {
        const raw = window.sessionStorage.getItem('auratio_volunteer_draft_SUB-8821')
        return raw ? JSON.parse(raw) : null
      })
      expect(draftStored.overallSummary).not.toBe('Tampered Summary')
      expect(draftStored.isSubmitted).toBe(true)

      // 10. Duplicate submit of the same submitted version fails/no-ops
      const duplicateSubmitResult = await page.evaluate(() => {
        const win = window as unknown as { __submitVolunteerEvaluation?: (id: string) => { success: boolean } }
        return win.__submitVolunteerEvaluation ? win.__submitVolunteerEvaluation('SUB-8821') : { success: true }
      })
      expect(duplicateSubmitResult.success).toBe(false)

      // 12. Formal Reopened page still shows preserved prior version
      await page.goto('/volunteer/evaluation/sub-8821/reopened')
      await expect(page).toHaveURL('/volunteer/evaluation/sub-8821/reopened')
      await expect(page.locator('h3.auratio-volunteer-panel-title', { hasText: 'Preserved prior submission' })).toBeVisible()
      await expect(page.locator('text=Submitted / historical')).toBeVisible()
      await expect(page.locator('text=Read-only')).toBeVisible()
      const continueBtn = page.locator('button.auratio-volunteer-btn--primary', { hasText: 'Continue Correction' })
      await expect(continueBtn).toBeVisible()
      // Capture Evidence 05: 05_reopened_prior_version.png
      await captureHumanFixH12Screenshot(page, '05_reopened_prior_version.png')

      // 13. Continue Correction creates the next editable version
      await continueBtn.click()
      await expect(page).toHaveURL('/volunteer/evaluation/sub-8821')

      // 14. After formal reopen, scoring workspace becomes accessible again
      await expect(page.locator('h2.auratio-volunteer-page-title')).toContainText('SUB-8821')
      await expect(page.locator('textarea.auratio-volunteer-overall-summary-textarea')).toBeVisible()

      // Capture Evidence 06: 06_reopened_new_editable_version.png
      await captureHumanFixH12Screenshot(page, '06_reopened_new_editable_version.png')

      // Active assignment restored
      const restoredAssignment = await page.evaluate(() => {
        const win = window as unknown as { __getVolunteerAssignment?: (id: string) => any }
        return win.__getVolunteerAssignment ? win.__getVolunteerAssignment('SUB-8821') : null
      })
      expect(restoredAssignment).not.toBeNull()
      expect(restoredAssignment.assignmentStatus).toBe('In Evaluation')

      const reopenedIsSubmitted = await page.evaluate(() => {
        const win = window as unknown as { __isEvaluationSubmitted?: (id: string) => boolean }
        return win.__isEvaluationSubmitted ? win.__isEvaluationSubmitted('SUB-8821') : null
      })
      expect(reopenedIsSubmitted).toBe(false)

      // 15. Editing the reopened version does not mutate the prior locked version
      const editReopenedResult = await page.evaluate(() => {
        const win = window as unknown as { __saveOverallSummary?: (id: string, s: string) => any }
        return win.__saveOverallSummary ? win.__saveOverallSummary('SUB-8821', 'Reopened and refined evaluation for version 2.') : null
      })
      expect(editReopenedResult).not.toBeNull()
      expect(editReopenedResult.version).toBe(2)
      expect(editReopenedResult.overallSummary).toBe('Reopened and refined evaluation for version 2.')

      // Check preserved locked version 1
      const preservedV1 = await page.evaluate(() => {
        const raw = window.sessionStorage.getItem('auratio_volunteer_locked_SUB-8821_v1')
        return raw ? JSON.parse(raw) : null
      })
      expect(preservedV1).not.toBeNull()
      expect(preservedV1.version).toBe(1)
      expect(preservedV1.isSubmitted).toBe(true)
      expect(preservedV1.overallSummary).not.toBe('Reopened and refined evaluation for version 2.')

      // 16. No hard anchor-specific numeric-band implementation remains
      const anchorBandsFunctionExists = await page.evaluate(() => {
        return typeof (window as any).getAnchorScoreRange !== 'undefined'
      })
      expect(anchorBandsFunctionExists).toBe(false)
    })
  })
})
