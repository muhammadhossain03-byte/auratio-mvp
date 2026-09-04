import { test, expect, captureEvidenceScreenshot, resetMockState, registerErrorTracking, assertNoPageErrors } from './helpers/fixtures'

test.describe('Admin Request, Moderation, Volunteer, Event, and Audit Regressions', () => {
  test.beforeEach(async ({ page }) => {
    registerErrorTracking(page)
    await resetMockState(page)
  })

  test.afterEach(async ({ page }) => {
    assertNoPageErrors(page)
  })

  // 7. ADMIN REQUEST / EVALUATION REGRESSION
  test('request queue rows open correct isolated entities and reassignment preserves ownership integrity', async ({ page }) => {
    await page.goto('/admin/requests')
    await expect(page).toHaveURL('/admin/requests')

    // 1. REQ-1042
    const req1042Row = page.locator('[data-request-id="REQ-1042"]')
    await expect(req1042Row).toBeVisible()
    await req1042Row.locator('button.auratio-admin-btn--table-open').click()
    await expect(page).toHaveURL('/admin/requests/req-1042')
    await expect(page.locator('h2.auratio-admin-page-title')).toContainText('REQ-1042')
    await expect(page.locator('text=Alex Morgan')).toBeVisible()
    await expect(page.locator('text=Business Pitch / Sales Pitch')).toBeVisible()

    // 2. REQ-1041 (Assigned AI)
    await page.goto('/admin/requests')
    const req1041Row = page.locator('[data-request-id="REQ-1041"]')
    await req1041Row.locator('button.auratio-admin-btn--table-open').click()
    await expect(page).toHaveURL('/admin/requests/req-1041')
    await expect(page.locator('h2.auratio-admin-page-title')).toContainText('REQ-1041')
    await expect(page.locator('text=Sam Lee')).toBeVisible()
    await expect(page.locator('text=Informative')).toBeVisible()
    await expect(page.locator('text=Assigned AI')).toBeVisible()

    // 3. REQ-1038 (Assigned Human) - must never open REQ-1042
    await page.goto('/admin/requests')
    const req1038Row = page.locator('[data-request-id="REQ-1038"]')
    await req1038Row.locator('button.auratio-admin-btn--table-open').click()
    await expect(page).toHaveURL('/admin/requests/req-1038')
    await expect(page.locator('h2.auratio-admin-page-title')).toContainText('REQ-1038')
    await expect(page.locator('text=Taylor Kim')).toBeVisible()
    await expect(page.locator('text=Extempore')).toBeVisible()
    await expect(page.locator('text=Assigned Human')).toBeVisible()
    await expect(page.locator('text=REQ-1042')).toHaveCount(0)

    // Capture REQ-1038 screenshot
    await captureEvidenceScreenshot(page, '03_req_1038.png')

    // 4. REQ-1034 (Redirected Human)
    await page.goto('/admin/requests')
    const req1034Row = page.locator('[data-request-id="REQ-1034"]')
    await req1034Row.locator('button.auratio-admin-btn--table-open').click()
    await expect(page).toHaveURL('/admin/requests/req-1034')
    await expect(page.locator('h2.auratio-admin-page-title')).toContainText('REQ-1034')

    // 5. Reassignment flow on REQ-1042
    await page.goto('/admin/requests/req-1042/reassign')
    await expect(page).toHaveURL('/admin/requests/req-1042/reassign')

    // Cancel reassignment - ownership must NOT mutate
    await page.locator('button.auratio-admin-btn--secondary', { hasText: 'Cancel' }).click()
    await expect(page).toHaveURL('/admin/requests')
    const cancelOwnership = await page.evaluate(() => {
      const win = window as unknown as { __getHE0142AssignmentState?: () => { activeOwner: string; supersededOwner: string | null } }
      return win.__getHE0142AssignmentState?.()
    })
    expect(cancelOwnership?.activeOwner).toBe('Farhana Islam')
    expect(cancelOwnership?.supersededOwner).toBeNull()

    // Confirm reassignment
    await page.goto('/admin/requests/req-1042/reassign')
    await page.locator('button.auratio-admin-btn--primary', { hasText: 'Confirm Reassignment' }).click()
    await expect(page).toHaveURL('/admin/requests')

    const confirmOwnership = await page.evaluate(() => {
      const win = window as unknown as { __getHE0142AssignmentState?: () => { activeOwner: string; supersededOwner: string | null } }
      return win.__getHE0142AssignmentState?.()
    })
    expect(confirmOwnership?.activeOwner).toBe('Nadia Rahman')
    expect(confirmOwnership?.supersededOwner).toBe('Farhana Islam')
  })

  // 8. MODERATION ENTITY-INTEGRITY REGRESSION
  test('moderation queue preserves entity integrity across SUB-8821 and SUB-8730 with safe invalid route redirects', async ({ page }) => {
    await page.goto('/admin/moderation')
    await expect(page).toHaveURL('/admin/moderation')

    // Open SUB-8730
    const sub8730Row = page.locator('div[style*="height: 76px"]').filter({ hasText: 'SUB-8730' })
    await sub8730Row.locator('button').click()
    await expect(page).toHaveURL('/admin/moderation/sub-8730')
    await expect(page.locator('h2.auratio-admin-page-title')).toContainText('SUB-8730')
    await expect(page.locator('text=Extempore')).toBeVisible()
    await expect(page.locator('text=Assigned Human evaluator')).toBeVisible()

    // Capture SUB-8730 screenshot
    await captureEvidenceScreenshot(page, '04_sub_8730.png')

    // Test SUB-8730 Approve Cancel
    await page.locator('button.auratio-admin-btn--primary', { hasText: 'Approve' }).click()
    await expect(page).toHaveURL('/admin/moderation/sub-8730/approve')
    await expect(page.locator('text=SUB-8730')).toBeVisible()
    await page.locator('button.auratio-admin-btn--secondary', { hasText: 'Cancel' }).click()
    await expect(page).toHaveURL('/admin/moderation/sub-8730')

    // Test SUB-8730 Reject Cancel
    await page.locator('button.auratio-admin-btn--secondary', { hasText: 'Reject' }).click()
    await expect(page).toHaveURL('/admin/moderation/sub-8730/reject')
    await expect(page.locator('text=SUB-8730')).toBeVisible()
    await page.locator('button.auratio-admin-btn--secondary', { hasText: 'Cancel' }).click()
    await expect(page).toHaveURL('/admin/moderation/sub-8730')

    // Test SUB-8730 Re-review Cancel
    await page.locator('button.auratio-admin-btn--secondary', { hasText: 'Request Re-review' }).click()
    await expect(page).toHaveURL('/admin/moderation/sub-8730/re-review')
    await expect(page.locator('text=SUB-8730')).toBeVisible()
    await page.locator('button.auratio-admin-btn--secondary', { hasText: 'Cancel' }).click()
    await expect(page).toHaveURL('/admin/moderation/sub-8730')

    // Confirm Approval of SUB-8730 and verify sibling SUB-8821 remains unmutated
    await page.locator('button.auratio-admin-btn--primary', { hasText: 'Approve' }).click()
    await page.locator('button.auratio-admin-btn--primary', { hasText: 'Confirm Approval' }).click()
    await expect(page).toHaveURL('/admin/evaluations')

    const modStates = await page.evaluate(() => {
      const win = window as unknown as { __getModerationEntityState?: (id: string) => { id: string; publicationStatus: string } | undefined }
      return {
        sub8730: win.__getModerationEntityState?.('SUB-8730'),
        sub8821: win.__getModerationEntityState?.('SUB-8821'),
      }
    })
    expect(modStates.sub8730?.publicationStatus).toBe('Approved')
    expect(modStates.sub8821?.publicationStatus).toBe('Pending Moderation')

    // Direct invalid routes must safely redirect to /admin/moderation
    const invalidRoutes = [
      '/admin/moderation/sub-9999',
      '/admin/moderation/sub-9999/approve',
      '/admin/moderation/sub-9999/reject',
      '/admin/moderation/sub-9999/re-review',
    ]
    for (const r of invalidRoutes) {
      await page.goto(r)
      await expect(page).toHaveURL('/admin/moderation')
    }

    // Verify SUB-9999 was NOT synthesized in state
    const fakeEntity = await page.evaluate(() => {
      const win = window as unknown as { __getModerationEntityState?: (id: string) => unknown }
      return win.__getModerationEntityState?.('SUB-9999')
    })
    expect(fakeEntity).toBeUndefined()
  })

  // 9. ADMIN VOLUNTEER REGRESSION
  test('admin volunteer management verifies directory routing, active management isolation, and disabled controls', async ({ page }) => {
    await page.goto('/admin/volunteers')

    // 1. Directory routing: Farhana, Rakib, Mehnaz, Nusrat
    const volunteerRows = page.locator('div[style*="height: 48px"]')
    
    // Rakib
    const rakibRow = volunteerRows.filter({ hasText: 'Rakib Hasan' })
    await rakibRow.locator('button').click()
    await expect(page).toHaveURL('/admin/volunteers/rakib')
    await expect(page.locator('h2.auratio-admin-page-title')).toHaveText('Rakib Hasan')
    await expect(page.locator('.auratio-admin-status-pill--active').first()).toHaveText('Active')

    // Capture Rakib screenshot
    await captureEvidenceScreenshot(page, '05_rakib.png')

    // Edit Rakib tracks: remove Extempore
    await page.locator('button.auratio-admin-btn--primary', { hasText: 'Manage Track Eligibility' }).click()
    await expect(page).toHaveURL('/admin/volunteers/rakib/tracks')
    await page.locator('button[role="checkbox"]', { hasText: 'Extempore' }).click()
    await page.locator('button.auratio-admin-btn--primary', { hasText: 'Save Eligibility' }).click()
    await expect(page).toHaveURL('/admin/volunteers/rakib')

    // Prove Farhana and Mehnaz tracks remain unchanged
    const trackStates = await page.evaluate(() => {
      const win = window as unknown as { __getVolunteerTrackEligibility?: (id: string) => string[] }
      return {
        rakib: win.__getVolunteerTrackEligibility?.('rakib'),
        farhana: win.__getVolunteerTrackEligibility?.('farhana'),
        mehnaz: win.__getVolunteerTrackEligibility?.('mehnaz'),
      }
    })
    expect(trackStates.rakib).not.toContain('Extempore')
    expect(trackStates.farhana).toEqual(['Informative', 'Persuasive', 'Business Pitch / Sales Pitch'])
    expect(trackStates.mehnaz?.length).toBe(2)

    // Override Mehnaz availability
    await page.goto('/admin/volunteers/mehnaz')
    await expect(page).toHaveURL('/admin/volunteers/mehnaz')
    await page.locator('button.auratio-admin-btn--primary', { hasText: 'Override Availability' }).click()
    await expect(page).toHaveURL('/admin/volunteers/mehnaz/availability')
    await page.locator('button.auratio-admin-btn--primary', { hasText: 'Apply Override' }).click()
    await expect(page).toHaveURL('/admin/volunteers/mehnaz')

    // Prove Farhana and Rakib availability remains unchanged
    const availStates = await page.evaluate(() => {
      const win = window as unknown as { __getVolunteerAvailabilityState?: (id: string) => { effectiveAvailability: string } }
      return {
        farhana: win.__getVolunteerAvailabilityState?.('farhana'),
        mehnaz: win.__getVolunteerAvailabilityState?.('mehnaz'),
        rakib: win.__getVolunteerAvailabilityState?.('rakib'),
      }
    })
    expect(availStates.farhana?.effectiveAvailability).toBe('Available')
    expect(availStates.mehnaz?.effectiveAvailability).toBe('Available')
    expect(availStates.rakib?.effectiveAvailability).toBe('Available')

    // Nusrat controls disabled
    await page.goto('/admin/volunteers/nusrat')
    await expect(page).toHaveURL('/admin/volunteers/nusrat')
    await expect(page.locator('button', { hasText: 'Manage Track Eligibility' })).toBeDisabled()
    await expect(page.locator('button', { hasText: 'Override Availability' })).toBeDisabled()

    // Direct Nusrat management URLs redirect to /admin/volunteers
    await page.goto('/admin/volunteers/nusrat/tracks')
    await expect(page).toHaveURL('/admin/volunteers')

    await page.goto('/admin/volunteers/nusrat/availability')
    await expect(page).toHaveURL('/admin/volunteers')

    // Unknown volunteer URL redirects safely
    await page.goto('/admin/volunteers/unknown-vol')
    await expect(page).toHaveURL('/admin/volunteers')

    await page.goto('/admin/volunteers/unknown-vol/tracks')
    await expect(page).toHaveURL('/admin/volunteers')

    // Invited custom volunteer does not mutate canonical volunteers
    await page.goto('/admin/volunteers/invite')
    await page.locator('#invite-display-name').fill('Custom Vol QA')
    await page.locator('#invite-email').fill('custom.vol@auratio.org')
    await page.locator('button.auratio-admin-btn--primary', { hasText: 'Send Volunteer Invite' }).click()
    await expect(page).toHaveURL('/admin/volunteers')
    await expect(page.locator('text=Custom Vol QA')).toBeVisible()

    const canonicalFarhana = await page.evaluate(() => {
      const win = window as unknown as { __getVolunteerTrackEligibility?: (id: string) => string[] }
      return win.__getVolunteerTrackEligibility?.('farhana')
    })
    expect(canonicalFarhana).toEqual(['Informative', 'Persuasive', 'Business Pitch / Sales Pitch'])
  })

  // 10. ADMIN EVENT REGRESSION
  test('admin event management handles All Events, Published filter, Save Draft persistence, and event isolation', async ({ page }) => {
    await page.goto('/admin/events')
    await expect(page).toHaveURL('/admin/events')

    // Initial state contains both Published and Draft
    await expect(page.locator('text=Public Speaking Summit')).toBeVisible()
    await expect(page.locator('text=Draft Event')).toBeVisible()

    // Click Published filter
    const publishedFilterBtn = page.locator('button[data-testid="admin-events-filter-published"]')
    await publishedFilterBtn.click()
    await expect(publishedFilterBtn).toHaveAttribute('aria-pressed', 'true')
    await expect(page.locator('text=Public Speaking Summit')).toBeVisible()
    await expect(page.locator('text=Draft Event')).toHaveCount(0)

    // Capture Published filter screenshot
    await captureEvidenceScreenshot(page, '06_event_published_filter.png')

    // Return to All Events
    const allEventsFilterBtn = page.locator('button[data-testid="admin-events-filter-all"]')
    await allEventsFilterBtn.click()
    await expect(allEventsFilterBtn).toHaveAttribute('aria-pressed', 'true')
    await expect(page.locator('text=Draft Event')).toBeVisible()

    // Create Event -> Save Draft
    await page.locator('button.auratio-admin-btn--primary', { hasText: 'Create Event' }).click()
    await expect(page).toHaveURL('/admin/events/editor')
    await page.locator('#event-title').fill('Playwright Test Event')
    await page.locator('#event-division').fill('Sylhet Division')
    await page.locator('button.auratio-admin-btn--secondary', { hasText: 'Save Draft' }).click()
    await expect(page).toHaveURL('/admin/events')

    // Newly saved draft appears in directory
    await expect(page.locator('text=Playwright Test Event')).toBeVisible()

    // Reopen exact saved draft and verify data persistence
    const newDraftRow = page.locator('.auratio-admin-panel > div').filter({ hasText: 'Playwright Test Event' })
    await newDraftRow.locator('button').click()
    await expect(page.locator('#event-title')).toHaveValue('Playwright Test Event')
    await page.locator('button.auratio-admin-btn--secondary', { hasText: 'Save Draft' }).click()
    await expect(page).toHaveURL('/admin/events')

    // Published filter excludes the newly created draft
    await publishedFilterBtn.click()
    await expect(page.locator('text=Playwright Test Event')).toHaveCount(0)

    // All events restores it
    await allEventsFilterBtn.click()
    await expect(page.locator('text=Playwright Test Event')).toBeVisible()
  })

  // 11. AUDIT LOG REGRESSION
  test('operational audit log filters correctly, displays empty moderation state, and maintains read-only integrity', async ({ page }) => {
    await page.goto('/admin/audit')
    await expect(page).toHaveURL('/admin/audit')

    const getRowCount = async () => {
      const isEmpty = await page.locator('text=No audit logs found for category').isVisible().catch(() => false)
      if (isEmpty) return 0
      return page.locator('div[style*="height: 48px"]').count()
    }

    // Initial All events: 5 rows
    expect(await getRowCount()).toBe(5)

    // Assignment filter: 1 row
    await page.locator('button.auratio-admin-status-pill', { hasText: 'Assignment' }).click()
    expect(await getRowCount()).toBe(1)

    // Capture Audit Assignment filter screenshot
    await captureEvidenceScreenshot(page, '07_audit_assignment_filter.png')

    // Evaluation filter: 1 row
    await page.locator('button.auratio-admin-status-pill', { hasText: 'Evaluation' }).click()
    expect(await getRowCount()).toBe(1)

    // Governance filter: 1 row
    await page.locator('button.auratio-admin-status-pill', { hasText: 'Governance' }).click()
    expect(await getRowCount()).toBe(1)

    // Volunteer filter: 2 rows
    await page.locator('button.auratio-admin-status-pill', { hasText: 'Volunteer' }).click()
    expect(await getRowCount()).toBe(2)

    // Moderation filter: empty state message
    await page.locator('button.auratio-admin-status-pill', { hasText: 'Moderation' }).click()
    expect(await getRowCount()).toBe(0)
    await expect(page.locator('text=No audit logs found for category')).toBeVisible()

    // Restore All events: 5 rows
    await page.locator('button.auratio-admin-status-pill', { hasText: 'All events' }).click()
    expect(await getRowCount()).toBe(5)

    // Verify audit log has no edit/mutate buttons
    await expect(page.locator('text=Audit entries are read-only')).toBeVisible()
    await expect(page.locator('.auratio-admin-panel').nth(1).locator('button')).toHaveCount(0)
  })
})
