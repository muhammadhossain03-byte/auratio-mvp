import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8')

const checks = [
  ['../supabase/migrations/20260909095000_step_vii_e_staff_invitation_email_acceptance.sql',
    ['create table public.volunteer_track_eligibility', 'svc_staff_create_invitation_v2',
     'svc_staff_accept_invitation', 'human_assignments_track_eligibility']],
  ['../supabase/functions/staff-admin/index.ts',
    ['service.auth.signInWithOtp', 'shouldCreateUser: true',
     'emailRedirectTo: redirect.toString()', 'email_sent: true']],
  ['src/foundation/integration/auth/staffInvitationService.ts',
    ["client.functions.invoke('staff-admin'", "'staff-accept-invitation'",
     'client.auth.updateUser({ password })']],
  ['src/features/auth/pages/PortalStaffInvitationPage.tsx',
    ['acceptStaffInvitation(token)', 'setAcceptedStaffPassword(nextPassword)', 'Finish Activation']],
  ['src/features/admin/pages/AdminInviteVolunteerPage.tsx',
    ["targetRole: 'volunteer'", 'trackIds', 'createStaffInvitation']],
  ['src/features/superAdmin/pages/SuperAdminInviteAdminPage.tsx',
    ["targetRole: 'admin'", 'createStaffInvitation']],
  ['src/features/admin/integration/persistedAdminHumanLifecycle.ts',
    ["from('volunteer_track_eligibility')", "eq('track_id', request.trackId)"]],
]

for (const [file, needles] of checks) {
  const source = read(file)
  for (const needle of needles) {
    if (!source.includes(needle)) throw new Error(`Missing ${JSON.stringify(needle)} in ${file}`)
  }
}

const clientSources = [
  'src/foundation/integration/auth/staffInvitationService.ts',
  'src/features/auth/pages/PortalStaffInvitationPage.tsx',
  'src/features/admin/pages/AdminInviteVolunteerPage.tsx',
  'src/features/superAdmin/pages/SuperAdminInviteAdminPage.tsx',
  'src/features/admin/integration/persistedAdminHumanLifecycle.ts',
].map(read).join('\n')

for (const forbidden of ['SUPABASE_SERVICE_ROLE_KEY', 'service_role', 'svc_']) {
  if (clientSources.includes(forbidden)) throw new Error(`Forbidden privileged client boundary: ${forbidden}`)
}

console.log('Step VII-E2E staff invitation/email acceptance contract verified.')
