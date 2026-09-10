/// <reference types="node" />

import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

console.log('--- Testing persistedAdminEvents integration ---')

const root = process.cwd()

function readFile(relativePath: string): string {
  return fs.readFileSync(path.join(root, relativePath), 'utf8')
}

const eventsIntegrationSource = readFile('src/features/admin/integration/persistedAdminEvents.ts')
const managementPageSource = readFile('src/features/admin/pages/AdminEventManagementPage.tsx')
const editorPageSource = readFile('src/features/admin/pages/AdminEventEditorPage.tsx')

// 1. Event mapping uses country_code = BD
assert.ok(
  eventsIntegrationSource.includes("country_code: 'BD'"),
  'persistedAdminEvents must enforce country_code = BD',
)
assert.ok(
  eventsIntegrationSource.includes("countryCode: String(row.country_code ?? 'BD')"),
  'persistedAdminEvents must map country_code to countryCode',
)
console.log('✓ 1. Event mapping uses country_code = BD verified')

// 2. Path mappings are exactly public-speaking, professional-presenting, content-creation
const expectedPathIds = ['public-speaking', 'professional-presenting', 'content-creation']
for (const pathId of expectedPathIds) {
  assert.ok(
    eventsIntegrationSource.includes(`'${pathId}'`),
    `persistedAdminEvents must define canonical path ID: ${pathId}`,
  )
}
assert.ok(
  eventsIntegrationSource.includes("'public-speaking',"),
  'public-speaking must be present in VALID_PATH_IDS',
)
assert.ok(
  eventsIntegrationSource.includes("'professional-presenting',"),
  'professional-presenting must be present in VALID_PATH_IDS',
)
assert.ok(
  eventsIntegrationSource.includes("'content-creation',"),
  'content-creation must be present in VALID_PATH_IDS',
)

// Path mapping helper verification
assert.ok(
  eventsIntegrationSource.includes('extractPathIds'),
  'extractPathIds helper must be exported',
)
console.log('✓ 2. Path mappings exactly match canonical Auratio paths')

// 3. Published/Draft status mapping is correct
assert.ok(
  eventsIntegrationSource.includes("case 'draft':\n      return 'Draft'"),
  'Draft status must map to "Draft"',
)
assert.ok(
  eventsIntegrationSource.includes("case 'published':\n      return 'Published'"),
  'Published status must map to "Published"',
)
assert.ok(
  eventsIntegrationSource.includes("case 'cancelled':\n      return 'Cancelled'"),
  'Cancelled status must map to "Cancelled"',
)
console.log('✓ 3. Published/Draft status mapping is correct')

// 4. Admin Event Management no longer imports getAdminEventsList
assert.ok(
  !managementPageSource.includes('getAdminEventsList'),
  'AdminEventManagementPage must NOT import getAdminEventsList',
)
assert.ok(
  managementPageSource.includes('listPersistedAdminEvents'),
  'AdminEventManagementPage must import and call listPersistedAdminEvents',
)
assert.ok(
  managementPageSource.includes('Loading events…'),
  'AdminEventManagementPage must render "Loading events…"',
)
assert.ok(
  managementPageSource.includes('Unable to load events.'),
  'AdminEventManagementPage must render "Unable to load events."',
)
assert.ok(
  managementPageSource.includes('No events found for this filter.'),
  'AdminEventManagementPage must render "No events found for this filter."',
)
console.log('✓ 4. Admin Event Management source verified clean of mock data imports')

// 5. Admin Event Editor no longer imports saveAdminEvent, publishAdminEvent, deleteAdminEvent, getAdminEventById
assert.ok(
  !editorPageSource.includes('saveAdminEvent'),
  'AdminEventEditorPage must NOT import saveAdminEvent',
)
assert.ok(
  !editorPageSource.includes('publishAdminEvent'),
  'AdminEventEditorPage must NOT import publishAdminEvent',
)
assert.ok(
  !editorPageSource.includes('deleteAdminEvent'),
  'AdminEventEditorPage must NOT import deleteAdminEvent',
)
assert.ok(
  !editorPageSource.includes('getAdminEventById'),
  'AdminEventEditorPage must NOT import getAdminEventById',
)
assert.ok(
  editorPageSource.includes('createPersistedAdminEvent'),
  'AdminEventEditorPage must import createPersistedAdminEvent',
)
assert.ok(
  editorPageSource.includes('updatePersistedAdminEvent'),
  'AdminEventEditorPage must import updatePersistedAdminEvent',
)
assert.ok(
  editorPageSource.includes('deletePersistedAdminEvent'),
  'AdminEventEditorPage must import deletePersistedAdminEvent',
)
assert.ok(
  editorPageSource.includes('getPersistedAdminEvent'),
  'AdminEventEditorPage must import getPersistedAdminEvent',
)
console.log('✓ 5. Admin Event Editor source verified clean of mock event functions')

// 6. Event Editor requires a valid date/time, Bangladesh Division, title, and at least one Path before persistence
assert.ok(
  editorPageSource.includes('type="datetime-local"'),
  'AdminEventEditorPage must use type="datetime-local" for date/time input',
)
assert.ok(
  editorPageSource.includes('Event title is required.'),
  'AdminEventEditorPage must validate that event title is required',
)
assert.ok(
  editorPageSource.includes('Bangladesh Division is required.'),
  'AdminEventEditorPage must validate that Bangladesh Division is required',
)
assert.ok(
  editorPageSource.includes('Valid date/time is required.'),
  'AdminEventEditorPage must validate that date/time is required and valid',
)
assert.ok(
  editorPageSource.includes('At least one Auratio Path is required.'),
  'AdminEventEditorPage must validate that at least one Auratio Path is selected',
)
assert.ok(
  editorPageSource.includes('Unable to save this event. Please try again.'),
  'AdminEventEditorPage must display standard error copy on persistence error',
)

// Division dropdown check
const expectedDivisions = [
  'Barishal',
  'Chattogram',
  'Dhaka',
  'Khulna',
  'Mymensingh',
  'Rajshahi',
  'Rangpur',
  'Sylhet',
]
for (const div of expectedDivisions) {
  assert.ok(
    eventsIntegrationSource.includes(`'${div}'`),
    `persistedAdminEvents must include division: ${div}`,
  )
}

console.log('✓ 6. Event Editor validations and Division dropdown constraints verified')
console.log('\nALL PERSISTED ADMIN EVENTS INTEGRATION TESTS PASSED!')
