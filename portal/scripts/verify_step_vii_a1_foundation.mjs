import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const packageJson = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))

if (packageJson.dependencies?.['@supabase/supabase-js'] !== '2.115.0') {
  throw new Error('Step VII-A1 requires @supabase/supabase-js 2.115.0 exactly')
}

const requiredFiles = [
  '.env.example',
  'src/foundation/integration/supabaseConfig.ts',
  'src/foundation/integration/supabaseClient.ts',
  'src/foundation/integration/auth/portalAccess.ts',
  'src/foundation/integration/auth/portalAuthService.ts',
]

for (const path of requiredFiles) {
  readFileSync(resolve(root, path), 'utf8')
}

const envExample = readFileSync(resolve(root, '.env.example'), 'utf8')
if (!envExample.includes('VITE_SUPABASE_PUBLISHABLE_KEY=replace-with-project-publishable-key')) {
  throw new Error('Portal env example must contain only the publishable-key placeholder')
}

const source = requiredFiles
  .filter((path) => path.endsWith('.ts'))
  .map((path) => readFileSync(resolve(root, path), 'utf8'))
  .join('\n')

for (const forbidden of ['SUPABASE_SERVICE_ROLE_KEY', 'GEMINI_API_KEY', 'sb_secret_']) {
  if (source.includes(forbidden)) {
    throw new Error(`Forbidden privileged secret marker found in portal integration source: ${forbidden}`)
  }
}

for (const required of [
  'signInWithPassword',
  "from('profiles')",
  'portalLandingPath',
  'canProfileAccessPortalPath',
]) {
  if (!source.includes(required)) {
    throw new Error(`Portal integration foundation is missing required primitive: ${required}`)
  }
}

console.log('Step VII-A1 portal integration foundation: PASS')
