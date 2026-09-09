import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const source = fs.readFileSync(
  path.join(root, 'src/features/admin/components/AdminLayout.tsx'),
  'utf8',
)

function requireText(label, needle) {
  if (!source.includes(needle)) {
    throw new Error(`Missing Super Admin operational-shell sentinel: ${label}`)
  }
}

function requirePattern(label, pattern) {
  if (!pattern.test(source)) {
    throw new Error(`Missing Super Admin operational-shell sentinel: ${label}`)
  }
}

for (const [label, needle] of [
  ['session resolver', 'currentPortalSession'],
  ['auth subscription', 'subscribeToPortalAuth'],
  ['sidebar role test id', 'data-testid="operational-shell-role"'],
  ['topbar role test id', 'data-testid="operational-shell-topbar-role"'],
  ['Admin Accounts return-link test id', 'data-testid="super-admin-admin-accounts-link"'],
  ['Admin Accounts route', 'portalRoutePaths.superAdmin.adminAccounts'],
  ['Super Admin portal navigation label', 'Super Admin Portal Navigation'],
  ['Super Admin governance footer', 'Super Admin governance'],
  ['Admin initials accessibility label', 'aria-label="Admin initials"'],
]) {
  requireText(label, needle)
}

for (const [label, pattern] of [
  [
    'configured Super Admin role branch',
    /authenticated\?\.profile\.role\s*===\s*["']super_admin["']/,
  ],
  [
    'configured Admin role branch',
    /authenticated\?\.profile\.role\s*===\s*["']admin["']/,
  ],
  [
    'prototype remains Admin shell',
    /runtimeMode\s*===\s*["']prototype["']\s*\?\s*["']admin["']\s*:\s*null/,
  ],
  [
    'operational shell fallback role',
    /data-operational-shell-role=\{shellRole\s*\?\?\s*["']admin["']\}/,
  ],
  [
    'Admin Dashboard navigation preserved',
    /navigate\(portalRoutePaths\.admin\.dashboard\)/,
  ],
  [
    'Admin Requests navigation preserved',
    /navigate\(portalRoutePaths\.admin\.requests\)/,
  ],
  [
    'Admin Evaluations navigation preserved',
    /navigate\(portalRoutePaths\.admin\.evaluations\)/,
  ],
  [
    'Admin Moderation navigation preserved',
    /navigate\(portalRoutePaths\.admin\.moderation\)/,
  ],
  [
    'Admin Volunteers navigation preserved',
    /navigate\(portalRoutePaths\.admin\.volunteers\)/,
  ],
  [
    'Admin Events navigation preserved',
    /navigate\(portalRoutePaths\.admin\.events\)/,
  ],
  [
    'Admin Audit navigation preserved',
    /navigate\(portalRoutePaths\.admin\.audit\)/,
  ],
]) {
  requirePattern(label, pattern)
}

for (const forbidden of [
  '/super-admin/dashboard',
  '/super-admin/requests',
  '/super-admin/evaluations',
  '/super-admin/moderation',
  '/super-admin/volunteers',
  '/super-admin/events',
  '/super-admin/audit',
]) {
  if (source.includes(forbidden)) {
    throw new Error(
      `Duplicate Super Admin operational route must not be introduced: ${forbidden}`,
    )
  }
}

console.log('Step VII-E2H3 Super Admin operational shell identity: PASS')
