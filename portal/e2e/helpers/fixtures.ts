import { test as baseTest, expect, type Page } from '@playwright/test'
import * as fs from 'node:fs'
import * as path from 'node:path'

export const EVIDENCE_DIR = path.resolve('capture_output', 'playwright')

export async function captureEvidenceScreenshot(page: Page, filename: string): Promise<string> {
  if (!fs.existsSync(EVIDENCE_DIR)) {
    fs.mkdirSync(EVIDENCE_DIR, { recursive: true })
  }
  const filePath = path.join(EVIDENCE_DIR, filename)
  await page.screenshot({ path: filePath, fullPage: true })
  return filePath
}

export async function resetMockState(page: Page): Promise<void> {
  await page.evaluate(() => {
    try {
      window.sessionStorage?.clear()
      window.localStorage?.clear()
    } catch {}

    const win = window as unknown as Record<string, unknown>

    if (typeof win.__resetHE0142Reassignment === 'function') win.__resetHE0142Reassignment()
    if (typeof win.__resetSub8821Moderation === 'function') win.__resetSub8821Moderation()
    if (typeof win.__resetFarhanaAvailabilityOverride === 'function') win.__resetFarhanaAvailabilityOverride()
    if (typeof win.__resetFarhanaTrackEligibility === 'function') win.__resetFarhanaTrackEligibility()
    if (typeof win.__resetInviteVolunteerTrackDraft === 'function') win.__resetInviteVolunteerTrackDraft()
    if (typeof win.__resetAdminVolunteers === 'function') win.__resetAdminVolunteers()
    if (typeof win.__resetAdminEvents === 'function') win.__resetAdminEvents()
    if (typeof win.__resetAllModeration === 'function') win.__resetAllModeration()
    if (typeof win.__resetVolunteerTrackEligibility === 'function') {
      ;(win.__resetVolunteerTrackEligibility as (id: string) => void)('farhana')
      ;(win.__resetVolunteerTrackEligibility as (id: string) => void)('rakib')
      ;(win.__resetVolunteerTrackEligibility as (id: string) => void)('mehnaz')
    }
    if (typeof win.__resetVolunteerAvailabilityOverride === 'function') {
      ;(win.__resetVolunteerAvailabilityOverride as (id: string) => void)('farhana')
      ;(win.__resetVolunteerAvailabilityOverride as (id: string) => void)('rakib')
      ;(win.__resetVolunteerAvailabilityOverride as (id: string) => void)('mehnaz')
    }
    if (typeof win.__auratioResetSuperAdmin === 'function') win.__auratioResetSuperAdmin()
  })
}

const pageErrorsMap = new WeakMap<Page, Error[]>()

export function registerErrorTracking(page: Page): void {
  const errors: Error[] = []
  pageErrorsMap.set(page, errors)

  page.on('pageerror', (err) => {
    errors.push(err)
  })

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text()
      if (!text.includes('React DevTools') && !text.includes('favicon.ico')) {
        // Collect console error as tracked error
        errors.push(new Error(`Browser console error: ${text}`))
      }
    }
  })
}

export function assertNoPageErrors(page: Page): void {
  const errors = pageErrorsMap.get(page) || []
  if (errors.length > 0) {
    throw new Error(`Uncaught browser error(s) during test execution:\n${errors.map((e) => e.message).join('\n')}`)
  }
}

export const test = baseTest

export { expect }
