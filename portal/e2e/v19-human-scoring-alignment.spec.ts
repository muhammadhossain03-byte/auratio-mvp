import fs from 'node:fs'
import path from 'node:path'
import { expect, test } from '@playwright/test'
import {
  assertNoPageErrors,
  registerErrorTracking,
  resetMockState,
} from './helpers/fixtures'

const MOCK_VIDEO_URL =
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'

const captureDir = path.resolve(process.cwd(), 'capture_output')

function canonicalAnchorMap(source: any) {
  const result: Record<string, { Low: string; Competent: string; Excellent: string }> = {}
  const add = (criterion: any) => {
    result[criterion.id] = {
      Low: criterion.anchors.Low,
      Competent: criterion.anchors.Competent,
      Excellent: criterion.anchors.Excellent,
    }
  }

  source.universal_delivery.forEach(add)
  source.structural_flow.forEach(add)
  for (const track of Object.values(source.tracks) as any[]) {
    track.criteria.forEach(add)
  }
  return result
}

async function capture(page: any, name: string) {
  fs.mkdirSync(captureDir, { recursive: true })
  await page.screenshot({
    path: path.join(captureDir, name),
    fullPage: false,
    animations: 'disabled',
  })
}

test.use({ viewport: { width: 1366, height: 900 } })

