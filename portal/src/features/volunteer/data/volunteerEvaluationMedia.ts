/**
 * Step-IV frontend-only evaluation media.
 *
 * Production integration will replace this deterministic mock URL with the
 * original submission's authorized Supabase-backed video source.
 */
export const STEP_IV_MOCK_EVALUATION_VIDEO_URL =
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'

export interface VolunteerEvaluationVideoSource {
  src: string
  sourceKind: 'step-iv-mock'
}

export function getVolunteerEvaluationVideoSource(
  submissionId: string
): VolunteerEvaluationVideoSource | null {
  if (!submissionId || submissionId.trim().length === 0) return null

  return {
    src: STEP_IV_MOCK_EVALUATION_VIDEO_URL,
    sourceKind: 'step-iv-mock',
  }
}
