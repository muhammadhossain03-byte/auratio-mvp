import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, resolve } from 'node:path'
import { chromium } from '@playwright/test'

const PORT = 4173
const DIST_DIR = resolve(process.cwd(), 'dist')
const CAPTURE_DIR = resolve(process.cwd(), 'capture_output')

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
  '.json': 'application/json',
}

function startStaticServer() {
  return new Promise((resolveServer, rejectServer) => {
    const server = createServer((req, res) => {
      const urlPath = req.url.split('?')[0]
      let filePath = join(DIST_DIR, urlPath)

      if (!existsSync(filePath) || urlPath === '/' || !extname(urlPath)) {
        filePath = join(DIST_DIR, 'index.html')
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
      resolveServer(server)
    })
    server.on('error', rejectServer)
  })
}

const REPRESENTATIVE_TRACKS = [
  { id: 'sub-synth-per', slug: 'persuasive', label: 'Persuasive' },
  { id: 'sub-synth-arg', slug: 'argumentative-debate', label: 'Argumentative / Debate' },
  { id: 'sub-synth-nd', slug: 'news-delivery', label: 'News Delivery' },
  { id: 'sub-synth-ap', slug: 'academic-poster-project-thesis', label: 'Academic — Poster / Project / Thesis' },
  { id: 'sub-synth-cr', slug: 'corporate-report', label: 'Corporate Report' },
  { id: 'sub-synth-info', slug: 'infotainment-oriented', label: 'Infotainment-Oriented' },
  { id: 'sub-synth-mkt', slug: 'marketing-promotional', label: 'Marketing / Promotional' },
  { id: 'sub-8821', slug: 'business-pitch', label: 'Business Pitch / Sales Pitch' },
]

async function run() {
  if (!existsSync(CAPTURE_DIR)) {
    mkdirSync(CAPTURE_DIR, { recursive: true })
  }

  const server = await startStaticServer()
  console.log(`Static server running at http://127.0.0.1:${PORT}`)

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1366, height: 900 },
    deviceScaleFactor: 1,
  })

  const page = await context.newPage()
  const consoleErrors = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text())
    }
  })

  try {
    for (const track of REPRESENTATIVE_TRACKS) {
      const url = `http://127.0.0.1:${PORT}/volunteer/evaluation/${track.id}`
      console.log(`Navigating to ${url} (${track.label})...`)
      await page.goto(url, { waitUntil: 'networkidle' })
      await page.evaluate(() => document.fonts.ready)

      // 1. Capture top viewport (1366 x 900)
      const topPath = join(CAPTURE_DIR, `volunteer_workspace_${track.slug}.png`)
      await page.screenshot({ path: topPath, clip: { x: 0, y: 0, width: 1366, height: 900 } })
      console.log(`  Saved: ${topPath}`)

      // 2. Scroll to Section C: Track Specialisation and capture
      await page.evaluate(() => {
        const el = document.querySelector('.auratio-volunteer-content')
        if (el) el.scrollTop = 1200
      })
      await page.waitForTimeout(200)
      const sectionCPath = join(CAPTURE_DIR, `volunteer_workspace_${track.slug}_section_c.png`)
      await page.screenshot({ path: sectionCPath, clip: { x: 0, y: 0, width: 1366, height: 900 } })
      console.log(`  Saved: ${sectionCPath}`)

      // If it's SUB-8821, also update baseline volunteer_scoring_workspace.png
      if (track.id === 'sub-8821') {
        await page.evaluate(() => {
          const el = document.querySelector('.auratio-volunteer-content')
          if (el) el.scrollTop = 0
        })
        const baselinePath = join(CAPTURE_DIR, 'volunteer_scoring_workspace.png')
        await page.screenshot({ path: baselinePath, clip: { x: 0, y: 0, width: 1366, height: 900 } })
        console.log(`  Updated baseline: ${baselinePath}`)
      }
    }

    // Capture Criterion Feedback Editor for SUB-8821
    const editorUrl = `http://127.0.0.1:${PORT}/volunteer/evaluation/sub-8821/criterion`
    console.log(`Navigating to ${editorUrl}...`)
    await page.goto(editorUrl, { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    const editorPath = join(CAPTURE_DIR, 'volunteer_criterion_feedback_editor.png')
    await page.screenshot({ path: editorPath, clip: { x: 0, y: 0, width: 1366, height: 900 } })
    console.log(`  Updated editor: ${editorPath}`)

    if (consoleErrors.length > 0) {
      console.error('Browser console errors detected:', consoleErrors)
      throw new Error(`Browser console errors found: ${consoleErrors.join(', ')}`)
    } else {
      console.log('✓ Zero browser console/runtime errors encountered across all tracks.')
    }
  } finally {
    await browser.close()
    server.close()
  }

  console.log('Visual QA capture completed successfully!')
}

run().catch((err) => {
  console.error('Visual QA capture failed:', err)
  process.exit(1)
})