test.describe('v1.9 Human scoring alignment', () => {
  test.beforeEach(async ({ page }) => {
    registerErrorTracking(page)
    await resetMockState(page)
  })

  test.afterEach(async ({ page }) => {
    assertNoPageErrors(page)
  })

  test('runtime canonical anchor registry exactly matches docs/ai source', async ({ page }) => {
    const sourcePath = path.resolve(
      process.cwd(),
      '..',
      'docs',
      'ai',
      'rubrics-and-anchors-v1.json'
    )
    const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'))
    const expectedAnchors = canonicalAnchorMap(source)

    await page.goto('/volunteer/assignments')

    const runtime = await page.evaluate(() => {
      const win = window as any
      return {
        scoreRanges: win.__CANONICAL_SCORE_RANGES,
        anchors: win.__CANONICAL_CRITERION_ANCHORS,
      }
    })

    expect(Object.keys(expectedAnchors)).toHaveLength(64)
    const descriptionCount = Object.values(expectedAnchors).reduce(
      (count, anchors) => count + Object.keys(anchors).length,
      0
    )
    expect(descriptionCount).toBe(192)

    expect(runtime.scoreRanges).toEqual(source.score_ranges)
    expect(runtime.anchors).toEqual(expectedAnchors)

    expect(runtime.anchors['ud-pacing']).toEqual(source.universal_delivery[0].anchors)
    expect(runtime.anchors['sf-hook']).toEqual(source.structural_flow[0].anchors)
    expect(runtime.anchors['bp-problem']).toEqual(source.tracks['business-pitch'].criteria[0].anchors)
  })

  test('5-point criterion enforces anchor bands, clears incompatible score, and shows canonical prose', async ({
    page,
  }) => {
    await page.goto('/volunteer/evaluation/sub-8821/criterion?criterionId=ud-pacing')

    const score = page.locator('input[aria-label="Exact score"]')
    const alert = page.locator('span[role="alert"]')
    const calibration = page.getByTestId('canonical-anchor-calibration')

    await expect(score).toBeDisabled()
    await expect(calibration).toContainText(
      'Pace is frequently too fast, too slow, or uneven; pauses are poorly placed or absent enough to hinder comprehension or emphasis.'
    )
    await expect(calibration).toContainText(
      'Pace is generally appropriate and understandable, with useful pauses and only occasional rushed, slow, or awkward sections.'
    )
    await expect(calibration).toContainText(
      'Pace is consistently well calibrated to the content and audience; pauses are deliberate, natural, and strengthen clarity and emphasis.'
    )
    await capture(page, 'portal_v19_volunteer_editor_no_anchor.png')

    await page.locator('input[name="anchor"][value="Low"]').click()
    await expect(score).toHaveAttribute('min', '0')
    await expect(score).toHaveAttribute('max', '2')
    await expect(score).toHaveAttribute('placeholder', '0–2')
    await score.fill('5')
    await expect(alert).toContainText('Low requires a score between 0 and 2')
    await score.fill('2')
    await expect(alert).toHaveCount(0)
    await capture(page, 'portal_v19_volunteer_editor_low.png')

    await page.locator('input[name="anchor"][value="Competent"]').click()
    await expect(score).toHaveValue('')
    await expect(score).toHaveAttribute('min', '3')
    await expect(score).toHaveAttribute('max', '4')
    await expect(score).toHaveAttribute('placeholder', '3–4')
    await score.fill('4')
    await capture(page, 'portal_v19_volunteer_editor_competent.png')

    await page.locator('input[name="anchor"][value="Excellent"]').click()
    await expect(score).toHaveValue('')
    await expect(score).toHaveAttribute('min', '5')
    await expect(score).toHaveAttribute('max', '5')
    await expect(score).toHaveAttribute('placeholder', '5')
    await score.fill('4')
    await expect(alert).toContainText('Excellent requires a score of 5')
    await capture(page, 'portal_v19_volunteer_editor_incompatible.png')
    await score.fill('5')
    await expect(alert).toHaveCount(0)
    await capture(page, 'portal_v19_volunteer_editor_excellent.png')

    const dataLayerResult = await page.evaluate(() => {
      const win = window as any
      const before = win.__getVolunteerScoringDraft('SUB-8821').criteria['ud-tone']
      const invalid = win.__saveCriterionScoreData('SUB-8821', 'ud-tone', {
        anchor: 'Excellent',
        exactScore: 4,
      })
      const after = win.__getVolunteerScoringDraft('SUB-8821').criteria['ud-tone']
      return {
        invalidWasRejected: invalid === null,
        beforeScore: before.exactScore,
        afterScore: after.exactScore,
      }
    })
    expect(dataLayerResult.invalidWasRejected).toBe(true)
    expect(dataLayerResult.beforeScore).toBeNull()
    expect(dataLayerResult.afterScore).toBeNull()
  })

  test('10-point track criterion enforces 0-4 / 5-8 / 9-10 and renders exact track anchor prose', async ({
    page,
  }) => {
    await page.goto('/volunteer/evaluation/sub-8821/criterion?criterionId=bp-problem')

    const score = page.locator('input[aria-label="Exact score"]')
    const alert = page.locator('span[role="alert"]')
    const calibration = page.getByTestId('canonical-anchor-calibration')

    const sourcePath = path.resolve(
      process.cwd(),
      '..',
      'docs',
      'ai',
      'rubrics-and-anchors-v1.json'
    )
    const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'))
    const bpProblem = source.tracks['business-pitch'].criteria.find(
      (criterion: any) => criterion.id === 'bp-problem'
    )
    expect(bpProblem).toBeTruthy()

    await expect(calibration).toContainText(bpProblem.anchors.Low)
    await expect(calibration).toContainText(bpProblem.anchors.Competent)
    await expect(calibration).toContainText(bpProblem.anchors.Excellent)

    await page.locator('input[name="anchor"][value="Low"]').click()
    await expect(score).toHaveAttribute('placeholder', '0–4')
    await score.fill('4')

    await page.locator('input[name="anchor"][value="Competent"]').click()
    await expect(score).toHaveValue('')
    await expect(score).toHaveAttribute('placeholder', '5–8')
    await score.fill('8')

    await page.locator('input[name="anchor"][value="Excellent"]').click()
    await expect(score).toHaveValue('')
    await expect(score).toHaveAttribute('placeholder', '9–10')
    await score.fill('8')
    await expect(alert).toContainText('Excellent requires a score between 9 and 10')
    await score.fill('10')
    await expect(alert).toHaveCount(0)

    await capture(page, 'portal_v19_volunteer_editor_10pt_valid.png')
  })

  test('structural criterion displays the exact shared canonical anchors', async ({ page }) => {
    await page.goto('/volunteer/evaluation/sub-8821/criterion?criterionId=sf-hook')
    const calibration = page.getByTestId('canonical-anchor-calibration')

    await expect(calibration).toContainText(
      'Opening is weak, unclear, delayed, or disconnected from the purpose, giving little reason to attend to the message.'
    )
    await expect(calibration).toContainText(
      'Opening establishes relevance or interest and leads into the topic, though it may be conventional or only moderately compelling.'
    )
    await expect(calibration).toContainText(
      'Opening captures attention quickly, establishes relevance, and creates a strong, natural bridge into the central message.'
    )
  })

  test('workspace and criterion editor expose native video controls without requiring network playback', async ({
    page,
  }) => {
    await page.goto('/volunteer/evaluation/sub-8821')
    let video = page.getByTestId('volunteer-evaluation-video')
    await expect(video).toHaveCount(1)
    expect(await video.evaluate((element: HTMLVideoElement) => element.controls)).toBe(true)
    expect(await video.evaluate((element: HTMLVideoElement) => element.playsInline)).toBe(true)
    expect(await video.evaluate((element: HTMLVideoElement) => element.preload)).toBe('metadata')
    await expect(video).toHaveAttribute('data-media-kind', 'step-iv-mock')
    await expect(video).toHaveAttribute('src', MOCK_VIDEO_URL)
    await capture(page, 'portal_v19_volunteer_workspace_video.png')

    await page.goto('/volunteer/evaluation/sub-8821/criterion?criterionId=ud-pacing')
    video = page.getByTestId('volunteer-evaluation-video')
    await expect(video).toHaveCount(1)
    expect(await video.evaluate((element: HTMLVideoElement) => element.controls)).toBe(true)
    expect(await video.evaluate((element: HTMLVideoElement) => element.playsInline)).toBe(true)
    await expect(video).toHaveAttribute('src', MOCK_VIDEO_URL)
  })
})
