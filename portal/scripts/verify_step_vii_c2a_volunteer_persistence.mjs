import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8')
}

function requireText(source, needle, label) {
  if (!source.includes(needle)) {
    throw new Error(`VII-C2A verification failed: ${label}`)
  }
}

function forbidText(source, needle, label) {
  if (source.includes(needle)) {
    throw new Error(`VII-C2A verification failed: ${label}`)
  }
}

const service = read('src/features/volunteer/integration/persistedVolunteerLifecycle.ts')
requireText(service, ".from('human_assignments')", 'persisted assignments must read human_assignments')
requireText(service, ".functions.invoke('human-volunteer'", 'privileged Volunteer mutations must use human-volunteer Edge Function')
requireText(service, "action: 'accept'", 'accept mutation is missing')
requireText(service, "action: 'begin'", 'begin mutation is missing')
requireText(service, "action: 'decline'", 'decline mutation is missing')
requireText(service, "action: 'return'", 'return mutation is missing')
requireText(service, "effectiveMode !== 'human'", 'Volunteer read model must reject non-Human effective routing')
requireText(service, 'assertRequestCoherence', 'request/assignment coherence guard is missing')
forbidText(service, 'requested_mode', 'Volunteer persisted read model must not expose AI-request provenance')
forbidText(service, 'sessionStorage', 'persisted service must not use sessionStorage')
forbidText(service, 'localStorage', 'persisted service must not use localStorage')
forbidText(service, '.rpc(', 'privileged mutations must not call service RPCs directly from the client')
forbidText(service, 'svc_', 'service RPC names must remain behind Edge Functions')

const wrappers = [
  ['src/features/volunteer/pages/VolunteerActiveAssignmentsPage.tsx', 'PersistedVolunteerActiveAssignmentsPage'],
  ['src/features/volunteer/pages/VolunteerAssignedTaskPage.tsx', 'PersistedVolunteerAssignedTaskPage'],
  ['src/features/volunteer/pages/VolunteerDeclineAssignmentPage.tsx', 'PersistedVolunteerDeclineAssignmentPage'],
  ['src/features/volunteer/pages/VolunteerActiveAssignmentsAfterDeclinePage.tsx', 'PersistedVolunteerAfterDeclinePage'],
  ['src/features/volunteer/pages/VolunteerScoringWorkspacePage.tsx', 'PersistedVolunteerScoringPendingPage'],
]

for (const [file, component] of wrappers) {
  const source = read(file)
  requireText(source, "portalSupabaseRuntimeMode() === 'configured'", `${file} must choose persisted runtime when configured`)
  requireText(source, component, `${file} must delegate to ${component}`)
}

for (const file of [
  'src/features/volunteer/pages/PersistedVolunteerActiveAssignmentsPage.tsx',
  'src/features/volunteer/pages/PersistedVolunteerAssignedTaskPage.tsx',
  'src/features/volunteer/pages/PersistedVolunteerDeclineAssignmentPage.tsx',
  'src/features/volunteer/pages/PersistedVolunteerAfterDeclinePage.tsx',
  'src/features/volunteer/pages/PersistedVolunteerScoringPendingPage.tsx',
]) {
  const source = read(file)
  forbidText(source, 'SUB-8821', `${file} must not hard-code the SUB-8821 mock fixture`)
  forbidText(source, 'mockVolunteerData', `${file} must not read mock Volunteer lifecycle state`)
}

console.log('Step VII-C2A persisted Volunteer ownership boundary verification PASS')
