import fs from 'node:fs'
import path from 'node:path'
import { expect, test, type Page } from '@playwright/test'

const OUT = path.resolve(process.cwd(), 'capture_output', 'final_reclose', 'portal')
const VIEWPORT = { width: 1366, height: 900 }

type CaptureCase = {
  id: string
  route: string
  prepare?: (page: Page) => Promise<void>
}

async function reset(page: Page) {
  // The exhaustive capture test already stays on the same Vite origin after
  // its first navigation. Re-loading /auth/sign-in before every screen doubles
  // the number of full document navigations and dominates runtime. Navigate
  // only for the initial about:blank page; later resets clear deterministic
  // browser/mock state in-place before capture() performs the one required
  // route navigation for the next screen.
  if (!page.url().startsWith('http://localhost:5173/')) {
    await page.goto('/auth/sign-in')
  }

  await page.evaluate(() => {
    try {
      sessionStorage.clear()
      localStorage.clear()
    } catch {}
    const w = window as any
    w.__resetVolunteerState?.()
    w.__resetHE0142Reassignment?.()
    w.__resetSUB8834Lifecycle?.()
    w.__resetAllModeration?.()
    w.__resetSub8821Moderation?.()
    w.__resetAdminVolunteers?.()
    w.__resetAdminEvents?.()
    w.__auratioResetSuperAdmin?.()
  })
}

async function capture(page: Page, c: CaptureCase) {
  if (c.prepare) await c.prepare(page)
  await page.goto(c.route)
  await page.waitForTimeout(250)

  // Canonical/supplemental screen must actually resolve to its intended route.
  const actual = new URL(page.url()).pathname
  expect(actual, `${c.id}: unexpected redirect from ${c.route}`).toBe(c.route)

  // Horizontal clipping is a material visual defect at the canonical viewport.
  const geom = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    bodyScrollWidth: document.body?.scrollWidth ?? 0,
  }))
  expect(
    Math.max(geom.scrollWidth, geom.bodyScrollWidth),
    `${c.id}: horizontal overflow at 1366×900`,
  ).toBeLessThanOrEqual(geom.clientWidth + 2)

  await page.screenshot({
    path: path.join(OUT, `${c.id}.png`),
    fullPage: false,
    animations: 'disabled',
  })
}

async function seedInEvaluation(page: Page) {
  await page.goto('/volunteer/assignments')
  await page.evaluate(() => {
    const w = window as any
    w.__seedVolunteerAssignment?.({
      id: 'SUB-8821',
      track: 'Business Pitch / Sales Pitch',
      trackSlug: 'business-pitch',
      assignmentStatus: 'In Evaluation',
      publicationStatus: 'Processing',
    })
  })
}

async function seedSubmitted(page: Page) {
  await seedInEvaluation(page)
  const result = await page.evaluate(() => {
    const w = window as any
    const draft = w.__getVolunteerScoringDraft?.('SUB-8821')
    if (!draft) return { success: false, error: 'draft unavailable' }

    for (const criterion of Object.values(draft.criteria) as any[]) {
      const exactScore = criterion.maxPoints === 10 ? 5 : 3
      w.__saveCriterionScoreData?.('SUB-8821', criterion.id, {
        anchor: 'Competent',
        exactScore,
        evidenceTimestamp: '00:15',
        evidence: 'Final re-close deterministic evidence.',
        strength: 'Clear strength.',
        weakness: 'Specific weakness.',
        advice: 'Specific actionable improvement.',
      })
    }
    w.__saveOverallSummary?.(
      'SUB-8821',
      'Final Step-IV re-close deterministic Human evaluation summary.',
    )
    return w.__submitVolunteerEvaluation?.('SUB-8821') ?? { success: false }
  })
  expect(result?.success, 'Unable to seed submitted Human evaluation').toBeTruthy()
}

async function seedReopened(page: Page) {
  await seedSubmitted(page)
  const reopened = await page.evaluate(() => {
    const w = window as any
    return w.__reopenEvaluation?.('SUB-8821')
  })
  expect(reopened, 'Unable to seed reopened Human evaluation').toBeTruthy()
}

async function seedDeclined(page: Page) {
  await page.goto('/volunteer/assignments/sub-8821')
  const result = await page.evaluate(() => {
    const w = window as any
    return w.__declineVolunteerAssignment?.(
      'SUB-8821',
      'Final re-close deterministic decline reason',
    )
  })
  expect(result?.success, 'Unable to seed declined assignment').toBeTruthy()
}

