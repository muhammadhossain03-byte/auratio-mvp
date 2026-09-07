import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const read = (path) => readFileSync(resolve(root, path), 'utf8')

const runtimeConfig = read('src/foundation/integration/supabaseConfig.ts')
const access = read('src/foundation/integration/auth/portalAccess.ts')
const boundary = read(
  'src/foundation/integration/auth/PortalRouteAccessBoundary.tsx',
)
const signIn = read('src/features/auth/pages/PortalSignInPage.tsx')
const roleAuthorization = read(
  'src/features/auth/pages/PortalRoleAuthorizationPage.tsx',
)
const router = read('src/app/routes/router.tsx')

const combined = [
  runtimeConfig,
  access,
  boundary,
  signIn,
  roleAuthorization,
  router,
].join('\n')

for (const required of [
  'isLoopbackRuntime',
  "import.meta.env.DEV || isLoopbackRuntime() ? 'prototype' : 'unavailable'",
  "runtimeMode === 'unavailable'",
  'isProtectedPortalPath',
  'currentPortalSession',
  'canProfileAccessPortalPath',
  'signInPortal',
  'portalLandingPath',
  '<PortalRouteAccessBoundary />',
]) {
  if (!combined.includes(required)) {
    throw new Error(`Step VII-A2 portal auth routing is missing: ${required}`)
  }
}

if (!boundary.includes('to="/auth/access-unavailable"')) {
  throw new Error('Production-misconfiguration path must fail closed')
}

if (!signIn.includes("runtimeMode === 'prototype'")) {
  throw new Error('Prototype sign-in fallback must be explicit')
}

if (!runtimeConfig.includes("window.location.hostname === '127.0.0.1'")) {
  throw new Error('Local static regression harness must be loopback-only')
}

for (const forbidden of ['SUPABASE_SERVICE_ROLE_KEY', 'GEMINI_API_KEY', 'sb_secret_']) {
  if (combined.includes(forbidden)) {
    throw new Error(`Forbidden privileged secret marker found: ${forbidden}`)
  }
}

console.log('Step VII-A2 portal persisted Auth/role routing: PASS')
