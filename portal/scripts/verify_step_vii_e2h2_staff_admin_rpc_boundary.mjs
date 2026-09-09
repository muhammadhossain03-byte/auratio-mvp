import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const read = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), 'utf8')

const staffAdmin = read('../supabase/functions/staff-admin/index.ts')
const migration = read(
  '../supabase/migrations/20260909161000_step_vii_e2h2_staff_admin_rpc_boundary.sql',
)

for (const needle of [
  'svc_staff_list_admin_accounts',
  'svc_staff_get_admin_account',
  'svc_staff_update_admin_display_name',
]) {
  if (!staffAdmin.includes(`service.rpc(\n        "${needle}"`)) {
    throw new Error(`staff-admin missing RPC boundary: ${needle}`)
  }
  if (!migration.includes(`function public.${needle}`)) {
    throw new Error(`migration missing function: ${needle}`)
  }
  if (!migration.includes(`grant execute on function public.${needle}`)) {
    throw new Error(`migration missing service-role grant: ${needle}`)
  }
}

for (const forbidden of [
  '.from("profiles")',
  '.from("staff_invitations")',
  '.from("audit_log")',
  'isActiveSuperAdmin(',
]) {
  if (staffAdmin.includes(forbidden)) {
    throw new Error(`staff-admin still has forbidden direct table path: ${forbidden}`)
  }
}

for (const forbiddenGrant of [
  'grant select on public.profiles to service_role',
  'grant select on public.staff_invitations to service_role',
  'grant insert on public.audit_log to service_role',
  'grant update on public.profiles to service_role',
]) {
  if (migration.toLowerCase().includes(forbiddenGrant)) {
    throw new Error(`migration widens service-role table grants: ${forbiddenGrant}`)
  }
}

for (const signature of [
  'public.svc_staff_list_admin_accounts(uuid)',
  'public.svc_staff_get_admin_account(uuid,text)',
  'public.svc_staff_update_admin_display_name(uuid,uuid,text)',
]) {
  if (!migration.includes(`revoke execute on function ${signature}`)) {
    throw new Error(`missing authenticated/public revoke for ${signature}`)
  }
}

console.log('Step VII-E2H2 staff Admin RPC boundary: PASS')