async function seedReq1042Reassignment(page: Page) {
  await page.goto('/admin/requests/req-1042/assign')
  await page.evaluate(() => {
    const w = window as any
    w.__stageHE0142Reassignment?.('Rakib Hasan', 'request')
  })
}

async function seedSub8834Reassignment(page: Page) {
  await page.goto('/admin/evaluations/sub-8834')
  await page.evaluate(() => {
    const w = window as any
    w.__stageSUB8834Reassignment?.('Tasnim Noor')
  })
}

const canonical: CaptureCase[] = [
  // 8 shared portal-auth screens.
  { id: 'P01_auth_sign_in', route: '/auth/sign-in' },
  { id: 'P02_auth_role_authorization', route: '/auth/role-authorization' },
  { id: 'P03_auth_email_verification', route: '/auth/email-verification' },
  { id: 'P04_auth_access_unavailable', route: '/auth/access-unavailable' },
  { id: 'P05_auth_forgot_password', route: '/auth/forgot-password' },
  { id: 'P06_auth_reset_link_sent', route: '/auth/reset-link-sent' },
  { id: 'P07_auth_reset_password', route: '/auth/reset-password' },
  { id: 'P08_auth_password_reset_complete', route: '/auth/password-reset-complete' },

  // 16 Volunteer screens.
  { id: 'P09_vol_assignments', route: '/volunteer/assignments' },
  { id: 'P10_vol_assigned_task', route: '/volunteer/assignments/sub-8821' },
  { id: 'P11_vol_decline', route: '/volunteer/assignments/sub-8821/decline' },
  { id: 'P12_vol_after_decline', route: '/volunteer/assignments/after-decline', prepare: seedDeclined },
  { id: 'P13_vol_availability', route: '/volunteer/availability' },
  { id: 'P14_vol_unavailable', route: '/volunteer/availability/unavailable' },
  { id: 'P15_vol_scoring', route: '/volunteer/evaluation/sub-8821', prepare: seedInEvaluation },
  { id: 'P16_vol_criterion', route: '/volunteer/evaluation/sub-8821/criterion', prepare: seedInEvaluation },
  { id: 'P17_vol_review', route: '/volunteer/evaluation/sub-8821/review', prepare: seedInEvaluation },
  { id: 'P18_vol_submitted', route: '/volunteer/evaluation/sub-8821/submitted', prepare: seedSubmitted },
  { id: 'P19_vol_completed', route: '/volunteer/completed' },
  { id: 'P20_vol_completed_pending', route: '/volunteer/completed/sub-8821' },
  { id: 'P21_vol_completed_approved', route: '/volunteer/completed/sub-8792' },
  { id: 'P22_vol_completed_rejected', route: '/volunteer/completed/sub-8755' },
  { id: 'P23_vol_completed_processing', route: '/volunteer/completed/sub-8741' },
  { id: 'P24_vol_reopened', route: '/volunteer/evaluation/sub-8821/reopened', prepare: seedReopened },

  // 23 canonical Admin screens.
  { id: 'P25_admin_dashboard', route: '/admin/dashboard' },
  { id: 'P26_admin_requests', route: '/admin/requests' },
  { id: 'P27_admin_req1042', route: '/admin/requests/req-1042' },
  { id: 'P28_admin_assignment_picker', route: '/admin/requests/req-1042/assign' },
  { id: 'P29_admin_confirm_reassignment', route: '/admin/requests/req-1042/reassign', prepare: seedReq1042Reassignment },
  { id: 'P30_admin_req1041_ai', route: '/admin/requests/req-1041' },
  { id: 'P31_admin_req1034_redirected', route: '/admin/requests/req-1034' },
  { id: 'P32_admin_evaluations', route: '/admin/evaluations' },
  { id: 'P33_admin_sub8834_processing', route: '/admin/evaluations/sub-8834' },
  { id: 'P34_admin_sub8798_approved_ai', route: '/admin/evaluations/sub-8798' },
  { id: 'P35_admin_moderation', route: '/admin/moderation' },
  { id: 'P36_admin_moderation_review', route: '/admin/moderation/sub-8821' },
  { id: 'P37_admin_moderation_approve', route: '/admin/moderation/sub-8821/approve' },
  { id: 'P38_admin_moderation_reject', route: '/admin/moderation/sub-8821/reject' },
  { id: 'P39_admin_rereview', route: '/admin/moderation/sub-8821/re-review' },
  { id: 'P40_admin_volunteers', route: '/admin/volunteers' },
  { id: 'P41_admin_invite_volunteer', route: '/admin/volunteers/invite' },
  { id: 'P42_admin_volunteer_account', route: '/admin/volunteers/farhana' },
  { id: 'P43_admin_availability_override', route: '/admin/volunteers/farhana/availability' },
  { id: 'P44_admin_track_eligibility', route: '/admin/volunteers/farhana/tracks' },
  { id: 'P45_admin_events', route: '/admin/events' },
  { id: 'P46_admin_event_editor', route: '/admin/events/editor' },
  { id: 'P47_admin_audit', route: '/admin/audit' },

  // 5 Super Admin screens.
  { id: 'P48_super_admin_accounts', route: '/super-admin/admin-accounts' },
  { id: 'P49_super_invite_admin', route: '/super-admin/admin-accounts/invite' },
  { id: 'P50_super_admin_account', route: '/super-admin/admin-accounts/nadia' },
  { id: 'P51_super_deactivate', route: '/super-admin/admin-accounts/nadia/deactivate' },
  { id: 'P52_super_root_protected', route: '/super-admin/admin-accounts/root' },
]

