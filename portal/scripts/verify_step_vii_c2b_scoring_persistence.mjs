import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8')
}

function requireText(source, needle, label) {
  if (!source.includes(needle)) {
    throw new Error(`VII-C2B verification failed: ${label}`)
  }
}

function forbidText(source, needle, label) {
  if (source.includes(needle)) {
    throw new Error(`VII-C2B verification failed: ${label}`)
  }
}

const service = read('src/features/volunteer/integration/persistedVolunteerScoring.ts')
requireText(service, ".from('evaluation_criterion_results')", 'criterion persistence read is missing')
requireText(service, ".from('evaluation_versions')", 'evaluator version persistence read is missing')
requireText(service, ".from('submission_videos')", 'private video metadata read is missing')
requireText(service, '.createSignedUrl(', 'private video must use temporary signed URL')
requireText(service, "lifecycleStatus !== 'retained'", 'configured video must use canonical retained lifecycle state')
forbidText(service, "lifecycleStatus !== 'active'", 'non-canonical active video lifecycle state must not be used')
forbidText(service, "pending_deletion", 'non-canonical pending_deletion video lifecycle state must not be used')
requireText(service, ".functions.invoke('human-volunteer'", 'privileged scoring mutations must use human-volunteer')
requireText(service, "action: 'save_criterion'", 'save_criterion mutation is missing')
requireText(service, "action: 'save_summary'", 'save_summary mutation is missing')
requireText(service, "action: 'submit'", 'submit mutation is missing')
requireText(service, 'isAnchorScoreCompatible', 'anchor-band validation is missing')
forbidText(service, 'requested_mode', 'Volunteer scoring must not expose AI provenance')
forbidText(service, 'sessionStorage', 'persisted scoring must not use sessionStorage')
forbidText(service, 'localStorage', 'persisted scoring must not use localStorage')
forbidText(service, '.rpc(', 'client must not call svc RPCs directly')
forbidText(service, 'svc_', 'service RPC names must remain behind Edge Function')
forbidText(service, 'STEP_IV_MOCK_EVALUATION_VIDEO_URL', 'configured scoring must not use mock video')

const persistedVideo = read('src/features/volunteer/components/PersistedVolunteerVideoPlayer.tsx')
requireText(persistedVideo, "top: '124px'", 'persisted video panel must have an explicit workspace position')

const configuredWrappers = [
  ['src/features/volunteer/pages/VolunteerCriterionFeedbackEditorPage.tsx', 'PersistedVolunteerCriterionFeedbackEditorPage'],
  ['src/features/volunteer/pages/VolunteerFinalSubmissionPage.tsx', 'PersistedVolunteerFinalSubmissionPage'],
  ['src/features/volunteer/pages/VolunteerEvaluationSubmittedPage.tsx', 'PersistedVolunteerEvaluationSubmittedPage'],
]

for (const [file, component] of configuredWrappers) {
  const source = read(file)
  requireText(source, "portalSupabaseRuntimeMode() === 'configured'", `${file} must choose persisted runtime`)
  requireText(source, component, `${file} must delegate to ${component}`)
}

for (const file of [
  'src/features/volunteer/pages/PersistedVolunteerScoringPendingPage.tsx',
  'src/features/volunteer/pages/PersistedVolunteerCriterionFeedbackEditorPage.tsx',
  'src/features/volunteer/pages/PersistedVolunteerFinalSubmissionPage.tsx',
  'src/features/volunteer/pages/PersistedVolunteerEvaluationSubmittedPage.tsx',
  'src/features/volunteer/components/PersistedVolunteerVideoPlayer.tsx',
]) {
  const source = read(file)
  forbidText(source, 'SUB-8821', `${file} must not hard-code SUB-8821`)
  forbidText(source, 'mockVolunteerData', `${file} must not read mock lifecycle/scoring state`)
  forbidText(source, 'VolunteerEvaluationVideoPlayer', `${file} must not use prototype video player`)
}

console.log('Step VII-C2B persisted scoring/submission/private-video boundary verification PASS')
