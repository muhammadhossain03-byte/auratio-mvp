import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8')
}

function requireText(source, needle, label) {
  if (!source.includes(needle)) {
    throw new Error(`VII-C2C1 verification failed: ${label}`)
  }
}

function forbidText(source, needle, label) {
  if (source.includes(needle)) {
    throw new Error(`VII-C2C1 verification failed: ${label}`)
  }
}

const service = read('src/features/admin/integration/persistedAdminHumanLifecycle.ts')
requireText(service, ".from('evaluation_requests')", 'Admin queue must read persisted requests')
requireText(service, 'requested_mode', 'Admin must preserve originally requested evaluation method')
requireText(service, ".eq('mode', 'human')", 'Admin Human queue must use effective Human routing')
requireText(service, ".from('human_assignments')", 'Admin must read persisted active ownership')
requireText(service, ".from('evaluation_versions')", 'Admin detail must resolve persisted evaluator version')
requireText(service, ".from('profiles')", 'Admin must resolve users and active Volunteers')
requireText(service, ".functions.invoke('human-admin'", 'privileged Admin mutations must use human-admin Edge Function')
requireText(service, "action: 'assign'", 'assign mutation is missing')
requireText(service, "action: 'reassign'", 'reassign mutation is missing')
requireText(service, "action: 'cancel'", 'cancel mutation is missing')
requireText(service, 'more than one active Volunteer owner', 'active-owner coherence assertion is missing')
forbidText(service, '.rpc(', 'Admin client must not call service RPCs directly')
forbidText(service, 'svc_', 'service RPC names must remain behind Edge Functions')
forbidText(service, '.update(', 'Admin client must not mutate evaluation_requests directly')
forbidText(service, 'sessionStorage', 'persisted Admin lifecycle must not use sessionStorage')
forbidText(service, 'localStorage', 'persisted Admin lifecycle must not use localStorage')
forbidText(service, 'mockAdminData', 'persisted Admin lifecycle must not depend on mock state')

for (const file of [
  'src/features/admin/pages/PersistedAdminEvaluationRequestQueuePage.tsx',
  'src/features/admin/pages/PersistedAdminHumanRequestPage.tsx',
]) {
  const source = read(file)
  forbidText(source, 'REQ-1042', `${file} must not hard-code prototype request fixtures`)
  forbidText(source, 'SUB-8821', `${file} must not hard-code SUB-8821`)
  forbidText(source, 'mockAdminData', `${file} must not use mock Admin lifecycle state`)
}

const boundary = read('src/features/admin/pages/AdminPersistedHumanRouteBoundaries.tsx')
requireText(boundary, "portalSupabaseRuntimeMode() === 'configured'", 'configured runtime boundary is missing')
requireText(boundary, 'PersistedAdminEvaluationRequestQueuePage', 'persisted queue boundary is missing')
requireText(boundary, 'PersistedAdminHumanRequestPage', 'persisted request detail boundary is missing')
requireText(boundary, 'AdminPrototypeFixtureBoundary', 'configured mock-fixture guard is missing')

const router = read('src/app/routes/router.tsx')
requireText(router, 'AdminEvaluationRequestQueueBoundary', 'router must use persisted queue boundary')
requireText(router, 'AdminHumanRequestRouteBoundary', 'router must expose dynamic persisted request route')
requireText(router, "path: '/admin/requests/:requestId'", 'dynamic Admin request route is missing')
requireText(router, 'AdminPrototypeFixtureBoundary', 'prototype request fixture guard must be wired')
forbidText(
  router,
  "path: '/admin/requests/:requestId',\n    element: <Navigate to={portalRoutePaths.admin.requests} replace />",
  'dynamic Admin request route must not redirect configured runtime back to the mock queue',
)

console.log('Step VII-C2C1 persisted Admin/Super Admin request lifecycle verification PASS')