const supplemental: CaptureCase[] = [
  { id: 'S01_admin_req1042_cancel', route: '/admin/requests/req-1042/cancel' },
  { id: 'S02_admin_sub8834_reassign_picker', route: '/admin/evaluations/sub-8834/reassign' },
  {
    id: 'S03_admin_sub8834_reassign_confirm',
    route: '/admin/evaluations/sub-8834/reassign/confirm',
    prepare: seedSub8834Reassignment,
  },
  { id: 'S04_admin_sub8834_cancel', route: '/admin/evaluations/sub-8834/cancel' },
]

test.use({ viewport: VIEWPORT })

test.describe('Step IV final canonical portal re-close', () => {
  test.beforeAll(() => {
    fs.rmSync(OUT, { recursive: true, force: true })
    fs.mkdirSync(OUT, { recursive: true })
  })

  test('captures all 52 canonical portal screens and 4 v1.9 supplemental lifecycle screens', async ({ page }) => {
    // This single deterministic visual-regression case intentionally performs
    // 56 navigation/render/screenshot cycles. Keep the global Playwright
    // timeout strict for normal tests and raise only this exhaustive capture.
    test.setTimeout(180_000)

    const pageErrors: string[] = []
    page.on('pageerror', (e) => pageErrors.push(e.message))
    page.on('console', (m) => {
      if (m.type() === 'error' && !m.text().includes('favicon.ico') && !m.text().includes('React DevTools')) {
        pageErrors.push(`console: ${m.text()}`)
      }
    })

    await reset(page)

    for (const c of canonical) {
      // Reset state before each capture, then apply only the deterministic state
      // needed by the screen. This catches hidden state coupling.
      await reset(page)
      await capture(page, c)
    }

    for (const c of supplemental) {
      await reset(page)
      await capture(page, c)
    }

    expect(pageErrors, `browser errors during canonical capture:\n${pageErrors.join('\n')}`).toEqual([])

    const pngs = fs.readdirSync(OUT).filter((n) => n.endsWith('.png')).sort()
    expect(pngs.filter((n) => n.startsWith('P')).length).toBe(52)
    expect(pngs.filter((n) => n.startsWith('S')).length).toBe(4)
    expect(pngs.length).toBe(56)
  })

  test('adversarial unknown routes/entities do not fabricate or cross role boundaries', async ({ page }) => {
    await reset(page)

    const cases = [
      ['/admin/requests/req-9999', '/admin/requests'],
      ['/admin/requests/req-9999/assign', '/admin/requests'],
      ['/admin/requests/req-9999/reassign', '/admin/requests'],
      ['/admin/volunteers/unknown-vol', '/admin/volunteers'],
      ['/admin/events/unknown-event', '/admin/events'],
      ['/super-admin/admin-accounts/unknown-admin', '/super-admin/admin-accounts'],
      ['/volunteer/evaluation/sub-9999', '/volunteer/assignments'],
      ['/volunteer/completed/sub-9999', '/volunteer/completed'],
    ] as const

    for (const [route, expected] of cases) {
      await page.goto(route)
      await page.waitForTimeout(120)
      expect(new URL(page.url()).pathname, route).toBe(expected)
    }

    // Root/group routes must resolve safely rather than expose an unintended blank shell.
    for (const route of ['/', '/auth', '/volunteer', '/admin', '/super-admin']) {
      await page.goto(route)
      await page.waitForTimeout(120)
      await expect(page.locator('body')).not.toBeEmpty()
    }
  })
})
