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

    // TC 18: Low constrains this 5-point criterion to 0–2
    await page.locator('input[name="anchor"][value="Low"]').click()
    await expect(exactScoreInput).toBeEnabled()
    await expect(exactScoreInput).toHaveAttribute('placeholder', '0–2')
    await expect(exactScoreInput).toHaveAttribute('min', '0')
    await expect(exactScoreInput).toHaveAttribute('max', '2')

    // TC 19: Competent constrains this 5-point criterion to 3–4
    await page.locator('input[name="anchor"][value="Competent"]').click()
    await expect(exactScoreInput).toHaveAttribute('placeholder', '3–4')
    await expect(exactScoreInput).toHaveAttribute('min', '3')
    await expect(exactScoreInput).toHaveAttribute('max', '4')

    // TC 20: Excellent constrains this 5-point criterion to exactly 5
    await page.locator('input[name="anchor"][value="Excellent"]').click()
    await expect(exactScoreInput).toHaveAttribute('placeholder', '5')
    await expect(exactScoreInput).toHaveAttribute('min', '5')
    await expect(exactScoreInput).toHaveAttribute('max', '5')

    // Screenshot 7: 07_criterion_editor_anchor_selected.png
    await captureHumanFixH1Screenshot(page, '07_criterion_editor_anchor_selected.png')

    // TC 21: Anchor-incompatible score is rejected
    await exactScoreInput.fill('4')
    const overflowText = await page.innerText('body')
    expect(overflowText).toContain('Excellent requires a score of 5')

    // Set valid score for Excellent
    await exactScoreInput.fill('5')

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
    expect(reactiveText).toContain('5 / 40')
    expect(reactiveText).toContain('5 / 100')
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

    // Unsubmitted evaluation cannot be reopened -> redirects safely to /volunteer/assignments
    await page.goto('/volunteer/evaluation/sub-8821/reopened')
    await expect(page).toHaveURL('/volunteer/assignments')
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

    test('H1.1 Issue 2 & Issue 4: Deterministic mm:ss timestamp requirement and anchor-compatible score bands', async ({ page }) => {
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

      // Low on a 5-point criterion is 0–2
      await page.locator('input[name="anchor"][value="Low"]').click()
      await expect(exactScoreInput).toBeEnabled()
      await expect(exactScoreInput).toHaveAttribute('placeholder', '0–2')

      // Incompatible score is rejected under Low
      await exactScoreInput.fill('5')
      let bodyText = await page.innerText('body')
      expect(bodyText).toContain('Low requires a score between 0 and 2')

      // Valid Low score
      await exactScoreInput.fill('2')

      // Capture Evidence 05: band-constrained anchor state
      await captureHumanFixH11Screenshot(page, '05_anchor_selected_band_constrained.png')

      // Switching to Competent clears the now-incompatible Low score
      await page.locator('input[name="anchor"][value="Competent"]').click()
      await expect(exactScoreInput).toHaveValue('')
      await expect(exactScoreInput).toHaveAttribute('placeholder', '3–4')
      await exactScoreInput.fill('4')

      // Switching to Excellent clears 4 because Excellent requires exactly 5
      await page.locator('input[name="anchor"][value="Excellent"]').click()
      await expect(exactScoreInput).toHaveValue('')
      await expect(exactScoreInput).toHaveAttribute('placeholder', '5')
      await exactScoreInput.fill('0')
      bodyText = await page.innerText('body')
      expect(bodyText).toContain('Excellent requires a score of 5')

      // Set the compatible Excellent score
      await exactScoreInput.fill('5')

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

  test.describe('Volunteer Defect Groups V-01 & V-02 Regression Hardening', () => {
    test('V-01: Reopened evaluation route safety, invalid/unsubmitted rejection, and versioning immutability', async ({ page }) => {
      // 1. Invalid reopened ID fails safely and redirects to /volunteer/assignments
      await page.goto('/volunteer/evaluation/invalid-id/reopened')
      await expect(page).toHaveURL('/volunteer/assignments')

      await page.goto('/volunteer/evaluation/sub-9999/reopened')
      await expect(page).toHaveURL('/volunteer/assignments')

      // 2. Unsubmitted evaluation cannot be reopened -> redirects to /volunteer/assignments
      await page.goto('/volunteer/evaluation/sub-8814/reopened')
      await expect(page).toHaveURL('/volunteer/assignments')

      await page.goto('/volunteer/evaluation/sub-8799/reopened')
      await expect(page).toHaveURL('/volunteer/assignments')

      await page.goto('/volunteer/evaluation/sub-8821/reopened')
      await expect(page).toHaveURL('/volunteer/assignments')

      // 3. Legitimate submitted evaluation can be reopened
      // Submit SUB-8814 (Extempore) with real score (e.g. 92) and valid criteria
      await page.goto('/volunteer/assignments')
      await page.evaluate(() => {
        const win = window as any
        const draft = {
          submissionId: 'SUB-8814',
          track: 'Extempore',
          trackSlug: 'extempore',
          criteria: {
            'ud-pacing': { id: 'ud-pacing', name: 'Pacing', category: 'Universal Delivery', maxPoints: 5, anchor: 'Excellent', exactScore: 5, evidenceTimestamp: '01:10', evidence: 'Good pacing', strength: 'Steady', weakness: 'Minor rush', advice: 'Keep steady' },
            'ud-tone': { id: 'ud-tone', name: 'Tone', category: 'Universal Delivery', maxPoints: 5, anchor: 'Excellent', exactScore: 5, evidenceTimestamp: '01:20', evidence: 'Good tone', strength: 'Clear', weakness: 'Flat at end', advice: 'Modulate' },
            'ud-variety': { id: 'ud-variety', name: 'Variety', category: 'Universal Delivery', maxPoints: 5, anchor: 'Excellent', exactScore: 5, evidenceTimestamp: '01:30', evidence: 'Varied pitch', strength: 'Dynamic', weakness: 'None', advice: 'Continue' },
            'ud-filler': { id: 'ud-filler', name: 'Filler', category: 'Universal Delivery', maxPoints: 5, anchor: 'Excellent', exactScore: 5, evidenceTimestamp: '01:40', evidence: 'Low filler', strength: 'Clean', weakness: 'Occasional um', advice: 'Pause instead' },
            'ud-eye-contact': { id: 'ud-eye-contact', name: 'Eye contact', category: 'Universal Delivery', maxPoints: 5, anchor: 'Excellent', exactScore: 5, evidenceTimestamp: '01:50', evidence: 'Good gaze', strength: 'Direct', weakness: 'None', advice: 'Maintain' },
            'ud-posture': { id: 'ud-posture', name: 'Posture', category: 'Universal Delivery', maxPoints: 5, anchor: 'Excellent', exactScore: 5, evidenceTimestamp: '02:00', evidence: 'Upright', strength: 'Confident', weakness: 'None', advice: 'Maintain' },
            'ud-gestures': { id: 'ud-gestures', name: 'Gestures', category: 'Universal Delivery', maxPoints: 5, anchor: 'Excellent', exactScore: 5, evidenceTimestamp: '02:10', evidence: 'Natural', strength: 'Supportive', weakness: 'Slight repetitive', advice: 'Vary' },
            'ud-time': { id: 'ud-time', name: 'Time', category: 'Universal Delivery', maxPoints: 5, anchor: 'Excellent', exactScore: 5, evidenceTimestamp: '02:20', evidence: 'On target', strength: 'Precise', weakness: 'None', advice: 'Keep it up' },
            'sf-hook': { id: 'sf-hook', name: 'Hook', category: 'Structural Flow', maxPoints: 5, anchor: 'Excellent', exactScore: 5, evidenceTimestamp: '00:15', evidence: 'Strong start', strength: 'Engaging', weakness: 'None', advice: 'Great' },
            'sf-clarity': { id: 'sf-clarity', name: 'Clarity', category: 'Structural Flow', maxPoints: 5, anchor: 'Excellent', exactScore: 5, evidenceTimestamp: '00:45', evidence: 'Clear outline', strength: 'Cohesive', weakness: 'None', advice: 'Continue' },
            'sf-transitions': { id: 'sf-transitions', name: 'Transitions', category: 'Structural Flow', maxPoints: 5, anchor: 'Excellent', exactScore: 5, evidenceTimestamp: '01:15', evidence: 'Smooth shifts', strength: 'Logical', weakness: 'None', advice: 'Good' },
            'sf-conclusion': { id: 'sf-conclusion', name: 'Conclusion', category: 'Structural Flow', maxPoints: 5, anchor: 'Excellent', exactScore: 5, evidenceTimestamp: '02:40', evidence: 'Punchy wrap-up', strength: 'Memorable', weakness: 'None', advice: 'Excellent' },
            'ex-thesis': { id: 'ex-thesis', name: 'Rapid thesis', category: 'Track Specialisation', maxPoints: 10, anchor: 'Competent', exactScore: 8, evidenceTimestamp: '00:30', evidence: 'Quick framing', strength: 'Fast clarity', weakness: 'Brief lag', advice: 'Anchor faster' },
            'ex-structure': { id: 'ex-structure', name: 'Spontaneous structure', category: 'Track Specialisation', maxPoints: 10, anchor: 'Competent', exactScore: 8, evidenceTimestamp: '01:00', evidence: 'Clean spontaneous points', strength: '3 points clear', weakness: 'Point 2 short', advice: 'Balance points' },
            'ex-narrative': { id: 'ex-narrative', name: 'Narrative continuity', category: 'Track Specialisation', maxPoints: 10, anchor: 'Competent', exactScore: 8, evidenceTimestamp: '01:45', evidence: 'Story thread held', strength: 'Engaging arc', weakness: 'Minor detour', advice: 'Tighten arc' },
            'ex-composure': { id: 'ex-composure', name: 'Composure', category: 'Track Specialisation', maxPoints: 10, anchor: 'Competent', exactScore: 8, evidenceTimestamp: '02:15', evidence: 'Poised response', strength: 'Calm under pressure', weakness: 'None', advice: 'Flawless poise' },
          },
          overallSummary: 'High-quality spontaneous speech demonstrating rapid thesis formulation.',
          isSubmitted: false,
          submittedAt: null,
          version: 1,
        }
        win.sessionStorage.setItem('auratio_volunteer_draft_SUB-8814', JSON.stringify(draft))
        return win.__submitVolunteerEvaluation('SUB-8814')
      })

      // Verify now legitimate submitted evaluation can be reopened
      await page.goto('/volunteer/evaluation/sub-8814/reopened')
      await expect(page).toHaveURL('/volunteer/evaluation/sub-8814/reopened')
      const reopenedContent = await page.innerText('body')
      expect(reopenedContent).toContain('SUB-8814 — Reopened Evaluation')
      expect(reopenedContent).toContain('Extempore • formal re-review work (Version 2)')
      expect(reopenedContent).not.toContain('Business Pitch')
      expect(reopenedContent).toContain('92 / 100')
      expect(reopenedContent).not.toContain('85 / 100')

      // 4. Submitted evaluation remains non-editable in scoring workspace unless formally reopened
      await page.goto('/volunteer/evaluation/sub-8814')
      await expect(page).toHaveURL('/volunteer/completed/sub-8814')

      // 5. Formal reopen creates editable version 2
      await page.goto('/volunteer/evaluation/sub-8814/reopened')
      await page.locator('button.auratio-volunteer-btn--primary', { hasText: 'Continue Correction' }).click()
      await expect(page).toHaveURL('/volunteer/evaluation/sub-8814')

      // Scoring workspace is now accessible
      await expect(page.locator('h2.auratio-volunteer-page-title')).toContainText('SUB-8814')
      const draftV2 = await page.evaluate(() => {
        const raw = window.sessionStorage.getItem('auratio_volunteer_draft_SUB-8814')
        return raw ? JSON.parse(raw) : null
      })
      expect(draftV2).not.toBeNull()
      expect(draftV2.version).toBe(2)
      expect(draftV2.isSubmitted).toBe(false)
      expect(draftV2.track).toBe('Extempore')

      // Prior locked version 1 remains immutable in storage
      const preservedV1 = await page.evaluate(() => {
        const raw = window.sessionStorage.getItem('auratio_volunteer_locked_SUB-8814_v1')
        return raw ? JSON.parse(raw) : null
      })
      expect(preservedV1).not.toBeNull()
      expect(preservedV1.version).toBe(1)
      expect(preservedV1.isSubmitted).toBe(true)
      expect(preservedV1.score).toBe(92)

      // 6. Repeated reopen cycle: v1 -> v2 -> v3
      // Edit version 2 overall summary and submit version 2
      await page.evaluate(() => {
        const win = window as any
        win.__saveOverallSummary('SUB-8814', 'Version 2 updated summary with enhanced analysis.')
        return win.__submitVolunteerEvaluation('SUB-8814')
      })

      // Verify version 2 is locked
      const preservedV2 = await page.evaluate(() => {
        const raw = window.sessionStorage.getItem('auratio_volunteer_locked_SUB-8814_v2')
        return raw ? JSON.parse(raw) : null
      })
      expect(preservedV2).not.toBeNull()
      expect(preservedV2.version).toBe(2)
      expect(preservedV2.isSubmitted).toBe(true)
      expect(preservedV2.overallSummary).toBe('Version 2 updated summary with enhanced analysis.')

      // Preserved version 1 remains untouched
      const preservedV1AfterV2 = await page.evaluate(() => {
        const raw = window.sessionStorage.getItem('auratio_volunteer_locked_SUB-8814_v1')
        return raw ? JSON.parse(raw) : null
      })
      expect(preservedV1AfterV2.version).toBe(1)
      expect(preservedV1AfterV2.overallSummary).toBe('High-quality spontaneous speech demonstrating rapid thesis formulation.')

      // Reopen again -> advances to Version 3 from latest locked version (version 2)
      await page.goto('/volunteer/evaluation/sub-8814/reopened')
      await expect(page).toHaveURL('/volunteer/evaluation/sub-8814/reopened')
      const reopenedV2Content = await page.innerText('body')
      expect(reopenedV2Content).toContain('Version 3')
      expect(reopenedV2Content).toContain('92 / 100')

      // Continue correction to Version 3
      await page.locator('button.auratio-volunteer-btn--primary', { hasText: 'Continue Correction' }).click()
      await expect(page).toHaveURL('/volunteer/evaluation/sub-8814')

      const draftV3 = await page.evaluate(() => {
        const raw = window.sessionStorage.getItem('auratio_volunteer_draft_SUB-8814')
        return raw ? JSON.parse(raw) : null
      })
      expect(draftV3.version).toBe(3)
      expect(draftV3.isSubmitted).toBe(false)
    })

    test('V-02: Completed evaluation detail entity integrity and invariant enforcement', async ({ page }) => {
      // 1. Submit SUB-8814 so it enters completed history alongside canonical records
      await page.goto('/volunteer/assignments')
      await page.evaluate(() => {
        const win = window as any
        const draft = {
          submissionId: 'SUB-8814',
          track: 'Extempore',
          trackSlug: 'extempore',
          criteria: {
            'ud-pacing': { id: 'ud-pacing', name: 'Pacing', category: 'Universal Delivery', maxPoints: 5, anchor: 'Excellent', exactScore: 5, evidenceTimestamp: '01:10', evidence: 'Good pacing', strength: 'Steady', weakness: 'Minor rush', advice: 'Keep steady' },
            'ud-tone': { id: 'ud-tone', name: 'Tone', category: 'Universal Delivery', maxPoints: 5, anchor: 'Excellent', exactScore: 5, evidenceTimestamp: '01:20', evidence: 'Good tone', strength: 'Clear', weakness: 'Flat at end', advice: 'Modulate' },
            'ud-variety': { id: 'ud-variety', name: 'Variety', category: 'Universal Delivery', maxPoints: 5, anchor: 'Excellent', exactScore: 5, evidenceTimestamp: '01:30', evidence: 'Varied pitch', strength: 'Dynamic', weakness: 'None', advice: 'Continue' },
            'ud-filler': { id: 'ud-filler', name: 'Filler', category: 'Universal Delivery', maxPoints: 5, anchor: 'Excellent', exactScore: 5, evidenceTimestamp: '01:40', evidence: 'Low filler', strength: 'Clean', weakness: 'Occasional um', advice: 'Pause instead' },
            'ud-eye-contact': { id: 'ud-eye-contact', name: 'Eye contact', category: 'Universal Delivery', maxPoints: 5, anchor: 'Excellent', exactScore: 5, evidenceTimestamp: '01:50', evidence: 'Good gaze', strength: 'Direct', weakness: 'None', advice: 'Maintain' },
            'ud-posture': { id: 'ud-posture', name: 'Posture', category: 'Universal Delivery', maxPoints: 5, anchor: 'Excellent', exactScore: 5, evidenceTimestamp: '02:00', evidence: 'Upright', strength: 'Confident', weakness: 'None', advice: 'Maintain' },
            'ud-gestures': { id: 'ud-gestures', name: 'Gestures', category: 'Universal Delivery', maxPoints: 5, anchor: 'Excellent', exactScore: 5, evidenceTimestamp: '02:10', evidence: 'Natural', strength: 'Supportive', weakness: 'Slight repetitive', advice: 'Vary' },
            'ud-time': { id: 'ud-time', name: 'Time', category: 'Universal Delivery', maxPoints: 5, anchor: 'Excellent', exactScore: 5, evidenceTimestamp: '02:20', evidence: 'On target', strength: 'Precise', weakness: 'None', advice: 'Keep it up' },
            'sf-hook': { id: 'sf-hook', name: 'Hook', category: 'Structural Flow', maxPoints: 5, anchor: 'Excellent', exactScore: 5, evidenceTimestamp: '00:15', evidence: 'Strong start', strength: 'Engaging', weakness: 'None', advice: 'Great' },
            'sf-clarity': { id: 'sf-clarity', name: 'Clarity', category: 'Structural Flow', maxPoints: 5, anchor: 'Excellent', exactScore: 5, evidenceTimestamp: '00:45', evidence: 'Clear outline', strength: 'Cohesive', weakness: 'None', advice: 'Continue' },
            'sf-transitions': { id: 'sf-transitions', name: 'Transitions', category: 'Structural Flow', maxPoints: 5, anchor: 'Excellent', exactScore: 5, evidenceTimestamp: '01:15', evidence: 'Smooth shifts', strength: 'Logical', weakness: 'None', advice: 'Good' },
            'sf-conclusion': { id: 'sf-conclusion', name: 'Conclusion', category: 'Structural Flow', maxPoints: 5, anchor: 'Excellent', exactScore: 5, evidenceTimestamp: '02:40', evidence: 'Punchy wrap-up', strength: 'Memorable', weakness: 'None', advice: 'Excellent' },
            'ex-thesis': { id: 'ex-thesis', name: 'Rapid thesis', category: 'Track Specialisation', maxPoints: 10, anchor: 'Competent', exactScore: 8, evidenceTimestamp: '00:30', evidence: 'Quick framing', strength: 'Fast clarity', weakness: 'Brief lag', advice: 'Anchor faster' },
            'ex-structure': { id: 'ex-structure', name: 'Spontaneous structure', category: 'Track Specialisation', maxPoints: 10, anchor: 'Competent', exactScore: 8, evidenceTimestamp: '01:00', evidence: 'Clean spontaneous points', strength: '3 points clear', weakness: 'Point 2 short', advice: 'Balance points' },
            'ex-narrative': { id: 'ex-narrative', name: 'Narrative continuity', category: 'Track Specialisation', maxPoints: 10, anchor: 'Competent', exactScore: 8, evidenceTimestamp: '01:45', evidence: 'Story thread held', strength: 'Engaging arc', weakness: 'Minor detour', advice: 'Tighten arc' },
            'ex-composure': { id: 'ex-composure', name: 'Composure', category: 'Track Specialisation', maxPoints: 10, anchor: 'Competent', exactScore: 8, evidenceTimestamp: '02:15', evidence: 'Poised response', strength: 'Calm under pressure', weakness: 'None', advice: 'Flawless poise' },
          },
          overallSummary: 'High-quality spontaneous speech demonstrating rapid thesis formulation.',
          isSubmitted: false,
          submittedAt: null,
          version: 1,
        }
        win.sessionStorage.setItem('auratio_volunteer_draft_SUB-8814', JSON.stringify(draft))
        return win.__submitVolunteerEvaluation('SUB-8814')
      })

      // 2. Opening SUB-8814 must display SUB-8814 data, NOT SUB-8821 data
      await page.goto('/volunteer/completed/sub-8814')
      await expect(page).toHaveURL('/volunteer/completed/sub-8814')
      const sub8814Title = await page.innerText('h2.auratio-volunteer-page-title')
      expect(sub8814Title).toContain('SUB-8814')
      expect(sub8814Title).not.toContain('SUB-8821')

      // Check track attribute and score
      const sub8814Entity = page.locator('[data-testid="completed-detail-entity"]')
      await expect(sub8814Entity).toHaveAttribute('data-submission-id', 'SUB-8814')
      await expect(sub8814Entity).toHaveAttribute('data-track', 'Extempore')
      await expect(sub8814Entity).toHaveAttribute('data-publication-status', 'Pending Moderation')
      const sub8814BodyText = await page.innerText('body')
      expect(sub8814BodyText).toContain('92 / 100')
      expect(sub8814BodyText).not.toContain('85 / 100')

      // 3. Opening SUB-8821 must display SUB-8821 data
      await page.goto('/volunteer/completed/sub-8821')
      await expect(page).toHaveURL('/volunteer/completed/sub-8821')
      const sub8821Title = await page.innerText('h2.auratio-volunteer-page-title')
      expect(sub8821Title).toContain('SUB-8821')
      expect(sub8821Title).not.toContain('SUB-8814')
      const sub8821Entity = page.locator('[data-testid="completed-detail-entity"]')
      await expect(sub8821Entity).toHaveAttribute('data-submission-id', 'SUB-8821')
      await expect(sub8821Entity).toHaveAttribute('data-track', 'Business Pitch / Sales Pitch')
      await expect(sub8821Entity).toHaveAttribute('data-publication-status', 'Pending Moderation')
      const sub8821BodyText = await page.innerText('body')
      expect(sub8821BodyText).toContain('85 / 100')

      // 4. Opening SUB-8792 must display SUB-8792 data (Approved)
      await page.goto('/volunteer/completed/sub-8792')
      await expect(page).toHaveURL('/volunteer/completed/sub-8792')
      const sub8792Title = await page.innerText('h2.auratio-volunteer-page-title')
      expect(sub8792Title).toContain('SUB-8792')
      const sub8792Entity = page.locator('[data-testid="completed-detail-entity"]')
      await expect(sub8792Entity).toHaveAttribute('data-submission-id', 'SUB-8792')
      await expect(sub8792Entity).toHaveAttribute('data-publication-status', 'Approved')
      await expect(page.locator('.auratio-volunteer-pill', { hasText: 'Approved' })).toBeVisible()

      // 5. Opening SUB-8755 must display SUB-8755 data (Rejected) with authoritative Figma copy
      await page.goto('/volunteer/completed/sub-8755')
      await expect(page).toHaveURL('/volunteer/completed/sub-8755')
      const sub8755Title = await page.innerText('h2.auratio-volunteer-page-title')
      expect(sub8755Title).toContain('SUB-8755')
      const sub8755Entity = page.locator('[data-testid="completed-detail-entity"]')
      await expect(sub8755Entity).toHaveAttribute('data-submission-id', 'SUB-8755')
      await expect(sub8755Entity).toHaveAttribute('data-publication-status', 'Rejected')
      await expect(page.locator('.auratio-volunteer-pill', { hasText: 'Rejected' })).toBeVisible()
      const sub8755Body = await page.innerText('body')
      expect(sub8755Body).toContain('Rejected result')
      expect(sub8755Body).toContain('The submitted evaluator work remains auditable, but the rejected result does not affect progress, rankings, or generate an official report.')
      expect(sub8755Body).toContain('None — rejected')
      expect(sub8755Body).toContain('Workspace consequence')
      expect(sub8755Body).toContain('This record remains locked in Completed / History for audit/history purposes. Rejection does not create an approved score or report.')

      // 6. Opening SUB-8741 must display SUB-8741 data (Processing) with track "Persuasive" and authoritative Figma copy
      await page.goto('/volunteer/completed/sub-8741')
      await expect(page).toHaveURL('/volunteer/completed/sub-8741')
      const sub8741Title = await page.innerText('h2.auratio-volunteer-page-title')
      expect(sub8741Title).toContain('SUB-8741')
      const sub8741Entity = page.locator('[data-testid="completed-detail-entity"]')
      await expect(sub8741Entity).toHaveAttribute('data-submission-id', 'SUB-8741')
      await expect(sub8741Entity).toHaveAttribute('data-track', 'Persuasive')
      await expect(sub8741Entity).toHaveAttribute('data-publication-status', 'Processing')
      await expect(page.locator('.auratio-volunteer-pill', { hasText: 'Processing' })).toBeVisible()
      const sub8741Body = await page.innerText('body')
      expect(sub8741Body).not.toContain('Motivational')
      expect(sub8741Body).toContain('Publication processing')
      expect(sub8741Body).toContain('Evaluator work is complete, but the publication outcome is not final yet, so no progress or ranking impact is applied.')
      expect(sub8741Body).toContain('Workspace consequence')
      expect(sub8741Body).toContain('This record remains in Completed / History while publication processing finishes. Only a formal Re-review / Reopened workflow returns work to Active Assignments.')
      expect(sub8741Body).toContain('None while processing')

      // 7. Unknown IDs must fail and redirect safely to /volunteer/completed
      await page.goto('/volunteer/completed/sub-9999')
      await expect(page).toHaveURL('/volunteer/completed')

      await page.goto('/volunteer/completed/invalid-xyz')
      await expect(page).toHaveURL('/volunteer/completed')

      // 8. History row ID = route ID = displayed submission ID = track = score = publication state invariant
      await page.goto('/volunteer/completed')
      // Row 0 is SUB-8814
      const rows = page.locator('.auratio-volunteer-panel > div')
      const firstRowText = await rows.nth(0).innerText()
      expect(firstRowText).toContain('SUB-8814')
      expect(firstRowText).toContain('Extempore')
      expect(firstRowText).toContain('Pending Moderation')

      // Clicking Open on SUB-8814 navigates to /volunteer/completed/sub-8814
      await page.locator('button.auratio-volunteer-btn--secondary', { hasText: 'Open' }).first().click()
      await expect(page).toHaveURL('/volunteer/completed/sub-8814')
      await expect(page.locator('h2.auratio-volunteer-page-title')).toContainText('SUB-8814')
    })

    test('V-03: Real score integrity, no fabricated fallback, and authoritative track registry', async ({ page }) => {
      // 1. Legitimate score is rendered when defined (SUB-8821 with real score: 85)
      await page.goto('/volunteer/completed/sub-8821')
      await expect(page).toHaveURL('/volunteer/completed/sub-8821')
      const sub8821Body = await page.innerText('body')
      expect(sub8821Body).toContain('85 / 100')

      // 2. An entity without score (score === undefined) displays "Pending moderation" and NEVER "85 / 100"
      await page.evaluate(() => {
        const win = window as any
        const existingHistory = (win.__getCompletedHistory ? win.__getCompletedHistory() : [])
        const unscoredRecord = {
          id: 'SUB-UNSCORED',
          track: 'Persuasive',
          assignmentStatus: 'Submitted',
          publicationStatus: 'Pending Moderation',
          route: '/volunteer/completed/sub-unscored',
          // score intentionally omitted / undefined
        }
        window.sessionStorage.setItem('auratio_volunteer_completed_history', JSON.stringify([unscoredRecord, ...existingHistory]))
      })

      await page.goto('/volunteer/completed/sub-unscored')
      await expect(page).toHaveURL('/volunteer/completed/sub-unscored')
      const unscoredBody = await page.innerText('body')
      expect(unscoredBody).toContain('Pending moderation')
      expect(unscoredBody).not.toContain('85 / 100')

      // 3. Verify authoritative MVP track registry integrity across all completed history & active assignments
      const trackIntegrity = await page.evaluate(() => {
        const win = window as any
        const validTracks = [
          'Informative',
          'Extempore',
          'Persuasive',
          'Argumentative / Debate',
          'Explanatory',
          'News Delivery',
          'Business Pitch / Sales Pitch',
          'General Presentation / Multimedia',
          'Academic — Poster / Project / Thesis',
          'Corporate Report',
          'Infotainment-Oriented',
          'Academic — Lecture / Course',
          'Marketing / Promotional',
        ]
        const history = win.__getCompletedHistory ? win.__getCompletedHistory() : []
        const hasMotivational = history.some((h: any) => h.track === 'Motivational')
        const allValid = history.every((h: any) => validTracks.includes(h.track))
        return { hasMotivational, allValid, count: history.length }
      })
      expect(trackIntegrity.hasMotivational).toBe(false)
      expect(trackIntegrity.allValid).toBe(true)

      // 4. Completed history list displays "Persuasive" for SUB-8741
      await page.goto('/volunteer/completed')
      await expect(page).toHaveURL('/volunteer/completed')
      const historyTableText = await page.innerText('body')
      expect(historyTableText).toContain('Persuasive')
      expect(historyTableText).not.toContain('Motivational')
    })
  })

  test.describe('V-04: Submitted route lifecycle integrity & bypass elimination', () => {
    test('1. Fresh canonical SUB-8821 starts Assigned and direct navigation to /volunteer/evaluation/sub-8821/submitted does NOT render Evaluation submitted', async ({ page }) => {
      await page.goto('/volunteer/assignments')
      await expect(page).toHaveURL('/volunteer/assignments')

      const initialAssignment = await page.evaluate(() => {
        const win = window as any
        return win.__getVolunteerAssignment ? win.__getVolunteerAssignment('SUB-8821') : null
      })
      expect(initialAssignment?.assignmentStatus).toBe('Assigned')

      await page.goto('/volunteer/evaluation/sub-8821/submitted')
      await expect(page).toHaveURL('/volunteer/assignments')
      const bodyText = await page.innerText('body')
      expect(bodyText).not.toContain('Evaluation submitted')
      expect(bodyText).toContain('Active Assignments')
    })

    test('2. Accepted SUB-8821 still cannot access submitted page', async ({ page }) => {
      await page.goto('/volunteer/assignments')
      await page.evaluate(() => {
        const assignments = [
          { id: 'SUB-8821', track: 'Business Pitch / Sales Pitch', trackSlug: 'business-pitch', assignmentStatus: 'Accepted', publicationStatus: 'Processing' },
          { id: 'SUB-8814', track: 'Extempore', trackSlug: 'extempore', assignmentStatus: 'Accepted', publicationStatus: 'Processing' },
          { id: 'SUB-8799', track: 'Informative', trackSlug: 'informative', assignmentStatus: 'In Evaluation', publicationStatus: 'Processing' },
        ]
        window.sessionStorage.setItem('auratio_volunteer_assignments', JSON.stringify(assignments))
      })

      await page.goto('/volunteer/evaluation/sub-8821/submitted')
      await expect(page).toHaveURL('/volunteer/assignments')
      const bodyText = await page.innerText('body')
      expect(bodyText).not.toContain('Evaluation submitted')
    })

    test('3. In-Evaluation SUB-8821 still cannot access submitted page', async ({ page }) => {
      await page.goto('/volunteer/assignments')
      await page.evaluate(() => {
        const assignments = [
          { id: 'SUB-8821', track: 'Business Pitch / Sales Pitch', trackSlug: 'business-pitch', assignmentStatus: 'In Evaluation', publicationStatus: 'Processing' },
          { id: 'SUB-8814', track: 'Extempore', trackSlug: 'extempore', assignmentStatus: 'Accepted', publicationStatus: 'Processing' },
          { id: 'SUB-8799', track: 'Informative', trackSlug: 'informative', assignmentStatus: 'In Evaluation', publicationStatus: 'Processing' },
        ]
        window.sessionStorage.setItem('auratio_volunteer_assignments', JSON.stringify(assignments))
      })

      await page.goto('/volunteer/evaluation/sub-8821/submitted')
      await expect(page).toHaveURL('/volunteer/assignments')
      const bodyText = await page.innerText('body')
      expect(bodyText).not.toContain('Evaluation submitted')
    })

    test('4. After a genuine valid completed submission, /volunteer/evaluation/sub-8821/submitted renders correctly', async ({ page }) => {
      await page.goto('/volunteer/assignments')
      await page.evaluate(() => {
        const win = window as any
        const draft = win.__getVolunteerScoringDraft ? win.__getVolunteerScoringDraft('SUB-8821') : null
        if (!draft) throw new Error('No draft')

        for (const [_, cData] of Object.entries(draft.criteria as Record<string, any>)) {
          cData.anchor = 'Competent'
          cData.exactScore = cData.maxPoints === 10 ? 8 : 4
          cData.evidenceTimestamp = '01:23'
          cData.evidence = 'Valid evidence observed in presentation.'
          cData.strength = 'Clear delivery and confident tone.'
          cData.weakness = 'Could expand on next steps.'
          cData.advice = 'Structure the closing ask with tighter milestones.'
        }
        draft.overallSummary = 'Thorough evaluation of the business pitch presentation.'
        window.sessionStorage.setItem('auratio_volunteer_draft_SUB-8821', JSON.stringify(draft))

        const submitResult = win.__submitVolunteerEvaluation('SUB-8821')
        if (!submitResult?.success) {
          throw new Error('Expected canonical-band-compatible V-04 fixture to submit successfully')
        }
      })

      await page.goto('/volunteer/evaluation/sub-8821/submitted')
      await expect(page).toHaveURL('/volunteer/evaluation/sub-8821/submitted')
      await expect(page.locator('h2.auratio-volunteer-page-title')).toHaveText('Evaluation submitted')
      await expect(page.locator('p.auratio-volunteer-page-subtitle')).toContainText('SUB-8821 • evaluator work complete')
      await expect(page.locator('text=Assignment transition complete')).toBeVisible()
      await expect(page.locator('text=Publication remains independent')).toBeVisible()

      await page.goto('/volunteer/assignments')
      const assignmentsText = await page.innerText('body')
      expect(assignmentsText).not.toContain('SUB-8821')

      await page.goto('/volunteer/completed')
      const completedText = await page.innerText('body')
      expect(completedText).toContain('SUB-8821')
    })

    test('5. Unknown IDs fail safely and redirect to assignments', async ({ page }) => {
      await page.goto('/volunteer/evaluation/sub-unknown-999/submitted')
      await expect(page).toHaveURL('/volunteer/assignments')
      const bodyText = await page.innerText('body')
      expect(bodyText).not.toContain('Evaluation submitted')
    })

    test('6. Synthetic unseeded IDs continue failing safely', async ({ page }) => {
      await page.goto('/volunteer/evaluation/sub-synth-nd/submitted')
      await expect(page).toHaveURL('/volunteer/assignments')
      await page.goto('/volunteer/evaluation/sub-synth-mkt/submitted')
      await expect(page).toHaveURL('/volunteer/assignments')
    })

    test('7. Submitted locking and duplicate submission blocking pass', async ({ page }) => {
      await page.goto('/volunteer/assignments')
      await page.evaluate(() => {
        const win = window as any
        const draft = win.__getVolunteerScoringDraft ? win.__getVolunteerScoringDraft('SUB-8821') : null
        for (const [_, cData] of Object.entries(draft.criteria as Record<string, any>)) {
          cData.anchor = 'Excellent'
          cData.exactScore = cData.maxPoints
          cData.evidenceTimestamp = '02:15'
          cData.evidence = 'Excellent pitch delivery.'
          cData.strength = 'Engaging throughout.'
          cData.weakness = 'None.'
          cData.advice = 'Keep standard high.'
        }
        draft.overallSummary = 'Outstanding performance across all rubrics.'
        window.sessionStorage.setItem('auratio_volunteer_draft_SUB-8821', JSON.stringify(draft))
        win.__submitVolunteerEvaluation('SUB-8821')
      })

      const secondSubmit = await page.evaluate(() => {
        const win = window as any
        return win.__submitVolunteerEvaluation ? win.__submitVolunteerEvaluation('SUB-8821') : null
      })
      expect(secondSubmit?.success).toBe(false)

      await page.goto('/volunteer/evaluation/sub-8821/review')
      await expect(page).toHaveURL('/volunteer/completed/sub-8821')

      await page.goto('/volunteer/evaluation/sub-8821')
      await expect(page).toHaveURL('/volunteer/completed/sub-8821')
    })

    test('8. Formal reopened workflow still works and blocks submitted route until resubmission', async ({ page }) => {
      await page.goto('/volunteer/assignments')
      await page.evaluate(() => {
        const win = window as any
        const draft = win.__getVolunteerScoringDraft ? win.__getVolunteerScoringDraft('SUB-8821') : null
        for (const [_, cData] of Object.entries(draft.criteria as Record<string, any>)) {
          cData.anchor = 'Competent'
          cData.exactScore = cData.maxPoints === 10 ? 5 : 3
          cData.evidenceTimestamp = '01:00'
          cData.evidence = 'Good evidence.'
          cData.strength = 'Solid.'
          cData.weakness = 'Pacing.'
          cData.advice = 'Adjust pace.'
        }
        draft.overallSummary = 'Initial submission summary.'
        window.sessionStorage.setItem('auratio_volunteer_draft_SUB-8821', JSON.stringify(draft))
        const submitResult = win.__submitVolunteerEvaluation('SUB-8821')
        if (!submitResult?.success) {
          throw new Error('Expected canonical-band-compatible reopened-workflow fixture to submit successfully')
        }
      })

      await page.goto('/volunteer/evaluation/sub-8821/reopened')
      await expect(page).toHaveURL('/volunteer/evaluation/sub-8821/reopened')
      await expect(page.locator('h2.auratio-volunteer-page-title')).toContainText('SUB-8821 — Reopened Evaluation')

      await page.locator('button.auratio-volunteer-btn--primary', { hasText: 'Continue Correction' }).click()
      await expect(page).toHaveURL('/volunteer/evaluation/sub-8821')

      // Reopened SUB-8821 is now in editable In Evaluation state; direct access to /submitted must be rejected!
      await page.goto('/volunteer/evaluation/sub-8821/submitted')
      await expect(page).toHaveURL('/volunteer/assignments')
      const bodyText = await page.innerText('body')
      expect(bodyText).not.toContain('Evaluation submitted')
    })
  })

  test.describe('Volunteer Assignment Decline Lifecycle & Human Acceptance Defect Repair', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/volunteer/assignments')
      await page.evaluate(() => {
        const win = window as any
        if (win.__resetVolunteerState) win.__resetVolunteerState()
      })
    })

    test('TEST A — exact human defect reproduction: decline, navigate to completed/history, return to active assignments and confirm absent', async ({ page }) => {
      // 1. Start clean session and open Assigned submission
      await page.goto('/volunteer/assignments')
      await expect(page.locator('body')).toContainText('SUB-8821')

      await page.goto('/volunteer/assignments/sub-8821')
      await expect(page.locator('h2.auratio-volunteer-page-title')).toHaveText('SUB-8821')

      // 2. Click Decline
      await page.locator('button.auratio-volunteer-btn--secondary', { hasText: 'Decline' }).click()
      await expect(page).toHaveURL('/volunteer/assignments/sub-8821/decline')

      // 3. Enter required reason
      await page.locator('input.auratio-volunteer-decline-input').fill('Schedule conflict for this week')

      // 4. Confirm Decline
      await page.locator('button.auratio-volunteer-btn--primary', { hasText: 'Confirm Decline' }).click()

      // 5. Assignment disappears from immediate post-decline Active Assignments view
      await expect(page).toHaveURL('/volunteer/assignments/after-decline')
      await expect(page.locator('p.auratio-volunteer-page-subtitle')).toContainText('SUB-8821 was declined and returned to the Admin Unassigned queue')
      const afterDeclineTable = await page.locator('.auratio-volunteer-panel').nth(1).innerText()
      expect(afterDeclineTable).not.toContain('SUB-8821')
      expect(afterDeclineTable).toContain('SUB-8814')
      expect(afterDeclineTable).toContain('SUB-8799')

      // 6. Volunteer navigates to Completed / History
      await page.locator('button.auratio-volunteer-nav-item', { hasText: 'Completed / History' }).click()
      await expect(page).toHaveURL('/volunteer/completed')

      // 7. Volunteer navigates back to Active Assignments
      await page.locator('button.auratio-volunteer-nav-item', { hasText: 'Active Assignments' }).click()
      await expect(page).toHaveURL('/volunteer/assignments')
      await expect(page.locator('h2.auratio-volunteer-page-title')).toHaveText('My Active Assignments')

      // 8. Confirm declined assignment does NOT reappear (is STILL absent)
      const activeBody = await page.locator('body').innerText()
      expect(activeBody).not.toContain('SUB-8821')
      expect(activeBody).toContain('SUB-8814')
      expect(activeBody).toContain('SUB-8799')
    })

    test('TEST B — refresh persistence: declined assignment remains absent after page refresh on active assignments', async ({ page }) => {
      // 1. Decline assignment
      await page.goto('/volunteer/assignments/sub-8821')
      await page.locator('button.auratio-volunteer-btn--secondary', { hasText: 'Decline' }).click()
      await page.locator('input.auratio-volunteer-decline-input').fill('Conflict of interest with submitter')
      await page.locator('button.auratio-volunteer-btn--primary', { hasText: 'Confirm Decline' }).click()
      await expect(page).toHaveURL('/volunteer/assignments/after-decline')

      // 2. Navigate to Active Assignments and refresh
      await page.goto('/volunteer/assignments')
      expect(await page.locator('body').innerText()).not.toContain('SUB-8821')

      await page.reload()
      await expect(page).toHaveURL('/volunteer/assignments')

      // 3. Confirm declined submission remains absent
      const refreshedBody = await page.locator('body').innerText()
      expect(refreshedBody).not.toContain('SUB-8821')
      expect(refreshedBody).toContain('SUB-8814')
      expect(refreshedBody).toContain('SUB-8799')
    })

    test('TEST C — Back/Forward persistence: browser history navigation does not resurrect declined assignment', async ({ page }) => {
      // 1. Decline assignment
      await page.goto('/volunteer/assignments/sub-8821')
      await page.locator('button.auratio-volunteer-btn--secondary', { hasText: 'Decline' }).click()
      await page.locator('input.auratio-volunteer-decline-input').fill('Unavailable for evaluation period')
      await page.locator('button.auratio-volunteer-btn--primary', { hasText: 'Confirm Decline' }).click()
      await expect(page).toHaveURL('/volunteer/assignments/after-decline')

      // 2. Navigate between Volunteer pages
      await page.locator('button.auratio-volunteer-nav-item', { hasText: 'Completed / History' }).click()
      await expect(page).toHaveURL('/volunteer/completed')

      await page.locator('button.auratio-volunteer-nav-item', { hasText: 'Active Assignments' }).click()
      await expect(page).toHaveURL('/volunteer/assignments')
      expect(await page.locator('body').innerText()).not.toContain('SUB-8821')

      // 3. Use browser Back (returns to Completed / History)
      await page.goBack()
      await expect(page).toHaveURL('/volunteer/completed')

      // 4. Use browser Forward (returns to Active Assignments)
      await page.goForward()
      await expect(page).toHaveURL('/volunteer/assignments')

      // 5. Confirm declined assignment does not resurrect
      const bodyText = await page.locator('body').innerText()
      expect(bodyText).not.toContain('SUB-8821')
      expect(bodyText).toContain('SUB-8814')
      expect(bodyText).toContain('SUB-8799')
    })

    test('TEST D — reason gate: empty and whitespace-only reasons do not decline and assignment remains active', async ({ page }) => {
      await page.goto('/volunteer/assignments/sub-8821/decline')

      // Case A: empty reason
      await page.locator('input.auratio-volunteer-decline-input').fill('')
      await page.locator('button.auratio-volunteer-btn--primary', { hasText: 'Confirm Decline' }).click()
      // Blocked: remains on decline page
      await expect(page).toHaveURL('/volunteer/assignments/sub-8821/decline')

      // Case B: whitespace-only reason
      await page.locator('input.auratio-volunteer-decline-input').fill('     \t  \n  ')
      await page.locator('button.auratio-volunteer-btn--primary', { hasText: 'Confirm Decline' }).click()
      // Blocked: remains on decline page
      await expect(page).toHaveURL('/volunteer/assignments/sub-8821/decline')

      // Verify assignment was NOT declined and remains active in storage
      const checkActive = await page.evaluate(() => {
        const win = window as any
        return {
          isDeclined: win.__isAssignmentDeclined ? win.__isAssignmentDeclined('SUB-8821') : false,
          assignment: win.__getVolunteerAssignment ? win.__getVolunteerAssignment('SUB-8821') : null,
        }
      })
      expect(checkActive.isDeclined).toBe(false)
      expect(checkActive.assignment).not.toBeNull()
      expect(checkActive.assignment.assignmentStatus).toBe('Assigned')

      // Cancel returns to task page
      await page.locator('button.auratio-volunteer-btn--secondary', { hasText: 'Cancel' }).click()
      await expect(page).toHaveURL('/volunteer/assignments/sub-8821')
      await expect(page.locator('h2.auratio-volunteer-page-title')).toHaveText('SUB-8821')
    })

    test('TEST E — no Completed pollution: declined assignment does not appear as completed evaluation', async ({ page }) => {
      // 1. Decline assignment
      await page.goto('/volunteer/assignments/sub-8821')
      await page.locator('button.auratio-volunteer-btn--secondary', { hasText: 'Decline' }).click()
      await page.locator('input.auratio-volunteer-decline-input').fill('Cannot evaluate in this track')
      await page.locator('button.auratio-volunteer-btn--primary', { hasText: 'Confirm Decline' }).click()
      await expect(page).toHaveURL('/volunteer/assignments/after-decline')

      // 2. Inspect Completed / History page
      await page.goto('/volunteer/completed')
      await expect(page).toHaveURL('/volunteer/completed')

      // Must not appear in table or page
      const completedText = await page.locator('body').innerText()
      expect(completedText).not.toContain('SUB-8821')

      // 3. Inspect storage layer: no draft, no score, not submitted
      const storageState = await page.evaluate(() => {
        const win = window as any
        const rawDraft = window.sessionStorage.getItem('auratio_volunteer_draft_SUB-8821')
        return {
          completedHistory: win.__getCompletedHistory ? win.__getCompletedHistory() : [],
          isSubmitted: win.__isEvaluationSubmitted ? win.__isEvaluationSubmitted('SUB-8821') : null,
          rawDraft,
          scoringDraft: win.__getVolunteerScoringDraft ? win.__getVolunteerScoringDraft('SUB-8821') : null,
          declinedRecord: win.__getDeclinedAssignment ? win.__getDeclinedAssignment('SUB-8821') : null,
        }
      })
      expect(storageState.completedHistory.some((c: any) => c.id.toUpperCase() === 'SUB-8821')).toBe(false)
      expect(storageState.isSubmitted).toBe(false)
      expect(storageState.rawDraft).toBeNull()
      expect(storageState.scoringDraft).toBeNull()
      expect(storageState.declinedRecord).not.toBeNull()
      expect(storageState.declinedRecord.reason).toBe('Cannot evaluate in this track')
      expect(storageState.declinedRecord.returnedToAdminQueue).toBe(true)
    })

    test('TEST F — state isolation: declining submission A does not remove or alter submission B or C', async ({ page }) => {
      // Clean start has SUB-8821, SUB-8814, SUB-8799
      await page.goto('/volunteer/assignments')
      const initialBody = await page.locator('body').innerText()
      expect(initialBody).toContain('SUB-8821')
      expect(initialBody).toContain('SUB-8814')
      expect(initialBody).toContain('SUB-8799')

      // Decline SUB-8821 only
      await page.goto('/volunteer/assignments/sub-8821')
      await page.locator('button.auratio-volunteer-btn--secondary', { hasText: 'Decline' }).click()
      await page.locator('input.auratio-volunteer-decline-input').fill('Decline submission A only')
      await page.locator('button.auratio-volunteer-btn--primary', { hasText: 'Confirm Decline' }).click()
      await expect(page).toHaveURL('/volunteer/assignments/after-decline')

      // Return to active assignments
      await page.goto('/volunteer/assignments')
      await expect(page).toHaveURL('/volunteer/assignments')

      // Verify state isolation:
      // SUB-8821 is gone
      const activeBody = await page.locator('body').innerText()
      expect(activeBody).not.toContain('SUB-8821')

      // SUB-8814 is fully intact with track "Extempore" and status "Accepted"
      expect(activeBody).toContain('SUB-8814')
      expect(activeBody).toContain('Extempore')
      expect(activeBody).toContain('Accepted')

      // SUB-8799 is fully intact with track "Informative" and status "In Evaluation"
      expect(activeBody).toContain('SUB-8799')
      expect(activeBody).toContain('Informative')
      expect(activeBody).toContain('In Evaluation')

      // Both B and C can still be opened
      await page.locator('button[aria-label="Open SUB-8814"]').click()
      await expect(page).toHaveURL('/volunteer/assignments/sub-8814')
      await expect(page.locator('h2.auratio-volunteer-page-title')).toHaveText('SUB-8814')

      await page.goto('/volunteer/assignments')
      await page.locator('button[aria-label="Open SUB-8799"]').click()
      await expect(page).toHaveURL('/volunteer/evaluation/sub-8799')
      await expect(page.locator('h2.auratio-volunteer-page-title')).toContainText('SUB-8799')
    })

    test('TEST G — re-entry: directly reopening the old Assigned-task route after decline fails safely / redirects', async ({ page }) => {
      // Decline SUB-8821
      await page.goto('/volunteer/assignments/sub-8821')
      await page.locator('button.auratio-volunteer-btn--secondary', { hasText: 'Decline' }).click()
      await page.locator('input.auratio-volunteer-decline-input').fill('Legitimate decline reason')
      await page.locator('button.auratio-volunteer-btn--primary', { hasText: 'Confirm Decline' }).click()
      await expect(page).toHaveURL('/volunteer/assignments/after-decline')

      // Attempt 1: Direct navigation to /volunteer/assignments/sub-8821
      await page.goto('/volunteer/assignments/sub-8821')
      // Must safely redirect to /volunteer/assignments rather than restoring ownership
      await expect(page).toHaveURL('/volunteer/assignments')
      expect(await page.locator('body').innerText()).not.toContain('SUB-8821')

      // Attempt 2: Direct navigation to /volunteer/assignments/sub-8821/decline
      await page.goto('/volunteer/assignments/sub-8821/decline')
      // Must also safely redirect to /volunteer/assignments
      await expect(page).toHaveURL('/volunteer/assignments')
      expect(await page.locator('body').innerText()).not.toContain('SUB-8821')

      // Attempt 3: Direct navigation to /volunteer/evaluation/sub-8821
      await page.goto('/volunteer/evaluation/sub-8821')
      await expect(page).toHaveURL('/volunteer/assignments')
      expect(await page.locator('body').innerText()).not.toContain('SUB-8821')
    })
  })
})
