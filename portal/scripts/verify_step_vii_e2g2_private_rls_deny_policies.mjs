import fs from 'node:fs'

const path =
  '../supabase/migrations/20260909134500_step_vii_e2g2_private_rls_deny_policies.sql'
const source = fs.readFileSync(path, 'utf8')

const required = [
  'ai_evaluation_attempts_no_client_access',
  'ai_provider_jobs_no_client_access',
  'report_generation_claims_no_client_access',
  'to anon, authenticated',
  'using (false)',
  'with check (false)',
]

for (const needle of required) {
  if (!source.includes(needle)) {
    throw new Error(`Missing E2G2 private-RLS sentinel: ${needle}`)
  }
}

for (const forbidden of [
  'grant all',
  'grant execute',
  'to service_role',
  'alter table',
]) {
  if (source.toLowerCase().includes(forbidden)) {
    throw new Error(`Unexpected E2G2 scope widening: ${forbidden}`)
  }
}

console.log('Step VII-E2G2 private RLS deny-policy contract: PASS')
