import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const PORT = 4173
const OUTPUT_DIR = resolve(process.cwd(), 'capture_output', 'visual_qa')

if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true })
}

import { createServer } from 'node:http'
import { extname, join } from 'node:path'
import { readFileSync } from 'node:fs'

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
  '.json': 'application/json',
}

function startStaticServer(distDir) {
  return new Promise((resolveServer, rejectServer) => {
    const server = createServer((req, res) => {
      const urlPath = req.url.split('?')[0]
      let filePath = join(distDir, urlPath)

      if (!existsSync(filePath) || urlPath === '/' || !extname(urlPath)) {
        filePath = join(distDir, 'index.html')
      }

      try {
        const content = readFileSync(filePath)
        const ext = extname(filePath)
        res.writeHead(200, {
          'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
        })
        res.end(content)
      } catch (err) {
        res.writeHead(500)
        res.end(String(err))
      }
    })

    server.listen(PORT, '127.0.0.1', () => {
      console.log(`Static server running on http://127.0.0.1:${PORT}`)
      resolveServer(server)
    })

    server.on('error', rejectServer)
  })
}

async function run() {
  console.log('--- Starting Visual QA & Real-Browser Flow ---')
  const distDir = resolve(process.cwd(), 'dist')
  const server = await startStaticServer(distDir)
  console.log(`Server started on port ${PORT}`)

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1366, height: 900 },
  })
  const page = await context.newPage()

  try {
    // 1. Volunteer view: SUB-8821 active
    await page.goto(`http://127.0.0.1:${PORT}/volunteer/assignments`)
    console.log('1. Opened /volunteer/assignments')
    const sub8821Btn = page.locator('button[aria-label="Open SUB-8821"]')
    if ((await sub8821Btn.count()) === 0) {
      throw new Error('Expected SUB-8821 in volunteer active assignments initially')
    }
    console.log('   ✓ SUB-8821 present in Volunteer active assignments')

    // 2. Decline SUB-8821
    await page.goto(`http://127.0.0.1:${PORT}/volunteer/assignments/sub-8821/decline`)
    await page.locator('input.auratio-volunteer-decline-input').fill('Emergency medical leave')
    await page.locator('button.auratio-volunteer-btn--primary', { hasText: 'Confirm Decline' }).click()
    await page.waitForURL(`**/volunteer/assignments/after-decline`)
    console.log('2. Declined SUB-8821 with reason "Emergency medical leave"')

    // 3. Admin queue -> REQ-1042 = Unassigned
    await page.goto(`http://127.0.0.1:${PORT}/admin/requests`)
    const reqRow1 = page.locator('[data-request-id="REQ-1042"]')
    const routing1 = await reqRow1.getAttribute('data-routing')
    console.log(`3. Admin queue REQ-1042 routing: "${routing1}"`)
    if (routing1 !== 'Unassigned') {
      throw new Error(`Expected REQ-1042 routing "Unassigned", got "${routing1}"`)
    }

    // 4. Open detail -> REQ-1042 detail = Unassigned
    await reqRow1.locator('button.auratio-admin-btn--table-open').click()
    await page.waitForURL(`**/admin/requests/req-1042`)
    console.log('4. Opened /admin/requests/req-1042 (Unassigned state)')

    const detailText1 = await page.locator('body').innerText()
    console.log('detailText1:\n', detailText1)
    if (!detailText1.includes('Unassigned')) {
      throw new Error('REQ-1042 detail page missing "Unassigned"')
    }
    if (!detailText1.includes('Emergency medical leave')) {
      throw new Error('REQ-1042 detail page missing decline reason')
    }
    if (!detailText1.includes('SUB-8821')) {
      throw new Error('REQ-1042 detail page missing "SUB-8821"')
    }

    // Measure geometric bounding boxes for Left Panel
    const panelBox = await page.locator('.auratio-admin-panel').first().boundingBox()
    const publicationStatusDiv = page.locator('text=PUBLICATION STATUS').locator('..')
    const pubBox = await publicationStatusDiv.boundingBox()
    const declineReasonDiv = page.locator('text=DECLINE REASON').locator('..')
    const declineBox = await declineReasonDiv.boundingBox()

    console.log('   --- Panel Geometry Audit (Unassigned State) ---')
    console.log(`   Panel: top=${panelBox.y}, height=${panelBox.height}, bottom=${panelBox.y + panelBox.height}`)
    console.log(`   Decline Reason: top=${declineBox.y}, height=${declineBox.height}, bottom=${declineBox.y + declineBox.height}`)
    console.log(`   Publication Status: top=${pubBox.y}, height=${pubBox.height}, bottom=${pubBox.y + pubBox.height}`)

    const panelBottom = panelBox.y + panelBox.height
    const pubBottom = pubBox.y + pubBox.height
    const bottomClearance = panelBottom - pubBottom

    console.log(`   Bottom clearance inside panel: ${bottomClearance}px`)
    if (bottomClearance < 10) {
      throw new Error(`Publication Status overflows or collides with bottom: clearance is only ${bottomClearance}px`)
    }
    if (pubBox.y < declineBox.y + declineBox.height) {
      throw new Error('Publication Status overlaps Decline Reason!')
    }
    console.log('   ✓ Geometry verified: Zero overflow, comfortable clearance, no overlap.')

    // Capture Unassigned screenshot at 1366x900
    const unassignedImg = resolve(OUTPUT_DIR, 'admin_req1042_unassigned_1366x900.png')
    await page.screenshot({ path: unassignedImg })
    console.log(`   ✓ Captured: ${unassignedImg}`)

    // 5. Click Assign Human -> Assignment Picker
    await page.locator('button.auratio-admin-btn--primary', { hasText: 'Assign Human' }).click()
    await page.waitForURL(`**/admin/requests/req-1042/assign`)
    await page.waitForSelector('text=Choose evaluator for HE-0142')
    console.log('5. Navigated to Assignment Picker (/admin/requests/req-1042/assign)')
    const pickerSubtitle1 = await page.locator('.auratio-admin-page-subtitle').innerText()
    console.log(`   Picker subtitle: "${pickerSubtitle1}"`)
    if (!pickerSubtitle1.includes('Assignment state: Unassigned') || !pickerSubtitle1.includes('Active evaluator owner: None')) {
      throw new Error(`Picker subtitle mismatch: ${pickerSubtitle1}`)
    }

    // 6. Select candidate Rakib Hasan
    await page.locator('button[data-candidate="Rakib Hasan"]').click()
    await page.waitForURL(`**/admin/requests`)
    await page.waitForSelector('text=Evaluation requests')
    console.log('6. Selected Rakib Hasan -> Returned to /admin/requests')

    // 7. Verify Queue: Assigned Human
    const reqRow2 = page.locator('[data-request-id="REQ-1042"]')
    const routing2 = await reqRow2.getAttribute('data-routing')
    console.log(`7. Admin queue REQ-1042 routing after Rakib: "${routing2}"`)
    if (routing2 !== 'Assigned Human') {
      throw new Error(`Expected REQ-1042 routing "Assigned Human", got "${routing2}"`)
    }

    // 8. Open detail -> REQ-1042 detail = Assigned Human
    await reqRow2.locator('button.auratio-admin-btn--table-open').click()
    await page.waitForURL(`**/admin/requests/req-1042`)
    await page.waitForSelector('text=Routing decision')
    console.log('8. Opened /admin/requests/req-1042 (Assigned Human state)')
    const detailText2 = await page.locator('body').innerText()
    if (!detailText2.includes('Assigned Human')) {
      throw new Error('REQ-1042 detail missing "Assigned Human"')
    }
    const subtitle2 = await page.locator('.auratio-admin-page-subtitle').innerText()
    console.log(`   Detail subtitle: "${subtitle2}"`)
    if (!subtitle2.includes('Eligible recording assigned to Human Evaluation')) {
      throw new Error(`Detail subtitle mismatch: ${subtitle2}`)
    }

    // Capture Assigned Human screenshot at 1366x900
    const assignedImg = resolve(OUTPUT_DIR, 'admin_req1042_assigned_human_1366x900.png')
    await page.screenshot({ path: assignedImg })
    console.log(`   ✓ Captured: ${assignedImg}`)

    // 9. Volunteer view: session volunteer (Farhana Islam) does NOT own SUB-8821
    await page.goto(`http://127.0.0.1:${PORT}/volunteer/assignments`)
    console.log('9. Checked /volunteer/assignments: Farhana does not own SUB-8821')
    if ((await page.locator('button[aria-label="Open SUB-8821"]').count()) > 0) {
      throw new Error('SUB-8821 unexpectedly present in Farhana assignments when assigned to Rakib!')
    }
    console.log('   ✓ SUB-8821 absent from Farhana active assignments')

    // 10. Open Picker -> Verify Rakib Hasan is active owner
    await page.goto(`http://127.0.0.1:${PORT}/admin/requests/req-1042/assign`)
    await page.waitForSelector('text=Choose evaluator for HE-0142')
    const pickerSubtitle2 = await page.locator('.auratio-admin-page-subtitle').innerText()
    console.log(`10. Picker subtitle after Rakib: "${pickerSubtitle2}"`)
    if (!pickerSubtitle2.includes('Assignment state: Assigned') || !pickerSubtitle2.includes('Active evaluator owner: Rakib Hasan')) {
      throw new Error(`Picker subtitle mismatch: ${pickerSubtitle2}`)
    }

    // 11. Admin explicitly assigns Farhana Islam
    await page.locator('button[data-candidate="Farhana Islam"]').click()
    await page.waitForURL(`**/admin/requests`)
    await page.waitForSelector('text=Evaluation requests')
    console.log('11. Selected Farhana Islam -> Returned to /admin/requests')

    // 12. Verify Queue: Assigned Human (NOT Requested!)
    const reqRow3 = page.locator('[data-request-id="REQ-1042"]')
    const routing3 = await reqRow3.getAttribute('data-routing')
    console.log(`12. Admin queue REQ-1042 routing after Farhana: "${routing3}"`)
    if (routing3 !== 'Assigned Human') {
      throw new Error(`Expected REQ-1042 routing "Assigned Human" when owned by Farhana, got "${routing3}"`)
    }

    // 13. Open detail -> REQ-1042 detail = Assigned Human
    await reqRow3.locator('button.auratio-admin-btn--table-open').click()
    await page.waitForURL(`**/admin/requests/req-1042`)
    await page.waitForSelector('text=Routing decision')
    const detailText3 = await page.locator('body').innerText()
    if (!detailText3.includes('Assigned Human')) {
      throw new Error('REQ-1042 detail missing "Assigned Human" when Farhana assigned')
    }
    console.log('13. Detail page agrees: Assigned Human')

    // 14. Check Picker -> Farhana is active owner
    await page.goto(`http://127.0.0.1:${PORT}/admin/requests/req-1042/assign`)
    await page.waitForSelector('text=Choose evaluator for HE-0142')
    const pickerSubtitle3 = await page.locator('.auratio-admin-page-subtitle').innerText()
    console.log(`14. Picker subtitle after Farhana: "${pickerSubtitle3}"`)
    if (!pickerSubtitle3.includes('Assignment state: Assigned') || !pickerSubtitle3.includes('Active evaluator owner: Farhana Islam')) {
      throw new Error(`Picker subtitle mismatch: ${pickerSubtitle3}`)
    }

    // 15. Volunteer view: SUB-8821 legitimately present again for Farhana!
    await page.goto(`http://127.0.0.1:${PORT}/volunteer/assignments`)
    const sub8821RestoredBtn = page.locator('button[aria-label="Open SUB-8821"]')
    if ((await sub8821RestoredBtn.count()) === 0) {
      throw new Error('SUB-8821 not restored in Farhana assignments after explicit Admin assignment!')
    }
    console.log('15. ✓ SUB-8821 legitimately present again in Farhana active assignments!')

    console.log('\n==================================================')
    console.log('REAL-BROWSER QA & VISUAL GEOMETRY VERIFICATION PASSED 100%!')
    console.log('==================================================')
  } finally {
    await browser.close()
    server.close()
  }
}

run().catch((err) => {
  console.error('QA FAILED:', err)
  process.exit(1)
})
