import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8')
}

function requireText(source, needle, label) {
  if (!source.includes(needle)) {
    throw new Error(`VII-C2C2 verification failed: ${label}`)
  }
}

function forbidText(source, needle, label) {
  if (source.includes(needle)) {
    throw new Error(`VII-C2C2 verification failed: ${label}`)
  }
}

const adminService = read('src/features/admin/integration/persistedAdminCompletion.ts')
requireText(adminService, ".from('evaluation_requests')", 'Admin completion reads must use persisted requests')
requireText(adminService, ".from('evaluation_versions')", 'Admin completion reads must use persisted versions')
requireText(adminService, ".from('human_assignments')", 'Admin completion reads must resolve ownership')
requireText(adminService, ".functions.invoke('human-admin'", 'Admin moderation mutations must use human-admin Edge Function')
requireText(adminService, "action: 'approve'", 'persisted approve action is missing')
requireText(adminService, "action: 'reject'", 'persisted reject action is missing')
requireText(adminService, "action: 'reopen'", 'persisted re-review action is missing')
requireText(adminService, 'reassignPersistedAdminHumanRequest', 'post-submission reassignment must use accepted server-authoritative path')
forbidText(adminService, '.rpc(', 'Admin client must not call svc RPCs directly')
forbidText(adminService, 'svc_', 'service RPC names must remain behind Edge Functions')
forbidText(adminService, 'mockAdminData', 'persisted Admin completion must not use mock state')
forbidText(adminService, 'sessionStorage', 'persisted Admin completion must not use sessionStorage')
forbidText(adminService, 'localStorage', 'persisted Admin completion must not use localStorage')

const volunteerHistory = read('src/features/volunteer/integration/persistedVolunteerHistory.ts')
requireText(volunteerHistory, ".from('human_assignments')", 'Volunteer history must use persisted completed assignments')
requireText(volunteerHistory, ".eq('status', 'completed')", 'Volunteer history must select completed ownership')
requireText(volunteerHistory, ".from('evaluation_versions')", 'Volunteer history must resolve exact evaluator versions')
requireText(volunteerHistory, "if (status === 'reopened') return 'Re-review Requested'", 'Volunteer history must preserve re-review history')
forbidText(volunteerHistory, 'requested_mode', 'Volunteer must not receive original AI provenance')
forbidText(volunteerHistory, 'audit_log', 'Volunteer must not receive Admin audit context')
forbidText(volunteerHistory, 'evaluation_admin_actions', 'Volunteer must not receive Admin reasons')
forbidText(volunteerHistory, 'mockVolunteerData', 'persisted Volunteer history must not use mock state')

for (const file of [
  'src/features/admin/pages/PersistedAdminOperationsDashboardPage.tsx',
  'src/features/admin/pages/PersistedAdminEvaluationRecordsPage.tsx',
  'src/features/admin/pages/PersistedAdminModerationQueuePage.tsx',
  'src/features/admin/pages/PersistedAdminModerationReviewPage.tsx',
  'src/features/volunteer/pages/PersistedVolunteerCompletedHistoryPage.tsx',
  'src/features/volunteer/pages/PersistedVolunteerCompletedDetailPage.tsx',
  'src/features/volunteer/pages/PersistedVolunteerReopenedEvaluationRoutePage.tsx',
]) {
  const source = read(file)
  forbidText(source, 'SUB-8821', `${file} must not hard-code SUB-8821`)
  forbidText(source, 'REQ-1042', `${file} must not hard-code REQ-1042`)
  forbidText(source, 'mockAdminData', `${file} must not use mock Admin state`)
  forbidText(source, 'mockVolunteerData', `${file} must not use mock Volunteer state`)
}

const adminBoundary = read('src/features/admin/pages/AdminPersistedCompletionRouteBoundaries.tsx')
requireText(adminBoundary, "portalSupabaseRuntimeMode() === 'configured'", 'Admin configured boundary is missing')
requireText(adminBoundary, 'PersistedAdminModerationReviewPage', 'persisted moderation review boundary is missing')

const volunteerBoundary = read('src/features/volunteer/pages/VolunteerPersistedHistoryRouteBoundaries.tsx')
requireText(volunteerBoundary, "portalSupabaseRuntimeMode() === 'configured'", 'Volunteer configured history boundary is missing')
requireText(volunteerBoundary, 'PersistedVolunteerCompletedHistoryPage', 'persisted Volunteer history boundary is missing')
requireText(volunteerBoundary, 'PersistedVolunteerReopenedEvaluationRoutePage', 'configured re-review resolver is missing')

const scoring = read('src/features/volunteer/pages/PersistedVolunteerScoringPendingPage.tsx')
requireText(scoring, 'returnPersistedVolunteerAssignment', 'Volunteer Return action is missing')
requireText(scoring, 'Return Assignment', 'Volunteer Return UI is missing')

const router = read('src/app/routes/router.tsx')
requireText(router, 'AdminOperationsDashboardBoundary', 'configured Admin dashboard boundary is missing')
requireText(router, 'AdminEvaluationRecordsBoundary', 'configured evaluation records boundary is missing')
requireText(router, 'AdminModerationQueueBoundary', 'configured moderation queue boundary is missing')
requireText(router, 'AdminModerationReviewBoundary', 'configured moderation review boundary is missing')
requireText(router, 'AdminModerationLegacyActionBoundary', 'legacy moderation mock guard is missing')
requireText(router, 'VolunteerCompletedHistoryBoundary', 'configured Volunteer history boundary is missing')
requireText(router, 'VolunteerCompletedDetailBoundary', 'configured Volunteer detail boundary is missing')
requireText(router, "path: '/volunteer/completed/:submissionId/version/:versionId'", 'exact completed version route is missing')
requireText(router, 'VolunteerReopenedEvaluationBoundary', 'configured reopened route boundary is missing')
forbidText(router, 'element: <AdminEvaluationProcessingHumanPage />', 'configured router must guard SUB-8834 evaluation fixture')
forbidText(router, 'element: <AdminEvaluationApprovedAiPage />', 'configured router must guard AI evaluation fixture until VII-D')

console.log('Step VII-C2C2 persisted moderation/history/SUB-8821 coherence verification PASS')
