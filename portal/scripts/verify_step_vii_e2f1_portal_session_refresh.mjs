import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const read = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), 'utf8')

const auth = read('src/foundation/integration/auth/portalAuthService.ts')
const boundary = read(
  'src/foundation/integration/auth/PortalRouteAccessBoundary.tsx',
)

const requiredAuth = [
  'isTransientPortalAuthenticationError',
  "error.code === 'profile_load_failed'",
  "error.code === 'session_load_failed'",
  'isTerminalPortalAuthenticationError',
  "error.code === 'profile_missing'",
  "error.code === 'portal_access_denied'",
  'if (isTerminalPortalAuthenticationError(error))',
]

for (const needle of requiredAuth) {
  if (!auth.includes(needle)) {
    throw new Error(`Missing portal auth sentinel: ${needle}`)
  }
}

const requiredBoundary = [
  'subscribeToPortalAuth',
  "window.addEventListener('storage', handleStorage)",
  "event.key.startsWith('sb-')",
  "event.key.endsWith('-auth-token')",
  "window.addEventListener('focus', handleFocus)",
  "document.addEventListener('visibilitychange', handleVisibility)",
  'window.setInterval(requestRefresh, 60_000)',
  'refreshRevision',
  'isTransientPortalAuthenticationError(error)',
]

for (const needle of requiredBoundary) {
  if (!boundary.includes(needle)) {
    throw new Error(`Missing portal refresh sentinel: ${needle}`)
  }
}

for (const forbidden of [
  'SUPABASE_SERVICE_ROLE_KEY',
  'service_role',
  'svc_',
]) {
  if (`${auth}\n${boundary}`.includes(forbidden)) {
    throw new Error(`Forbidden portal client boundary: ${forbidden}`)
  }
}

console.log('Step VII-E2F1 portal session/cross-tab refresh: PASS')
