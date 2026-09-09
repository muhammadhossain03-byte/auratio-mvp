import fs from 'node:fs'

const path =
  '../supabase/migrations/20260909133500_step_vii_e2g1_test_backend_hardening.sql'
const source = fs.readFileSync(path, 'utf8')

const required = [
  'alter table private.ai_evaluation_attempts enable row level security;',
  'alter table private.ai_provider_jobs enable row level security;',
  'alter table private.report_generation_claims enable row level security;',
  'revoke all privileges on table private.ai_evaluation_attempts from anon, authenticated;',
  'revoke all privileges on table private.ai_provider_jobs from anon, authenticated;',
  'revoke all privileges on table private.report_generation_claims from anon, authenticated;',
  'staff_invitation_tracks_no_client_access',
  'using (false)',
  'with check (false)',
  'volunteer_user_id = (select auth.uid())',
  'actor.user_id = (select auth.uid())',
  'staff_invitation_tracks_track_idx',
  'volunteer_track_eligibility_granted_by_idx',
]

for (const needle of required) {
  if (!source.includes(needle)) {
    throw new Error(`Missing E2G1 hardening sentinel: ${needle}`)
  }
}

const forbidden = [
  'grant all',
  'grant execute',
  'to anon;',
  'to authenticated;',
]

for (const needle of forbidden) {
  if (source.toLowerCase().includes(needle)) {
    throw new Error(`Unexpected E2G1 privilege widening: ${needle}`)
  }
}

console.log('Step VII-E2G1 test-backend hardening contract: PASS')
