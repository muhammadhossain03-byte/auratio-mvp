import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const service = fs.readFileSync(
  path.join(root, 'src/features/superAdmin/integration/persistedSuperAdminLifecycleService.ts'),
  'utf8',
)
const page = fs.readFileSync(
  path.join(root, 'src/features/superAdmin/pages/PersistedSuperAdminAccountPages.tsx'),
  'utf8',
)

function requirePattern(source, label, pattern) {
  if (!pattern.test(source)) {
    throw new Error(`Missing E2H4 reactivation sentinel: ${label}`)
  }
}

requirePattern(service, 'reactivation service export', /export\s+async\s+function\s+reactivatePersistedAdminAccount\s*\(/)
requirePattern(service, 'service uses set_account_status', /action:\s*["']set_account_status["']/)
requirePattern(service, 'service sends active state', /status:\s*["']active["']/)
requirePattern(service, 'service prevents invitation reactivation', /account\.kind\s*!==\s*["']profile["']/)

requirePattern(page, 'reactivation service import', /reactivatePersistedAdminAccount/)
requirePattern(page, 'reactivating state', /const\s+\[reactivating,\s*setReactivating\]\s*=\s*useState\(false\)/)
requirePattern(page, 'reactivation handler', /async\s+function\s+handleReactivate\s*\(/)
requirePattern(page, 'handler restricts deactivated profiles', /currentAccount\.status\s*!==\s*["']Deactivated["']/)
requirePattern(page, 'handler calls service', /await\s+reactivatePersistedAdminAccount\(currentAccount\)/)
requirePattern(page, 'Reactivate control', /data-testid=["']persisted-admin-reactivate["']/)
requirePattern(page, 'Reactivate button label', /Reactivate/)
requirePattern(page, 'deactivation flow preserved', /\/deactivate/)
requirePattern(page, 'pending invitation revoke preserved', /Revoke Invite…/)

console.log('Step VII-E2H4 Admin reactivation lifecycle: PASS')
