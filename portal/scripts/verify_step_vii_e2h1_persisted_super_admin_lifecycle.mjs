import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const read = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), 'utf8')

const staffAdmin = read('../supabase/functions/staff-admin/index.ts')
const service = read(
  'src/features/superAdmin/integration/persistedSuperAdminLifecycleService.ts',
)
const configured = read(
  'src/features/superAdmin/pages/PersistedSuperAdminAccountPages.tsx',
)
const accounts = read('src/features/superAdmin/pages/SuperAdminAccountsPage.tsx')
const account = read('src/features/superAdmin/pages/SuperAdminAccountPage.tsx')
const confirm = read(
  'src/features/superAdmin/pages/SuperAdminConfirmDeactivationPage.tsx',
)
const rootPage = read(
  'src/features/superAdmin/pages/SuperAdminProtectedRootPage.tsx',
)

for (const needle of [
  'list_admin_accounts',
  'get_admin_account',
  'update_admin_display_name',
  'service.auth.admin.listUsers',
  'is_root_super_admin',
]) {
  if (!staffAdmin.includes(needle)) {
    throw new Error(`Missing staff-admin persistence sentinel: ${needle}`)
  }
}

for (const needle of [
  "client.functions.invoke('staff-admin'",
  "action: 'list_admin_accounts'",
  "action: 'get_admin_account'",
  "action: 'update_admin_display_name'",
  "action: 'set_account_status'",
  "action: 'revoke_invitation'",
]) {
  if (!service.includes(needle)) {
    throw new Error(`Missing persisted Super Admin service sentinel: ${needle}`)
  }
}

for (const needle of [
  'ConfiguredSuperAdminAccountsPage',
  'ConfiguredSuperAdminAccountPage',
  'ConfiguredSuperAdminConfirmDeactivationPage',
  'ConfiguredSuperAdminProtectedRootPage',
  'persisted-admin-accounts-empty',
  'persisted-root-account-missing',
]) {
  if (!configured.includes(needle)) {
    throw new Error(`Missing configured Super Admin page sentinel: ${needle}`)
  }
}

for (const [name, source] of [
  ['accounts', accounts],
  ['account', account],
  ['confirm', confirm],
  ['root', rootPage],
]) {
  if (!source.includes('portalSupabaseRuntimeMode()')) {
    throw new Error(`Missing configured/prototype runtime split: ${name}`)
  }
  if (!source.includes("'configured'")) {
    throw new Error(`Missing configured branch: ${name}`)
  }
  if (!source.includes("'prototype'")) {
    throw new Error(`Missing prototype branch: ${name}`)
  }
}

const client = `${service}\n${configured}\n${accounts}\n${account}\n${confirm}\n${rootPage}`
for (const forbidden of ['SUPABASE_SERVICE_ROLE_KEY', 'service_role', 'svc_']) {
  if (client.includes(forbidden)) {
    throw new Error(`Forbidden client privilege boundary: ${forbidden}`)
  }
}

console.log('Step VII-E2H1 persisted Super Admin lifecycle: PASS')
