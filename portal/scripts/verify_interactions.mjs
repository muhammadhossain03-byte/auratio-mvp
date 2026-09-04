import { spawn } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, resolve } from 'node:path'

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const PORT = 4176

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
      resolveServer(server)
    })
    server.on('error', rejectServer)
  })
}

async function sendCdp(ws, method, params = {}) {
  const id = Math.floor(Math.random() * 1000000)
  return new Promise((resolvePromise, rejectPromise) => {
    const timeout = setTimeout(() => {
      rejectPromise(new Error(`Timeout waiting for CDP response: ${method}`))
    }, 15000)

    function handleMessage(event) {
      try {
        const data = JSON.parse(event.data)
        if (data.id === id) {
          clearTimeout(timeout)
          ws.removeEventListener('message', handleMessage)
          if (data.error) {
            rejectPromise(new Error(data.error.message))
          } else {
            resolvePromise(data.result)
          }
        }
      } catch {
        // ignore
      }
    }

    ws.addEventListener('message', handleMessage)
    ws.send(JSON.stringify({ id, method, params }))
  })
}

async function run() {
  const distDir = resolve(process.cwd(), 'dist')
  const server = await startStaticServer(distDir)

  const cdpPort = 9230
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${cdpPort}`,
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=1366,900',
    'about:blank',
  ])

  await new Promise((r) => setTimeout(r, 1500))

  try {
    const listRes = await fetch(`http://127.0.0.1:${cdpPort}/json/list`)
    const pages = await listRes.json()
    const targetPage = pages.find((p) => p.type === 'page') || pages[0]

    const ws = new WebSocket(targetPage.webSocketDebuggerUrl)
    await new Promise((r, rej) => {
      ws.onopen = r
      ws.onerror = rej
    })

    await sendCdp(ws, 'Page.enable')

    async function clickByText(selector, text) {
      const evalRes = await sendCdp(ws, 'Runtime.evaluate', {
        expression: `(() => {
          const elements = Array.from(document.querySelectorAll('${selector}'));
          const el = elements.find(e => e.innerText.trim().includes('${text}'));
          if (el) {
            el.click();
            return true;
          }
          return false;
        })()`,
      })
      if (!evalRes.result.value) {
        throw new Error(`Element not found for selector "${selector}" with text "${text}"`)
      }
      await new Promise((r) => setTimeout(r, 300))
    }

    async function getPathname() {
      const evalRes = await sendCdp(ws, 'Runtime.evaluate', {
        expression: 'window.location.pathname',
      })
      return evalRes.result.value
    }

    async function getBodyText() {
      const evalRes = await sendCdp(ws, 'Runtime.evaluate', {
        expression: 'document.body.innerText',
      })
      return evalRes.result.value || ''
    }

    async function setInputValue(selector, value) {
      const evalRes = await sendCdp(ws, 'Runtime.evaluate', {
        expression: `(() => {
          const el = document.querySelector('${selector}');
          if (el) {
            const proto = el instanceof HTMLTextAreaElement
              ? window.HTMLTextAreaElement.prototype
              : window.HTMLInputElement.prototype;
            const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value').set;
            nativeSetter.call(el, ${JSON.stringify(value)});
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
            return true;
          }
          return false;
        })()`,
      })
      if (!evalRes.result.value) {
        throw new Error(`Element not found for selector "${selector}"`)
      }
      await new Promise((r) => setTimeout(r, 200))
    }

    // 0. ROOT REDIRECT
    console.log('--- Testing Portal Root Redirect ---')
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/` })
    await new Promise((r) => setTimeout(r, 500))
    console.log('Path after visiting root /:', await getPathname())
    if (await getPathname() !== '/auth/sign-in') throw new Error('Expected / to redirect to /auth/sign-in')

    // 1. AUTH FLOW
    console.log('--- Testing Auth Flow ---')
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/auth/sign-in` })
    await new Promise((r) => setTimeout(r, 500))

    await clickByText('button.auratio-auth-link', 'Forgot password?')
    console.log('Path after Forgot Password:', await getPathname())
    if (await getPathname() !== '/auth/forgot-password') throw new Error('Expected /auth/forgot-password')

    await clickByText('button[type="submit"]', 'Send Reset Link')
    console.log('Path after Send Reset Link:', await getPathname())
    if (await getPathname() !== '/auth/reset-link-sent') throw new Error('Expected /auth/reset-link-sent')

    await clickByText('button.auratio-auth-btn', 'Open Reset Link — Prototype')
    console.log('Path after Open Reset Link:', await getPathname())
    if (await getPathname() !== '/auth/reset-password') throw new Error('Expected /auth/reset-password')

    // Verify empty password blocks navigation
    await clickByText('button[type="submit"]', 'Update Password')
    if (await getPathname() !== '/auth/reset-password') {
      throw new Error('Expected /auth/reset-password when submitting empty passwords')
    }

    // Enter valid passwords and submit
    await setInputValue('#portal-reset-password-new', 'Password123!')
    await setInputValue('#portal-reset-password-confirm', 'Password123!')
    await clickByText('button[type="submit"]', 'Update Password')
    console.log('Path after Update Password:', await getPathname())
    if (await getPathname() !== '/auth/password-reset-complete') throw new Error('Expected /auth/password-reset-complete')

    await clickByText('button.auratio-auth-btn', 'Return to Sign In')
    console.log('Path after Return to Sign In:', await getPathname())
    if (await getPathname() !== '/auth/sign-in') throw new Error('Expected /auth/sign-in')

    // 2. ROLE AUTH -> VOLUNTEER WORKSPACE -> ACCEPT
    console.log('\n--- Testing Role Auth -> Volunteer Accept Flow ---')
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/auth/role-authorization` })
    await new Promise((r) => setTimeout(r, 500))

    await clickByText('button.auratio-auth-btn', 'Open resolved Volunteer Evaluator workspace')
    console.log('Path after Role Auth -> Volunteer:', await getPathname())
    if (await getPathname() !== '/volunteer/assignments') throw new Error('Expected /volunteer/assignments')

    await clickByText('button.auratio-volunteer-btn', 'Open')
    console.log('Path after Open SUB-8821:', await getPathname())
    if (await getPathname() !== '/volunteer/assignments/sub-8821') throw new Error('Expected /volunteer/assignments/sub-8821')

    await clickByText('button.auratio-volunteer-btn--primary', 'Accept')
    console.log('Path after Accept:', await getPathname())
    if (await getPathname() !== '/volunteer/evaluation/sub-8821') throw new Error('Expected /volunteer/evaluation/sub-8821')

    // 3. DECLINE FLOW & CANCEL & REASON REQUIREMENT
    console.log('\n--- Testing Volunteer Decline Flow ---')
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/volunteer/assignments/sub-8821` })
    await new Promise((r) => setTimeout(r, 500))

    await clickByText('button.auratio-volunteer-btn--secondary', 'Decline')
    console.log('Path after Decline click:', await getPathname())
    if (await getPathname() !== '/volunteer/assignments/sub-8821/decline') throw new Error('Expected /volunteer/assignments/sub-8821/decline')

    await clickByText('button.auratio-volunteer-btn--secondary', 'Cancel')
    console.log('Path after Cancel click:', await getPathname())
    if (await getPathname() !== '/volunteer/assignments/sub-8821') throw new Error('Expected /volunteer/assignments/sub-8821')

    await clickByText('button.auratio-volunteer-btn--secondary', 'Decline')
    console.log('Path after re-opening Decline page:', await getPathname())
    if (await getPathname() !== '/volunteer/assignments/sub-8821/decline') throw new Error('Expected /volunteer/assignments/sub-8821/decline')

    // Case A: EMPTY REASON
    console.log('Checking Case A: Empty reason...')
    const emptyValueCheck = await sendCdp(ws, 'Runtime.evaluate', {
      expression: `document.querySelector('input.auratio-volunteer-decline-input').value`,
    })
    if (emptyValueCheck.result.value !== '') {
      throw new Error(`Expected initial decline reason to be empty, found: "${emptyValueCheck.result.value}"`)
    }

    await clickByText('button.auratio-volunteer-btn--primary', 'Confirm Decline')
    console.log('Path after Confirm Decline with empty reason:', await getPathname())
    if (await getPathname() !== '/volunteer/assignments/sub-8821/decline') {
      throw new Error('Confirm Decline navigated with empty reason! Pathname changed.')
    }

    // Whitespace check
    await setInputValue('input.auratio-volunteer-decline-input', '   ')
    await clickByText('button.auratio-volunteer-btn--primary', 'Confirm Decline')
    console.log('Path after Confirm Decline with whitespace reason:', await getPathname())
    if (await getPathname() !== '/volunteer/assignments/sub-8821/decline') {
      throw new Error('Confirm Decline navigated with whitespace reason!')
    }

    // Case B: VALID REASON
    console.log('Checking Case B: Valid reason...')
    await setInputValue('input.auratio-volunteer-decline-input', 'Scheduling conflict / cannot review in time')
    await clickByText('button.auratio-volunteer-btn--primary', 'Confirm Decline')
    console.log('Path after Confirm Decline with valid reason:', await getPathname())
    if (await getPathname() !== '/volunteer/assignments/after-decline') {
      throw new Error('Expected /volunteer/assignments/after-decline after valid decline reason')
    }

    // 4. AVAILABILITY TOGGLE
    console.log('\n--- Testing Availability Toggle Flow ---')
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/volunteer/availability` })
    await new Promise((r) => setTimeout(r, 500))

    await clickByText('button.auratio-volunteer-btn--primary', 'Set Unavailable')
    console.log('Path after Set Unavailable:', await getPathname())
    if (await getPathname() !== '/volunteer/availability/unavailable') throw new Error('Expected /volunteer/availability/unavailable')

    await clickByText('button.auratio-volunteer-btn--primary', 'Set Available')
    console.log('Path after Set Available:', await getPathname())
    if (await getPathname() !== '/volunteer/availability') throw new Error('Expected /volunteer/availability')

    // 5. SIDEBAR NAVIGATION
    console.log('\n--- Testing Sidebar Navigation ---')
    await clickByText('button.auratio-volunteer-nav-item', 'Active Assignments')
    console.log('Path after clicking Active Assignments in sidebar:', await getPathname())
    if (await getPathname() !== '/volunteer/assignments') throw new Error('Expected /volunteer/assignments')

    await clickByText('button.auratio-volunteer-nav-item', 'Availability')
    console.log('Path after clicking Availability in sidebar:', await getPathname())
    if (await getPathname() !== '/volunteer/availability') throw new Error('Expected /volunteer/availability')

    // 6. SCORING WORKSPACE -> CRITERION FEEDBACK EDITOR FLOW
    console.log('\n--- Testing Scoring -> Criterion Feedback Flow ---')
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/volunteer/evaluation/sub-8821` })
    await new Promise((r) => setTimeout(r, 500))

    await clickByText('button.auratio-volunteer-btn--secondary', 'Open Universal Delivery')
    console.log('Path after Open Universal Delivery:', await getPathname())
    if (await getPathname() !== '/volunteer/evaluation/sub-8821/criterion') {
      throw new Error('Expected /volunteer/evaluation/sub-8821/criterion')
    }

    // Back to Scores works regardless of completeness
    await clickByText('button.auratio-volunteer-btn--secondary', 'Back to Scores')
    console.log('Path after Back to Scores:', await getPathname())
    if (await getPathname() !== '/volunteer/evaluation/sub-8821') {
      throw new Error('Expected /volunteer/evaluation/sub-8821 after Back to Scores')
    }

    // A. INITIAL COMPLETE STATE
    console.log('Checking Case A: Initial complete state...')
    await clickByText('button.auratio-volunteer-btn--secondary', 'Open Universal Delivery')
    console.log('Path after re-opening criterion feedback:', await getPathname())
    if (await getPathname() !== '/volunteer/evaluation/sub-8821/criterion') {
      throw new Error('Expected /volunteer/evaluation/sub-8821/criterion')
    }

    // Check initial completeness text claims all ✓
    const initialCompleteness = await sendCdp(ws, 'Runtime.evaluate', {
      expression: `document.querySelector('.auratio-volunteer-criterion-completeness-row').innerText`,
    })
    console.log('Initial completeness row text:', initialCompleteness.result.value)
    if (!initialCompleteness.result.value.includes('Timestamped evidence ✓')) {
      throw new Error('Expected initial completeness to include "Timestamped evidence ✓"')
    }

    await clickByText('button.auratio-volunteer-btn--primary', 'Save Criterion Feedback')
    console.log('Path after Save Criterion Feedback on initial complete state:', await getPathname())
    if (await getPathname() !== '/volunteer/evaluation/sub-8821') {
      throw new Error('Expected /volunteer/evaluation/sub-8821 after Save Criterion Feedback')
    }

    // B. EMPTY REQUIRED FIELD
    console.log('Checking Case B: Empty required field blocks Save...')
    await clickByText('button.auratio-volunteer-btn--secondary', 'Open Universal Delivery')
    await setInputValue('textarea.auratio-volunteer-feedback-textarea--evidence', '')

    const emptyCompleteness = await sendCdp(ws, 'Runtime.evaluate', {
      expression: `document.querySelector('.auratio-volunteer-criterion-completeness-row').innerText`,
    })
    console.log('Completeness text with empty evidence:', emptyCompleteness.result.value)
    if (emptyCompleteness.result.value.includes('Timestamped evidence ✓')) {
      throw new Error('Completeness indicator falsely claims "Timestamped evidence ✓" when empty!')
    }
    if (!emptyCompleteness.result.value.includes('Timestamped evidence —')) {
      throw new Error('Completeness indicator missing incomplete marker when empty!')
    }

    await clickByText('button.auratio-volunteer-btn--primary', 'Save Criterion Feedback')
    console.log('Path after Save with empty evidence:', await getPathname())
    if (await getPathname() !== '/volunteer/evaluation/sub-8821/criterion') {
      throw new Error('Save Criterion Feedback navigated with empty evidence! Pathname changed.')
    }

    // C. WHITESPACE REQUIRED FIELD
    console.log('Checking Case C: Whitespace-only required field blocks Save...')
    await setInputValue('textarea.auratio-volunteer-feedback-textarea--evidence', '     \n  \t  ')

    const whitespaceCompleteness = await sendCdp(ws, 'Runtime.evaluate', {
      expression: `document.querySelector('.auratio-volunteer-criterion-completeness-row').innerText`,
    })
    console.log('Completeness text with whitespace evidence:', whitespaceCompleteness.result.value)
    if (whitespaceCompleteness.result.value.includes('Timestamped evidence ✓')) {
      throw new Error('Completeness indicator falsely claims "Timestamped evidence ✓" when whitespace!')
    }

    await clickByText('button.auratio-volunteer-btn--primary', 'Save Criterion Feedback')
    console.log('Path after Save with whitespace evidence:', await getPathname())
    if (await getPathname() !== '/volunteer/evaluation/sub-8821/criterion') {
      throw new Error('Save Criterion Feedback navigated with whitespace evidence! Pathname changed.')
    }

    // D. RESTORED VALID FIELD
    console.log('Checking Case D: Restored valid field permits Save...')
    await setInputValue(
      'textarea.auratio-volunteer-feedback-textarea--evidence',
      'At 01:38, benefits are concrete and differentiated.'
    )

    const restoredCompleteness = await sendCdp(ws, 'Runtime.evaluate', {
      expression: `document.querySelector('.auratio-volunteer-criterion-completeness-row').innerText`,
    })
    console.log('Completeness text with restored evidence:', restoredCompleteness.result.value)
    if (!restoredCompleteness.result.value.includes('Timestamped evidence ✓')) {
      throw new Error('Completeness indicator failed to restore "Timestamped evidence ✓"!')
    }

    await clickByText('button.auratio-volunteer-btn--primary', 'Save Criterion Feedback')
    console.log('Path after Save with restored valid evidence:', await getPathname())
    if (await getPathname() !== '/volunteer/evaluation/sub-8821') {
      throw new Error('Expected /volunteer/evaluation/sub-8821 after Save with valid evidence')
    }

    // 7. REVIEW & SUBMIT FLOW
    console.log('\n--- Testing Review & Submit Flow ---')
    await clickByText('button.auratio-volunteer-btn--primary', 'Review & Submit')
    console.log('Path after Review & Submit:', await getPathname())
    if (await getPathname() !== '/volunteer/evaluation/sub-8821/review') {
      throw new Error('Expected /volunteer/evaluation/sub-8821/review')
    }

    // Cancel returns to scoring workspace
    await clickByText('button.auratio-volunteer-btn--secondary', 'Cancel')
    console.log('Path after Cancel review:', await getPathname())
    if (await getPathname() !== '/volunteer/evaluation/sub-8821') {
      throw new Error('Expected /volunteer/evaluation/sub-8821 after Cancel')
    }

    await clickByText('button.auratio-volunteer-btn--primary', 'Review & Submit')
    await clickByText('button.auratio-volunteer-btn--primary', 'Confirm & Submit')
    console.log('Path after Confirm & Submit:', await getPathname())
    if (await getPathname() !== '/volunteer/evaluation/sub-8821/submitted') {
      throw new Error('Expected /volunteer/evaluation/sub-8821/submitted')
    }

    await clickByText('button.auratio-volunteer-btn--primary', 'Go to Completed / History')
    console.log('Path after Go to Completed / History:', await getPathname())
    if (await getPathname() !== '/volunteer/completed') {
      throw new Error('Expected /volunteer/completed')
    }

    // 8. COMPLETED HISTORY -> DETAIL PAGES
    console.log('\n--- Testing Completed History Detail Links ---')
    // Open SUB-8821 (Pending Moderation)
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/volunteer/completed` })
    await new Promise((r) => setTimeout(r, 500))

    const openButtonsCount = await sendCdp(ws, 'Runtime.evaluate', {
      expression: `document.querySelectorAll('button.auratio-volunteer-btn--secondary').length`,
    })
    console.log('Open buttons count in Completed History:', openButtonsCount.result.value)
    if (openButtonsCount.result.value !== 4) {
      throw new Error(`Expected 4 Open buttons, got ${openButtonsCount.result.value}`)
    }

    // Click row 1 open button (SUB-8821)
    await sendCdp(ws, 'Runtime.evaluate', {
      expression: `document.querySelectorAll('button.auratio-volunteer-btn--secondary')[0].click()`,
    })
    await new Promise((r) => setTimeout(r, 300))
    console.log('Path after open SUB-8821:', await getPathname())
    if (await getPathname() !== '/volunteer/completed/sub-8821') {
      throw new Error('Expected /volunteer/completed/sub-8821')
    }

    // Click row 2 open button (SUB-8792)
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/volunteer/completed` })
    await new Promise((r) => setTimeout(r, 500))
    await sendCdp(ws, 'Runtime.evaluate', {
      expression: `document.querySelectorAll('button.auratio-volunteer-btn--secondary')[1].click()`,
    })
    await new Promise((r) => setTimeout(r, 300))
    console.log('Path after open SUB-8792:', await getPathname())
    if (await getPathname() !== '/volunteer/completed/sub-8792') {
      throw new Error('Expected /volunteer/completed/sub-8792')
    }

    // Click row 3 open button (SUB-8755)
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/volunteer/completed` })
    await new Promise((r) => setTimeout(r, 500))
    await sendCdp(ws, 'Runtime.evaluate', {
      expression: `document.querySelectorAll('button.auratio-volunteer-btn--secondary')[2].click()`,
    })
    await new Promise((r) => setTimeout(r, 300))
    console.log('Path after open SUB-8755:', await getPathname())
    if (await getPathname() !== '/volunteer/completed/sub-8755') {
      throw new Error('Expected /volunteer/completed/sub-8755')
    }

    // Click row 4 open button (SUB-8741)
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/volunteer/completed` })
    await new Promise((r) => setTimeout(r, 500))
    await sendCdp(ws, 'Runtime.evaluate', {
      expression: `document.querySelectorAll('button.auratio-volunteer-btn--secondary')[3].click()`,
    })
    await new Promise((r) => setTimeout(r, 300))
    console.log('Path after open SUB-8741:', await getPathname())
    if (await getPathname() !== '/volunteer/completed/sub-8741') {
      throw new Error('Expected /volunteer/completed/sub-8741')
    }

    // 9. REOPENED EVALUATION -> CONTINUE CORRECTION
    console.log('\n--- Testing Reopened Evaluation Flow ---')
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/volunteer/evaluation/sub-8821/reopened` })
    await new Promise((r) => setTimeout(r, 500))

    await clickByText('button.auratio-volunteer-btn--primary', 'Continue Correction')
    console.log('Path after Continue Correction:', await getPathname())
    if (await getPathname() !== '/volunteer/evaluation/sub-8821') {
      throw new Error('Expected /volunteer/evaluation/sub-8821 after Continue Correction')
    }

    // 10. SIDEBAR COMPLETED / HISTORY NAVIGATION
    console.log('\n--- Testing Sidebar Completed / History Navigation ---')
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/volunteer/assignments` })
    await new Promise((r) => setTimeout(r, 500))

    await clickByText('button.auratio-volunteer-nav-item', 'Completed / History')
    console.log('Path after clicking Completed / History in sidebar:', await getPathname())
    if (await getPathname() !== '/volunteer/completed') {
      throw new Error('Expected /volunteer/completed after clicking Completed / History')
    }

    // ==========================================
    // BATCH 4: ADMIN INTERACTIONS
    // ==========================================

    // 11. ROLE AUTHORIZATION -> ADMIN WORKSPACE
    console.log('\n--- Testing Role Authorization -> Admin Workspace ---')
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/auth/role-authorization` })
    await new Promise((r) => setTimeout(r, 500))

    await clickByText('button.auratio-auth-btn', 'Open resolved Admin workspace')
    console.log('Path after clicking Open resolved Admin workspace:', await getPathname())
    if (await getPathname() !== '/admin/dashboard') {
      throw new Error('Expected /admin/dashboard after Open resolved Admin workspace')
    }

    // 12. ADMIN NAVIGATION: Dashboard <-> Requests <-> Evaluations
    console.log('\n--- Testing Admin Sidebar Navigation ---')
    await clickByText('button.auratio-admin-nav-item', 'Requests')
    console.log('Path after clicking Requests:', await getPathname())
    if (await getPathname() !== '/admin/requests') {
      throw new Error('Expected /admin/requests after clicking Requests')
    }

    await clickByText('button.auratio-admin-nav-item', 'Evaluations')
    console.log('Path after clicking Evaluations:', await getPathname())
    if (await getPathname() !== '/admin/evaluations') {
      throw new Error('Expected /admin/evaluations after clicking Evaluations')
    }

    await clickByText('button.auratio-admin-nav-item', 'Dashboard')
    console.log('Path after clicking Dashboard:', await getPathname())
    if (await getPathname() !== '/admin/dashboard') {
      throw new Error('Expected /admin/dashboard after clicking Dashboard')
    }

    // 13. DASHBOARD METRICS ARE NON-INTERACTIVE & SIDEBAR NAVIGATES TO REQUESTS
    console.log('\n--- Testing Dashboard Open Requests Metric is Non-Interactive ---')
    const metricIsButtonOrLink = await sendCdp(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const cards = Array.from(document.querySelectorAll('.auratio-admin-metric-card'));
        const openReq = cards.find(c => c.textContent.includes('OPEN REQUESTS'));
        if (!openReq) return 'missing';
        if (openReq.tagName === 'BUTTON' || openReq.tagName === 'A') return true;
        if (openReq.getAttribute('role') === 'button' || openReq.getAttribute('role') === 'link') return true;
        if (openReq.onclick !== null) return true;
        return false;
      })()`,
    })
    if (metricIsButtonOrLink.result.value !== false) {
      throw new Error(`Expected OPEN REQUESTS card to be non-interactive, got ${metricIsButtonOrLink.result.value}`)
    }

    // Verify Admin sidebar Requests navigation routes correctly to /admin/requests
    await clickByText('button.auratio-admin-nav-item', 'Requests')
    console.log('Path after clicking Requests sidebar nav:', await getPathname())
    if (await getPathname() !== '/admin/requests') {
      throw new Error('Expected /admin/requests after clicking Requests sidebar nav')
    }

    // Helper functions for semantic targeting
    async function clickQueueOpen(requestId) {
      const expr = `(() => {
        const row = document.querySelector('[data-request-id="${requestId}"]');
        if (!row) throw new Error('Row not found for: ${requestId}');
        const btn = row.querySelector('button.auratio-admin-btn--table-open');
        if (!btn) throw new Error('Open button not found for: ${requestId}');
        btn.click();
        return true;
      })()`
      await sendCdp(ws, 'Runtime.evaluate', { expression: expr })
      await new Promise((r) => setTimeout(r, 300))
    }

    async function clickCandidateSelect(candidateName) {
      const expr = `(() => {
        const btn = document.querySelector('button[data-candidate="${candidateName}"]');
        if (!btn) throw new Error('Select button not found for: ${candidateName}');
        btn.click();
        return true;
      })()`
      await sendCdp(ws, 'Runtime.evaluate', { expression: expr })
      await new Promise((r) => setTimeout(r, 300))
    }

    // 14. NORMAL ASSIGNMENT: Request Queue -> REQ-1042 -> Assign Human -> Assignment Picker
    console.log('\n--- Testing Normal Assignment Flow ---')
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/admin/requests` })
    await new Promise((r) => setTimeout(r, 500))

    // Open REQ-1042
    await clickQueueOpen('REQ-1042')
    console.log('Path after opening REQ-1042:', await getPathname())
    if (await getPathname() !== '/admin/requests/req-1042') {
      throw new Error('Expected /admin/requests/req-1042')
    }

    // Click Assign Human
    await clickByText('button.auratio-admin-btn--primary', 'Assign Human')
    console.log('Path after Assign Human:', await getPathname())
    if (await getPathname() !== '/admin/requests/req-1042/assign') {
      throw new Error('Expected /admin/requests/req-1042/assign')
    }

    // Test Select Farhana Islam -> must navigate to /admin/requests
    await clickCandidateSelect('Farhana Islam')
    console.log('Path after selecting Farhana Islam:', await getPathname())
    if (await getPathname() !== '/admin/requests') {
      throw new Error('Expected /admin/requests after selecting Farhana Islam')
    }

    // Test Select Rakib Hasan -> must navigate to /admin/requests
    await clickQueueOpen('REQ-1042')
    await clickByText('button.auratio-admin-btn--primary', 'Assign Human')
    await clickCandidateSelect('Rakib Hasan')
    console.log('Path after selecting Rakib Hasan:', await getPathname())
    if (await getPathname() !== '/admin/requests') {
      throw new Error('Expected /admin/requests after selecting Rakib Hasan')
    }

    // Test Select Tasnim Noor -> must navigate to /admin/requests
    await clickQueueOpen('REQ-1042')
    await clickByText('button.auratio-admin-btn--primary', 'Assign Human')
    await clickCandidateSelect('Tasnim Noor')
    console.log('Path after selecting Tasnim Noor:', await getPathname())
    if (await getPathname() !== '/admin/requests') {
      throw new Error('Expected /admin/requests after selecting Tasnim Noor')
    }

    // 15. AI ROUTING: REQ-1041 (Assigned AI) & REQ-1034 (Redirected Human)
    console.log('\n--- Testing Request Queue -> REQ-1041 & REQ-1034 ---')
    await clickQueueOpen('REQ-1041')
    console.log('Path after opening REQ-1041:', await getPathname())
    if (await getPathname() !== '/admin/requests/req-1041') {
      throw new Error('Expected /admin/requests/req-1041')
    }
    await clickByText('button.auratio-admin-btn--secondary', 'Back to Queue')
    if (await getPathname() !== '/admin/requests') {
      throw new Error('Expected /admin/requests after Back to Queue from REQ-1041')
    }

    await clickQueueOpen('REQ-1034')
    console.log('Path after opening REQ-1034:', await getPathname())
    if (await getPathname() !== '/admin/requests/req-1034') {
      throw new Error('Expected /admin/requests/req-1034')
    }
    await clickByText('button.auratio-admin-btn--secondary', 'Back to Queue')
    if (await getPathname() !== '/admin/requests') {
      throw new Error('Expected /admin/requests after Back to Queue from REQ-1034')
    }

    // 16. REQ-1038 Entity Details & Canonical Reassignment Flow
    console.log('\n--- Testing REQ-1038 Entity Details ---')
    await clickQueueOpen('REQ-1038')
    console.log('Path after opening REQ-1038:', await getPathname())
    if (await getPathname() !== '/admin/requests/req-1038') {
      throw new Error('Expected /admin/requests/req-1038 when opening REQ-1038')
    }
    let bodyText = await getBodyText()
    if (!bodyText.includes('REQ-1038') || !bodyText.includes('Taylor Kim') || !bodyText.includes('Extempore') || !bodyText.includes('Assigned Human')) {
      throw new Error('REQ-1038 missing Taylor Kim / Extempore / Assigned Human details')
    }
    await clickByText('button.auratio-admin-btn--secondary', 'Back to Queue')
    if (await getPathname() !== '/admin/requests') {
      throw new Error('Expected /admin/requests after Back to Queue from REQ-1038')
    }

    console.log('\n--- Testing Reassignment Flow ---')
    // Reset mock assignment state in browser
    await sendCdp(ws, 'Runtime.evaluate', {
      expression: `window.__resetHE0142Reassignment && window.__resetHE0142Reassignment()`,
    })

    // Navigate to /admin/requests/req-1042/reassign
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/admin/requests/req-1042/reassign` })
    await new Promise((r) => setTimeout(r, 400))
    console.log('Path after navigating to reassignment:', await getPathname())
    if (await getPathname() !== '/admin/requests/req-1042/reassign') {
      throw new Error('Expected /admin/requests/req-1042/reassign')
    }

    // Cancel: returns to /admin/requests, ownership unmutated
    await clickByText('button.auratio-admin-btn--secondary', 'Cancel')
    console.log('Path after Cancel:', await getPathname())
    if (await getPathname() !== '/admin/requests') {
      throw new Error('Expected /admin/requests after Cancel')
    }
    const stateAfterCancel = await sendCdp(ws, 'Runtime.evaluate', {
      expression: `JSON.stringify(window.__getHE0142AssignmentState())`,
    })
    const cancelObj = JSON.parse(stateAfterCancel.result.value)
    console.log('State after Cancel:', cancelObj)
    if (cancelObj.activeOwner !== 'Farhana Islam' || cancelObj.supersededOwner !== null) {
      throw new Error(`Expected unmutated ownership after Cancel, got ${JSON.stringify(cancelObj)}`)
    }

    // Re-enter and confirm reassignment
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/admin/requests/req-1042/reassign` })
    await new Promise((r) => setTimeout(r, 400))

    await clickByText('button.auratio-admin-btn--primary', 'Confirm Reassignment')
    console.log('Path after Confirm Reassignment:', await getPathname())
    if (await getPathname() !== '/admin/requests') {
      throw new Error('Expected /admin/requests after Confirm Reassignment')
    }
    const stateAfterConfirm = await sendCdp(ws, 'Runtime.evaluate', {
      expression: `JSON.stringify(window.__getHE0142AssignmentState())`,
    })
    const confirmObj = JSON.parse(stateAfterConfirm.result.value)
    console.log('State after Confirm:', confirmObj)
    if (confirmObj.supersededOwner !== 'Farhana Islam' || confirmObj.activeOwner !== 'Nadia Rahman') {
      throw new Error(`Expected superseded Farhana and active Nadia, got ${JSON.stringify(confirmObj)}`)
    }

    // 17. EVALUATION RECORDS -> MODERATION REVIEW, PROCESSING HUMAN & APPROVED AI
    console.log('\n--- Testing Evaluation Records Detail Routes ---')
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/admin/evaluations` })
    await new Promise((r) => setTimeout(r, 500))

    // Open SUB-8821 (Row 0 -> Moderation Review)
    await sendCdp(ws, 'Runtime.evaluate', {
      expression: `document.querySelectorAll('button.auratio-admin-btn--secondary')[0].click()`,
    })
    await new Promise((r) => setTimeout(r, 300))
    console.log('Path after opening SUB-8821:', await getPathname())
    if (await getPathname() !== '/admin/moderation/sub-8821') {
      throw new Error('Expected /admin/moderation/sub-8821 when opening SUB-8821')
    }

    // Return to evaluations
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/admin/evaluations` })
    await new Promise((r) => setTimeout(r, 500))

    // Open SUB-8834 (Row 1 -> Processing Human)
    await sendCdp(ws, 'Runtime.evaluate', {
      expression: `document.querySelectorAll('button.auratio-admin-btn--secondary')[1].click()`,
    })
    await new Promise((r) => setTimeout(r, 300))
    console.log('Path after opening SUB-8834:', await getPathname())
    if (await getPathname() !== '/admin/evaluations/sub-8834') {
      throw new Error('Expected /admin/evaluations/sub-8834')
    }

    await clickByText('button.auratio-admin-btn--primary', 'Back to Evaluations')
    if (await getPathname() !== '/admin/evaluations') {
      throw new Error('Expected /admin/evaluations after Back to Evaluations')
    }

    // Open SUB-8798 (Row 2 -> Approved AI)
    await sendCdp(ws, 'Runtime.evaluate', {
      expression: `document.querySelectorAll('button.auratio-admin-btn--secondary')[2].click()`,
    })
    await new Promise((r) => setTimeout(r, 300))
    console.log('Path after opening SUB-8798:', await getPathname())
    if (await getPathname() !== '/admin/evaluations/sub-8798') {
      throw new Error('Expected /admin/evaluations/sub-8798')
    }

    await clickByText('button.auratio-admin-btn--primary', 'Back to Evaluations')
    if (await getPathname() !== '/admin/evaluations') {
      throw new Error('Expected /admin/evaluations after Back to Evaluations')
    }

    // 18. ADMIN SIDEBAR NAVIGATION
    console.log('\n--- Testing Admin Sidebar Navigation Across All 7 Destinations ---')
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/admin/dashboard` })
    await new Promise((r) => setTimeout(r, 500))

    const navDestinations = [
      { text: 'Requests', path: '/admin/requests' },
      { text: 'Evaluations', path: '/admin/evaluations' },
      { text: 'Moderation', path: '/admin/moderation' },
      { text: 'Volunteers', path: '/admin/volunteers' },
      { text: 'Events', path: '/admin/events' },
      { text: 'Audit Log', path: '/admin/audit' },
      { text: 'Dashboard', path: '/admin/dashboard' },
    ]

    for (const dest of navDestinations) {
      await clickByText('button.auratio-admin-nav-item', dest.text)
      const current = await getPathname()
      console.log(`Sidebar clicked ${dest.text} -> ${current}`)
      if (current !== dest.path) {
        throw new Error(`Expected sidebar navigation to ${dest.path}, got ${current}`)
      }
    }

    // 19. MODERATION FLOWS
    console.log('\n--- Testing Moderation Flows ---')
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/admin/moderation` })
    await new Promise((r) => setTimeout(r, 500))

    // Queue -> Review
    await sendCdp(ws, 'Runtime.evaluate', {
      expression: `document.querySelectorAll('button.auratio-admin-btn--secondary')[0].click()`,
    })
    await new Promise((r) => setTimeout(r, 300))
    if (await getPathname() !== '/admin/moderation/sub-8821') {
      throw new Error('Expected /admin/moderation/sub-8821 from Queue Open')
    }

    // Review -> Approve -> Cancel -> Review
    await clickByText('button.auratio-admin-btn--primary', 'Approve')
    if (await getPathname() !== '/admin/moderation/sub-8821/approve') {
      throw new Error('Expected /admin/moderation/sub-8821/approve')
    }
    await clickByText('button.auratio-admin-btn--secondary', 'Cancel')
    if (await getPathname() !== '/admin/moderation/sub-8821') {
      throw new Error('Expected /admin/moderation/sub-8821 after Cancel approval')
    }

    // Review -> Approve -> Confirm Approval -> Evaluations
    await clickByText('button.auratio-admin-btn--primary', 'Approve')
    await clickByText('button.auratio-admin-btn--primary', 'Confirm Approval')
    if (await getPathname() !== '/admin/evaluations') {
      throw new Error('Expected /admin/evaluations after Confirm Approval')
    }

    // Review -> Reject -> Cancel -> Review
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/admin/moderation/sub-8821` })
    await new Promise((r) => setTimeout(r, 500))
    await clickByText('button.auratio-admin-btn--secondary', 'Reject')
    if (await getPathname() !== '/admin/moderation/sub-8821/reject') {
      throw new Error('Expected /admin/moderation/sub-8821/reject')
    }
    await clickByText('button.auratio-admin-btn--secondary', 'Cancel')
    if (await getPathname() !== '/admin/moderation/sub-8821') {
      throw new Error('Expected /admin/moderation/sub-8821 after Cancel rejection')
    }

    // Review -> Reject -> Reason validation
    await clickByText('button.auratio-admin-btn--secondary', 'Reject')
    // 1) Empty reason: click Confirm Rejection must NOT navigate
    await clickByText('button.auratio-admin-btn--primary', 'Confirm Rejection')
    if (await getPathname() !== '/admin/moderation/sub-8821/reject') {
      throw new Error('Expected empty reason to stay on /admin/moderation/sub-8821/reject')
    }
    // 2) Whitespace-only reason: must NOT navigate
    await sendCdp(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const ta = document.querySelector('textarea.auratio-admin-textarea');
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
        nativeSetter.call(ta, '    ');
        ta.dispatchEvent(new Event('input', { bubbles: true }));
        ta.dispatchEvent(new Event('change', { bubbles: true }));
      })()`,
    })
    await new Promise((r) => setTimeout(r, 200))
    await clickByText('button.auratio-admin-btn--primary', 'Confirm Rejection')
    if (await getPathname() !== '/admin/moderation/sub-8821/reject') {
      throw new Error('Expected whitespace-only reason to stay on /admin/moderation/sub-8821/reject')
    }
    // 3) Valid reason: must navigate to /admin/evaluations
    await sendCdp(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const ta = document.querySelector('textarea.auratio-admin-textarea');
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
        nativeSetter.call(ta, 'Evidence is insufficient to support criterion score.');
        ta.dispatchEvent(new Event('input', { bubbles: true }));
        ta.dispatchEvent(new Event('change', { bubbles: true }));
      })()`,
    })
    await new Promise((r) => setTimeout(r, 200))
    await clickByText('button.auratio-admin-btn--primary', 'Confirm Rejection')
    if (await getPathname() !== '/admin/evaluations') {
      throw new Error('Expected /admin/evaluations after valid Confirm Rejection')
    }

    // Review -> Request Re-review -> Cancel -> Review
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/admin/moderation/sub-8821` })
    await new Promise((r) => setTimeout(r, 500))
    await clickByText('button.auratio-admin-btn--secondary', 'Request Re-review')
    if (await getPathname() !== '/admin/moderation/sub-8821/re-review') {
      throw new Error('Expected /admin/moderation/sub-8821/re-review')
    }
    await clickByText('button.auratio-admin-btn--secondary', 'Cancel')
    if (await getPathname() !== '/admin/moderation/sub-8821') {
      throw new Error('Expected /admin/moderation/sub-8821 after Cancel re-review')
    }

    // Review -> Request Re-review -> Confirm -> /volunteer/evaluation/sub-8821/reopened
    await clickByText('button.auratio-admin-btn--secondary', 'Request Re-review')
    await clickByText('button.auratio-admin-btn--primary', 'Request Re-review')
    if (await getPathname() !== '/volunteer/evaluation/sub-8821/reopened') {
      throw new Error('Expected /volunteer/evaluation/sub-8821/reopened after Confirm Request Re-review')
    }

    // 20. VOLUNTEER FLOWS
    console.log('\n--- Testing Volunteer Evaluators Flows ---')
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/admin/volunteers` })
    await new Promise((r) => setTimeout(r, 500))

    // Directory -> Invite -> Cancel -> Directory
    await clickByText('button.auratio-admin-btn--primary', 'Invite Volunteer')
    if (await getPathname() !== '/admin/volunteers/invite') {
      throw new Error('Expected /admin/volunteers/invite')
    }
    await clickByText('button.auratio-admin-btn--secondary', 'Cancel')
    if (await getPathname() !== '/admin/volunteers') {
      throw new Error('Expected /admin/volunteers after Cancel invite')
    }

    // Invite -> Choose / Edit Tracks -> Track Eligibility
    await clickByText('button.auratio-admin-btn--primary', 'Invite Volunteer')
    await clickByText('button.auratio-admin-btn--primary', 'Choose / Edit Tracks')
    if (await getPathname() !== '/admin/volunteers/farhana/tracks') {
      throw new Error('Expected /admin/volunteers/farhana/tracks')
    }

    // Invite -> Send Volunteer Invite -> Directory
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/admin/volunteers/invite` })
    await new Promise((r) => setTimeout(r, 500))

    // Verify empty fields block submit
    await clickByText('button.auratio-admin-btn--primary', 'Send Volunteer Invite')
    if (await getPathname() !== '/admin/volunteers/invite') {
      throw new Error('Expected /admin/volunteers/invite when fields are empty')
    }

    // Enter name and email and send invite
    await setInputValue('#invite-display-name', 'Tariq Rahman')
    await setInputValue('#invite-email', 'tariq@example.com')
    await clickByText('button.auratio-admin-btn--primary', 'Send Volunteer Invite')
    if (await getPathname() !== '/admin/volunteers') {
      throw new Error('Expected /admin/volunteers after Send Volunteer Invite')
    }

    // Directory -> Farhana Open -> Volunteer Account
    await sendCdp(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const open = btns.find(b => b.textContent.trim() === 'Open');
        if (open) open.click();
      })()`,
    })
    await new Promise((r) => setTimeout(r, 300))
    if (await getPathname() !== '/admin/volunteers/farhana') {
      throw new Error('Expected /admin/volunteers/farhana from directory Open')
    }

    // Volunteer Account -> Availability Override -> Cancel -> Volunteer Account
    await clickByText('button.auratio-admin-btn--primary', 'Override Availability')
    if (await getPathname() !== '/admin/volunteers/farhana/availability') {
      throw new Error('Expected /admin/volunteers/farhana/availability')
    }
    await clickByText('button.auratio-admin-btn--secondary', 'Cancel')
    if (await getPathname() !== '/admin/volunteers/farhana') {
      throw new Error('Expected /admin/volunteers/farhana after Cancel override')
    }

    // Volunteer Account -> Availability Override -> Apply -> Volunteer Account
    await clickByText('button.auratio-admin-btn--primary', 'Override Availability')
    await clickByText('button.auratio-admin-btn--primary', 'Apply Override')
    if (await getPathname() !== '/admin/volunteers/farhana') {
      throw new Error('Expected /admin/volunteers/farhana after Apply Override')
    }

    // 21. TRACK ELIGIBILITY FUNCTIONAL FLOWS & CROSS-STATE ISOLATION
    console.log('\n--- Testing Track Eligibility Functional Flows & Cross-State Isolation ---')
    
    // Existing Track Tests: Direct-load Interactive tracks (Extempore toggle)
    await sendCdp(ws, 'Runtime.evaluate', {
      expression: `(() => {
        window.__resetFarhanaTrackEligibility && window.__resetFarhanaTrackEligibility();
        window.__resetInviteVolunteerTrackDraft && window.__resetInviteVolunteerTrackDraft();
      })()`,
    })
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/admin/volunteers/farhana/tracks` })
    await new Promise((r) => setTimeout(r, 500))

    async function getTrackCount() {
      const res = await sendCdp(ws, 'Runtime.evaluate', {
        expression: `(() => {
          const el = Array.from(document.querySelectorAll('div')).find(d => d.textContent.includes('selected • minimum 1 required'));
          if (!el) return -1;
          const m = el.textContent.match(/(\\d+)\\s+selected/);
          return m ? parseInt(m[1], 10) : -1;
        })()`,
      })
      return res.result.value
    }

    async function toggleTrackByName(name) {
      await sendCdp(ws, 'Runtime.evaluate', {
        expression: `(() => {
          const btns = Array.from(document.querySelectorAll('button[role="checkbox"]'));
          const btn = btns.find(b => b.textContent.includes(${JSON.stringify(name)}));
          if (btn) btn.click();
        })()`,
      })
      await new Promise((r) => setTimeout(r, 200))
    }

    const initialCount = await getTrackCount()
    console.log('Initial track count:', initialCount)
    if (initialCount !== 3) {
      throw new Error(`Expected initial track count 3, got ${initialCount}`)
    }

    // Click Extempore -> select
    await toggleTrackByName('Extempore')
    const countAfterSelect = await getTrackCount()
    console.log('Count after selecting Extempore:', countAfterSelect)
    if (countAfterSelect !== 4) {
      throw new Error(`Expected count 4 after selecting Extempore, got ${countAfterSelect}`)
    }

    // Click Extempore again -> unselect
    await toggleTrackByName('Extempore')
    const countAfterUnselect = await getTrackCount()
    console.log('Count after unselecting Extempore:', countAfterUnselect)
    if (countAfterUnselect !== 3) {
      throw new Error(`Expected count 3 after unselecting Extempore, got ${countAfterUnselect}`)
    }

    // Existing Track Tests: Minimum-one guard
    await toggleTrackByName('Informative') // 2
    await toggleTrackByName('Persuasive')  // 1
    const countAtOne = await getTrackCount()
    console.log('Count at one track remaining:', countAtOne)
    if (countAtOne !== 1) {
      throw new Error(`Expected count 1, got ${countAtOne}`)
    }

    // Attempt to deselect the last remaining track (Business Pitch / Sales Pitch)
    await toggleTrackByName('Business Pitch / Sales Pitch')
    const countAfterAttempt = await getTrackCount()
    console.log('Count after attempting to deselect last track:', countAfterAttempt)
    if (countAfterAttempt !== 1) {
      throw new Error(`Expected count to remain 1 due to minimum-one guard, got ${countAfterAttempt}`)
    }

    // Cancel to leave without saving the 1-track state
    await clickByText('button.auratio-admin-btn--secondary', 'Cancel')

    // Reset Farhana tracks to canonical 3
    await sendCdp(ws, 'Runtime.evaluate', {
      expression: `window.__resetFarhanaTrackEligibility && window.__resetFarhanaTrackEligibility()`,
    })

    // Farhana Cancel BACK (from Volunteer Account)
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/admin/volunteers/farhana` })
    await new Promise((r) => setTimeout(r, 500))
    await clickByText('button.auratio-admin-btn--primary', 'Manage Track Eligibility')
    if (await getPathname() !== '/admin/volunteers/farhana/tracks') {
      throw new Error('Expected /admin/volunteers/farhana/tracks')
    }
    await toggleTrackByName('Extempore')
    if (await getTrackCount() !== 4) {
      throw new Error('Expected count 4 after selecting Extempore')
    }
    await clickByText('button.auratio-admin-btn--secondary', 'Cancel')
    if (await getPathname() !== '/admin/volunteers/farhana') {
      throw new Error('Expected BACK to /admin/volunteers/farhana after Cancel')
    }
    const accountTracksText = await sendCdp(ws, 'Runtime.evaluate', {
      expression: `document.body.innerText`,
    })
    if (accountTracksText.result.value.includes('Extempore')) {
      throw new Error('Expected Extempore NOT to be saved on Volunteer Account after Cancel')
    }

    // Farhana Save BACK (from Volunteer Account)
    await clickByText('button.auratio-admin-btn--primary', 'Manage Track Eligibility')
    await toggleTrackByName('Extempore')
    await clickByText('button.auratio-admin-btn--primary', 'Save Eligibility')
    if (await getPathname() !== '/admin/volunteers/farhana') {
      throw new Error('Expected BACK to /admin/volunteers/farhana after Save Eligibility')
    }
    const accountTracksAfterSave = await sendCdp(ws, 'Runtime.evaluate', {
      expression: `document.body.innerText`,
    })
    if (!accountTracksAfterSave.result.value.includes('Extempore')) {
      throw new Error('Expected Extempore to be saved and visible on Volunteer Account')
    }
    // Restore canonical tracks
    await sendCdp(ws, 'Runtime.evaluate', {
      expression: `window.__resetFarhanaTrackEligibility && window.__resetFarhanaTrackEligibility()`,
    })

    // CASE A — INVITE SAVE IS ISOLATED
    console.log('\n--- Case A: Invite Save is Isolated ---')
    await sendCdp(ws, 'Runtime.evaluate', {
      expression: `(() => {
        window.__resetFarhanaTrackEligibility && window.__resetFarhanaTrackEligibility();
        window.__resetInviteVolunteerTrackDraft && window.__resetInviteVolunteerTrackDraft();
      })()`,
    })
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/admin/volunteers/invite` })
    await new Promise((r) => setTimeout(r, 500))
    await clickByText('button.auratio-admin-btn--primary', 'Choose / Edit Tracks')
    if (await getPathname() !== '/admin/volunteers/farhana/tracks') {
      throw new Error('Expected /admin/volunteers/farhana/tracks from Invite Volunteer')
    }
    // Verify title in invite mode is context-appropriate
    const inviteModeTitle = await sendCdp(ws, 'Runtime.evaluate', {
      expression: `document.querySelector('h2.auratio-admin-page-title').textContent`,
    })
    console.log('Invite mode Track Eligibility title:', inviteModeTitle.result.value)
    if (!inviteModeTitle.result.value.includes('Choose Volunteer Evaluator track eligibility')) {
      throw new Error('Expected context-correct heading in invite mode')
    }

    await toggleTrackByName('Extempore')
    await clickByText('button.auratio-admin-btn--primary', 'Save Eligibility')
    if (await getPathname() !== '/admin/volunteers/invite') {
      throw new Error('Expected BACK to /admin/volunteers/invite after Save')
    }

    // Verify Invite screen displays 4 selected and includes Extempore
    const inviteTextA = await sendCdp(ws, 'Runtime.evaluate', { expression: `document.body.innerText` })
    if (!inviteTextA.result.value.includes('4 selected • minimum 1')) {
      throw new Error('Expected 4 selected on Invite Volunteer screen')
    }
    if (!inviteTextA.result.value.includes('Extempore')) {
      throw new Error('Expected Extempore visible on Invite Volunteer screen')
    }

    // Verify Farhana state remains canonical 3
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/admin/volunteers/farhana` })
    await new Promise((r) => setTimeout(r, 500))
    const farhanaTextA = await sendCdp(ws, 'Runtime.evaluate', { expression: `document.body.innerText` })
    if (farhanaTextA.result.value.includes('Extempore')) {
      throw new Error('Expected Farhana account NOT to include Extempore')
    }

    // CASE B — FARHANA SAVE IS ISOLATED
    console.log('\n--- Case B: Farhana Save is Isolated ---')
    await sendCdp(ws, 'Runtime.evaluate', {
      expression: `(() => {
        window.__resetFarhanaTrackEligibility && window.__resetFarhanaTrackEligibility();
        window.__resetInviteVolunteerTrackDraft && window.__resetInviteVolunteerTrackDraft();
      })()`,
    })
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/admin/volunteers/farhana` })
    await new Promise((r) => setTimeout(r, 500))
    await clickByText('button.auratio-admin-btn--primary', 'Manage Track Eligibility')
    await toggleTrackByName('Extempore')
    await clickByText('button.auratio-admin-btn--primary', 'Save Eligibility')
    if (await getPathname() !== '/admin/volunteers/farhana') {
      throw new Error('Expected BACK to /admin/volunteers/farhana')
    }
    const farhanaTextB = await sendCdp(ws, 'Runtime.evaluate', { expression: `document.body.innerText` })
    if (!farhanaTextB.result.value.includes('Extempore')) {
      throw new Error('Expected Farhana account to include Extempore')
    }
    // Verify Invite Volunteer still displays 3 selected and no Extempore
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/admin/volunteers/invite` })
    await new Promise((r) => setTimeout(r, 500))
    const inviteTextB = await sendCdp(ws, 'Runtime.evaluate', { expression: `document.body.innerText` })
    if (!inviteTextB.result.value.includes('3 selected • minimum 1')) {
      throw new Error('Expected 3 selected on Invite Volunteer screen')
    }
    if (inviteTextB.result.value.includes('Extempore')) {
      throw new Error('Expected Extempore absent on Invite Volunteer screen')
    }

    // CASE C — INVITE CANCEL
    console.log('\n--- Case C: Invite Cancel ---')
    await sendCdp(ws, 'Runtime.evaluate', {
      expression: `window.__resetInviteVolunteerTrackDraft && window.__resetInviteVolunteerTrackDraft()`,
    })
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/admin/volunteers/invite` })
    await new Promise((r) => setTimeout(r, 500))
    await clickByText('button.auratio-admin-btn--primary', 'Choose / Edit Tracks')
    await toggleTrackByName('Extempore')
    await clickByText('button.auratio-admin-btn--secondary', 'Cancel')
    if (await getPathname() !== '/admin/volunteers/invite') {
      throw new Error('Expected BACK to /admin/volunteers/invite after Cancel')
    }
    const inviteTextC = await sendCdp(ws, 'Runtime.evaluate', { expression: `document.body.innerText` })
    if (!inviteTextC.result.value.includes('3 selected • minimum 1')) {
      throw new Error('Expected 3 selected on Invite Volunteer after Cancel')
    }
    if (inviteTextC.result.value.includes('Extempore')) {
      throw new Error('Expected Extempore absent after Cancel')
    }

    // Reset both states before proceeding
    await sendCdp(ws, 'Runtime.evaluate', {
      expression: `(() => {
        window.__resetFarhanaTrackEligibility && window.__resetFarhanaTrackEligibility();
        window.__resetInviteVolunteerTrackDraft && window.__resetInviteVolunteerTrackDraft();
      })()`,
    })

    // 22. EVENT MANAGEMENT FLOWS
    console.log('\n--- Testing Event Management Flows ---')
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/admin/events` })
    await new Promise((r) => setTimeout(r, 500))

    // Event Management -> Create Event -> Editor
    await clickByText('button.auratio-admin-btn--primary', 'Create Event')
    if (await getPathname() !== '/admin/events/editor') {
      throw new Error('Expected /admin/events/editor from Create Event')
    }
    await clickByText('button.auratio-admin-btn--secondary', 'Save Draft')
    if (await getPathname() !== '/admin/events') {
      throw new Error('Expected /admin/events after Save Draft')
    }

    // Event Management -> Edit -> Editor
    await sendCdp(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const edit = btns.find(b => b.textContent.trim() === 'Edit');
        if (edit) edit.click();
      })()`,
    })
    await new Promise((r) => setTimeout(r, 300))
    if (await getPathname() !== '/admin/events/editor') {
      throw new Error('Expected /admin/events/editor from Edit action')
    }
    await clickByText('button.auratio-admin-btn--secondary', 'Save Draft')
    if (await getPathname() !== '/admin/events') {
      throw new Error('Expected /admin/events after Save Draft')
    }

    // 23. SUPER ADMIN JOURNEY & GOVERNANCE
    console.log('\n--- Testing Super Admin Journey & Governance ---')

    // Role Authorization -> Super Admin workspace
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/auth/role-authorization` })
    await new Promise((r) => setTimeout(r, 500))
    await clickByText('button.auratio-auth-btn', 'Open resolved Super Admin workspace')
    if (await getPathname() !== '/super-admin/admin-accounts') {
      throw new Error(`Expected /super-admin/admin-accounts after clicking Super Admin workspace, got ${await getPathname()}`)
    }

    // Reset state to ensure baseline
    await sendCdp(ws, 'Runtime.evaluate', {
      expression: 'window.__auratioResetSuperAdmin ? window.__auratioResetSuperAdmin() : true',
    })
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/super-admin/admin-accounts` })
    await new Promise((r) => setTimeout(r, 500))

    // Admin Accounts -> Invite Admin
    await clickByText('button.auratio-admin-btn--primary', 'Invite Admin')
    if (await getPathname() !== '/super-admin/admin-accounts/invite') {
      throw new Error(`Expected /super-admin/admin-accounts/invite from Invite Admin, got ${await getPathname()}`)
    }

    // Invite Admin -> Cancel -> Admin Accounts
    await clickByText('button.auratio-admin-btn--secondary', 'Cancel')
    if (await getPathname() !== '/super-admin/admin-accounts') {
      throw new Error(`Expected /super-admin/admin-accounts after Cancel, got ${await getPathname()}`)
    }

    // Invite Admin -> Send Admin Invite -> Admin Accounts
    await clickByText('button.auratio-admin-btn--primary', 'Invite Admin')
    if (await getPathname() !== '/super-admin/admin-accounts/invite') {
      throw new Error(`Expected /super-admin/admin-accounts/invite, got ${await getPathname()}`)
    }
    await clickByText('button.auratio-admin-btn--primary', 'Send Admin Invite')
    if (await getPathname() !== '/super-admin/admin-accounts') {
      throw new Error(`Expected /super-admin/admin-accounts after Send Admin Invite, got ${await getPathname()}`)
    }

    // Imran Open -> Admin Account (resolved to Imran)
    await sendCdp(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const btns = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.trim() === 'Open');
        if (btns.length > 1) btns[1].click();
      })()`,
    })
    await new Promise((r) => setTimeout(r, 300))
    if (await getPathname() !== '/super-admin/admin-accounts/imran') {
      throw new Error(`Expected /super-admin/admin-accounts/imran from Imran Open, got ${await getPathname()}`)
    }
    await clickByText('button.auratio-admin-btn--secondary', 'Back to Accounts')
    if (await getPathname() !== '/super-admin/admin-accounts') {
      throw new Error(`Expected /super-admin/admin-accounts after Back to Accounts, got ${await getPathname()}`)
    }

    // CASE A — SAVE PERSISTS
    console.log('\n--- Testing Nadia Profile Save Persistence (Case A) ---')
    await sendCdp(ws, 'Runtime.evaluate', {
      expression: 'window.__auratioResetSuperAdmin ? window.__auratioResetSuperAdmin() : true',
    })
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/super-admin/admin-accounts/nadia` })
    await new Promise((r) => setTimeout(r, 500))

    await setInputValue('input[aria-label="Display name"]', 'Nadia Rahman QA')
    await setInputValue('input[aria-label="Email / auth identity"]', 'nadia.qa@auratio.org')

    await clickByText('button.auratio-admin-btn--primary', 'Save Changes')
    if (await getPathname() !== '/super-admin/admin-accounts') {
      throw new Error(`Expected /super-admin/admin-accounts after Save Changes, got ${await getPathname()}`)
    }

    // Row-specific assertion: Nadia row specifically contains updated name and email
    const nadiaRowSaved = await sendCdp(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const row = document.querySelector('[data-testid="admin-account-row-nadia"]');
        return row ? row.innerText : '';
      })()`,
    })
    console.log('Nadia row after Save Changes:', nadiaRowSaved.result.value)
    if (!nadiaRowSaved.result.value.includes('Nadia Rahman QA') || !nadiaRowSaved.result.value.includes('nadia.qa@auratio.org')) {
      throw new Error(`Expected Nadia row to contain "Nadia Rahman QA" and "nadia.qa@auratio.org", got: ${nadiaRowSaved.result.value}`)
    }

    // Reopen Nadia
    await sendCdp(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const row = document.querySelector('[data-testid="admin-account-row-nadia"]');
        const btn = row ? row.querySelector('button') : null;
        if (btn) btn.click();
      })()`,
    })
    await new Promise((r) => setTimeout(r, 400))
    if (await getPathname() !== '/super-admin/admin-accounts/nadia') {
      throw new Error(`Expected /super-admin/admin-accounts/nadia after reopening Nadia, got ${await getPathname()}`)
    }

    // Assert the two inputs contain the saved values
    const nadiaInputsCheck = await sendCdp(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const nameInput = document.querySelector('input[aria-label="Display name"]');
        const emailInput = document.querySelector('input[aria-label="Email / auth identity"]');
        return JSON.stringify({
          displayName: nameInput ? nameInput.value : '',
          email: emailInput ? emailInput.value : '',
        });
      })()`,
    })
    const nadiaInputs = JSON.parse(nadiaInputsCheck.result.value)
    console.log('Reopened Nadia inputs:', nadiaInputs)
    if (nadiaInputs.displayName !== 'Nadia Rahman QA' || nadiaInputs.email !== 'nadia.qa@auratio.org') {
      throw new Error(`Expected inputs to have saved values, got: ${JSON.stringify(nadiaInputs)}`)
    }

    // CASE B — BACK DOES NOT SAVE
    console.log('\n--- Testing Nadia Profile Back Without Save (Case B) ---')
    await sendCdp(ws, 'Runtime.evaluate', {
      expression: 'window.__auratioResetSuperAdmin ? window.__auratioResetSuperAdmin() : true',
    })
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/super-admin/admin-accounts/nadia` })
    await new Promise((r) => setTimeout(r, 500))

    await setInputValue('input[aria-label="Display name"]', 'Nadia Rahman Unsaved')
    await setInputValue('input[aria-label="Email / auth identity"]', 'unsaved@auratio.org')

    // Click Back to Accounts without saving
    await clickByText('button.auratio-admin-btn--secondary', 'Back to Accounts')
    if (await getPathname() !== '/super-admin/admin-accounts') {
      throw new Error(`Expected /super-admin/admin-accounts after Back to Accounts, got ${await getPathname()}`)
    }

    // Assert canonical Nadia values remain unchanged in directory
    const nadiaRowUnsaved = await sendCdp(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const row = document.querySelector('[data-testid="admin-account-row-nadia"]');
        return row ? row.innerText : '';
      })()`,
    })
    console.log('Nadia row after Back without Save:', nadiaRowUnsaved.result.value)
    if (!nadiaRowUnsaved.result.value.includes('Nadia Rahman') || nadiaRowUnsaved.result.value.includes('Nadia Rahman Unsaved') || nadiaRowUnsaved.result.value.includes('unsaved@auratio.org')) {
      throw new Error(`Expected Nadia row to retain canonical values, got: ${nadiaRowUnsaved.result.value}`)
    }

    // DEACTIVATION CANCEL FLOW
    console.log('\n--- Testing Deactivation Cancel Flow ---')
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/super-admin/admin-accounts/nadia` })
    await new Promise((r) => setTimeout(r, 500))
    await clickByText('button.auratio-admin-btn--secondary', 'Deactivate…')
    if (await getPathname() !== '/super-admin/admin-accounts/nadia/deactivate') {
      throw new Error(`Expected /super-admin/admin-accounts/nadia/deactivate from Deactivate…, got ${await getPathname()}`)
    }
    await clickByText('button.auratio-admin-btn--secondary', 'Cancel')
    if (await getPathname() !== '/super-admin/admin-accounts/nadia') {
      throw new Error(`Expected /super-admin/admin-accounts/nadia after Cancel, got ${await getPathname()}`)
    }
    // Verify Nadia remains Active
    const nadiaActiveCheck = await sendCdp(ws, 'Runtime.evaluate', {
      expression: 'document.body.innerText.includes("Active")',
    })
    if (!nadiaActiveCheck.result.value) {
      throw new Error('Expected Nadia to remain Active after Cancel')
    }

    // DEACTIVATION CONFIRM FLOW & HARDENED ROW-SPECIFIC ASSERTIONS
    console.log('\n--- Testing Deactivation Confirm Flow & Row-Specific Assertions ---')
    await clickByText('button.auratio-admin-btn--secondary', 'Deactivate…')
    if (await getPathname() !== '/super-admin/admin-accounts/nadia/deactivate') {
      throw new Error(`Expected /super-admin/admin-accounts/nadia/deactivate, got ${await getPathname()}`)
    }
    await clickByText('button.auratio-admin-btn--primary', 'Confirm Deactivation')
    if (await getPathname() !== '/super-admin/admin-accounts') {
      throw new Error(`Expected /super-admin/admin-accounts after Confirm Deactivation, got ${await getPathname()}`)
    }

    // HARDENED ASSERTION: Check Nadia row specifically
    const nadiaDeactCheck = await sendCdp(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const row = document.querySelector('[data-testid="admin-account-row-nadia"]');
        return row ? row.innerText : '';
      })()`,
    })
    console.log('Nadia row after Confirm Deactivation:', nadiaDeactCheck.result.value)
    if (!nadiaDeactCheck.result.value.includes('Deactivated')) {
      throw new Error(`Expected Nadia row specifically to have Deactivated status, got: ${nadiaDeactCheck.result.value}`)
    }

    // HARDENED ASSERTION: Check Auratio Root row specifically
    const rootCheck = await sendCdp(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const row = document.querySelector('[data-testid="admin-account-row-root"]');
        return row ? row.innerText : '';
      })()`,
    })
    console.log('Root row after deactivation:', rootCheck.result.value)
    if (!rootCheck.result.value.includes('Active') || !rootCheck.result.value.includes('Protected')) {
      throw new Error(`Expected Root row specifically to be Active and Protected, got: ${rootCheck.result.value}`)
    }

    // Admin Accounts -> Root View (Protected Super Admin Account)
    await clickByText('button', 'View')
    if (await getPathname() !== '/super-admin/admin-accounts/root') {
      throw new Error(`Expected /super-admin/admin-accounts/root from View, got ${await getPathname()}`)
    }

    // Assert Root protection: no Save Changes, no Deactivate button
    const rootControlsCheck = await sendCdp(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const hasSave = btns.some(b => b.innerText.includes('Save Changes'));
        const hasDeact = btns.some(b => b.innerText.includes('Deactivate'));
        return JSON.stringify({ hasSave, hasDeact });
      })()`,
    })
    const rootControls = JSON.parse(rootControlsCheck.result.value)
    if (rootControls.hasSave || rootControls.hasDeact) {
      throw new Error(`CRITICAL: Protected Root exposes mutation controls: ${JSON.stringify(rootControls)}`)
    }

    // Back to Accounts from Root
    await clickByText('button.auratio-admin-btn--secondary', 'Back to Accounts')
    if (await getPathname() !== '/super-admin/admin-accounts') {
      throw new Error(`Expected /super-admin/admin-accounts from Root Back to Accounts, got ${await getPathname()}`)
    }

    // Reset state back to baseline
    await sendCdp(ws, 'Runtime.evaluate', {
      expression: 'window.__auratioResetSuperAdmin ? window.__auratioResetSuperAdmin() : true',
    })

    // Permission boundary: verify ordinary Admin sidebar does NOT contain Admin Accounts
    console.log('\n--- Testing Permission Boundary on Ordinary Admin ---')
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/admin/dashboard` })
    await new Promise((r) => setTimeout(r, 500))
    const ordinaryAdminSidebarCheck = await sendCdp(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const sidebar = document.querySelector('.auratio-admin-sidebar');
        return sidebar ? sidebar.innerText.includes('Admin Accounts') : false;
      })()`,
    })
    if (ordinaryAdminSidebarCheck.result.value) {
      throw new Error('CRITICAL PERMISSION LEAK: Ordinary Admin sidebar contains Admin Accounts!')
    }

    // Super Admin inherited navigation
    console.log('\n--- Testing Super Admin Inherited Navigation ---')
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/super-admin/admin-accounts` })
    await new Promise((r) => setTimeout(r, 500))
    await clickByText('button.auratio-admin-nav-item', 'Dashboard')
    if (await getPathname() !== '/admin/dashboard') {
      throw new Error(`Expected /admin/dashboard, got ${await getPathname()}`)
    }

    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/super-admin/admin-accounts` })
    await new Promise((r) => setTimeout(r, 500))
    await clickByText('button.auratio-admin-nav-item', 'Requests')
    if (await getPathname() !== '/admin/requests') {
      throw new Error(`Expected /admin/requests, got ${await getPathname()}`)
    }

    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/super-admin/admin-accounts` })
    await new Promise((r) => setTimeout(r, 500))
    await clickByText('button.auratio-admin-nav-item', 'Evaluations')
    if (await getPathname() !== '/admin/evaluations') {
      throw new Error(`Expected /admin/evaluations, got ${await getPathname()}`)
    }

    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/super-admin/admin-accounts` })
    await new Promise((r) => setTimeout(r, 500))
    await clickByText('button.auratio-admin-nav-item', 'Moderation')
    if (await getPathname() !== '/admin/moderation') {
      throw new Error(`Expected /admin/moderation, got ${await getPathname()}`)
    }

    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/super-admin/admin-accounts` })
    await new Promise((r) => setTimeout(r, 500))
    await clickByText('button.auratio-admin-nav-item', 'Volunteers')
    if (await getPathname() !== '/admin/volunteers') {
      throw new Error(`Expected /admin/volunteers, got ${await getPathname()}`)
    }

    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/super-admin/admin-accounts` })
    await new Promise((r) => setTimeout(r, 500))
    await clickByText('button.auratio-admin-nav-item', 'Events')
    if (await getPathname() !== '/admin/events') {
      throw new Error(`Expected /admin/events, got ${await getPathname()}`)
    }

    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/super-admin/admin-accounts` })
    await new Promise((r) => setTimeout(r, 500))
    await clickByText('button.auratio-admin-nav-item', 'Audit Log')
    if (await getPathname() !== '/admin/audit') {
      throw new Error(`Expected /admin/audit, got ${await getPathname()}`)
    }

    // 25. PORTAL REPAIR BATCH P1 VERIFICATIONS
    console.log('\n--- [P1-1] Testing Admin Event Filter Buttons ---')
    await sendCdp(ws, 'Runtime.evaluate', {
      expression: 'window.__resetAdminEvents && window.__resetAdminEvents()',
    })
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/admin/events` })
    await new Promise((r) => setTimeout(r, 500))

    let eventsBody = await getBodyText()
    if (!eventsBody.includes('Public Speaking Summit') || !eventsBody.includes('Draft Event')) {
      throw new Error('Initial events list should contain both Summit and Draft Event')
    }

    // Click 'Published' filter
    await clickByText('button[data-testid="admin-events-filter-published"]', 'Published')
    await new Promise((r) => setTimeout(r, 400))
    eventsBody = await getBodyText()
    console.log('Events body after clicking Published:', eventsBody)
    if (!eventsBody.includes('Public Speaking Summit') || eventsBody.includes('Draft Event')) {
      throw new Error(`Published filter should show Summit and hide Draft Event. Got:\n${eventsBody}`)
    }

    // Verify aria-pressed
    const publishedPressed = await sendCdp(ws, 'Runtime.evaluate', {
      expression: `document.querySelector('button[data-testid="admin-events-filter-published"]')?.getAttribute('aria-pressed')`,
    })
    if (publishedPressed.result.value !== 'true') {
      throw new Error('Published filter button should have aria-pressed="true"')
    }

    // Click 'All Events' filter
    await clickByText('button[data-testid="admin-events-filter-all"]', 'All Events')
    await new Promise((r) => setTimeout(r, 400))
    eventsBody = await getBodyText()
    if (!eventsBody.includes('Public Speaking Summit') || !eventsBody.includes('Draft Event')) {
      throw new Error('All Events filter should restore both Summit and Draft Event')
    }

    console.log('\n--- [P1-3] Testing SUB-8730 Moderation Queue & Multi-Entity Isolation ---')
    await sendCdp(ws, 'Runtime.evaluate', {
      expression: `window.__resetAllModeration && window.__resetAllModeration()`,
    })
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/admin/moderation` })
    await new Promise((r) => setTimeout(r, 500))

    // Open SUB-8730
    await sendCdp(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const rows = Array.from(document.querySelectorAll('div[style*="height: 76px"]'));
        const targetRow = rows.find(r => r.textContent.includes('SUB-8730'));
        if (targetRow) {
          const btn = targetRow.querySelector('button');
          btn?.click();
        }
      })()`,
    })
    await new Promise((r) => setTimeout(r, 400))
    console.log('Path after opening SUB-8730:', await getPathname())
    if (await getPathname() !== '/admin/moderation/sub-8730') {
      throw new Error('Expected /admin/moderation/sub-8730 when opening SUB-8730')
    }
    let sub8730Body = await getBodyText()
    if (!sub8730Body.includes('SUB-8730') || !sub8730Body.includes('Extempore') || !sub8730Body.includes('Assigned Human evaluator')) {
      throw new Error('SUB-8730 page missing expected entity details (SUB-8730, Extempore, Assigned Human evaluator)')
    }

    // Test SUB-8730 approve cancel
    await clickByText('button.auratio-admin-btn--primary', 'Approve')
    if (await getPathname() !== '/admin/moderation/sub-8730/approve') {
      throw new Error('Expected /admin/moderation/sub-8730/approve')
    }
    let approveBody = await getBodyText()
    if (!approveBody.includes('SUB-8730') || !approveBody.includes('Assigned Human evaluator')) {
      throw new Error('SUB-8730 approve page missing entity binding')
    }
    await clickByText('button.auratio-admin-btn--secondary', 'Cancel')
    if (await getPathname() !== '/admin/moderation/sub-8730') {
      throw new Error('Expected Cancel on SUB-8730 approve to return to /admin/moderation/sub-8730')
    }

    // Test SUB-8730 reject cancel
    await clickByText('button.auratio-admin-btn--secondary', 'Reject')
    if (await getPathname() !== '/admin/moderation/sub-8730/reject') {
      throw new Error('Expected /admin/moderation/sub-8730/reject')
    }
    let rejectBody = await getBodyText()
    if (!rejectBody.includes('SUB-8730')) {
      throw new Error('SUB-8730 reject page missing entity binding')
    }
    await clickByText('button.auratio-admin-btn--secondary', 'Cancel')
    if (await getPathname() !== '/admin/moderation/sub-8730') {
      throw new Error('Expected Cancel on SUB-8730 reject to return to /admin/moderation/sub-8730')
    }

    // Test SUB-8730 re-review cancel
    await clickByText('button.auratio-admin-btn--secondary', 'Request Re-review')
    if (await getPathname() !== '/admin/moderation/sub-8730/re-review') {
      throw new Error('Expected /admin/moderation/sub-8730/re-review')
    }
    let reReviewBody = await getBodyText()
    if (!reReviewBody.includes('SUB-8730') || !reReviewBody.includes('Assigned Human evaluator')) {
      throw new Error('SUB-8730 re-review page missing entity binding')
    }
    await clickByText('button.auratio-admin-btn--secondary', 'Cancel')
    if (await getPathname() !== '/admin/moderation/sub-8730') {
      throw new Error('Expected Cancel on SUB-8730 re-review to return to /admin/moderation/sub-8730')
    }

    // Confirm approval of SUB-8730 and verify isolation from SUB-8821
    await clickByText('button.auratio-admin-btn--primary', 'Approve')
    await clickByText('button.auratio-admin-btn--primary', 'Confirm Approval')
    if (await getPathname() !== '/admin/evaluations') {
      throw new Error('Expected /admin/evaluations after Confirm Approval')
    }
    const modStates = await sendCdp(ws, 'Runtime.evaluate', {
      expression: `JSON.stringify({
        sub8730: window.__getModerationEntityState && window.__getModerationEntityState('SUB-8730'),
        sub8821: window.__getModerationEntityState && window.__getModerationEntityState('SUB-8821')
      })`,
    })
    const parsedModStates = JSON.parse(modStates.result.value)
    if (parsedModStates.sub8730.publicationStatus !== 'Approved' || parsedModStates.sub8821.publicationStatus !== 'Pending Moderation') {
      throw new Error(`Expected SUB-8730 Approved and SUB-8821 Pending Moderation, got ${JSON.stringify(parsedModStates)}`)
    }

    console.log('\n--- [P1-4] Testing Volunteer Directory Entity Routing ---')
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/admin/volunteers` })
    await new Promise((r) => setTimeout(r, 500))

    // Helper to click volunteer row Open button
    async function openVolunteerRow(name) {
      await sendCdp(ws, 'Runtime.evaluate', {
        expression: `(() => {
          const rows = Array.from(document.querySelectorAll('div[style*="height: 48px"]'));
          const target = rows.find(r => r.textContent.includes('${name}'));
          target?.querySelector('button')?.click();
        })()`,
      })
      await new Promise((r) => setTimeout(r, 400))
    }

    // Rakib Hasan
    await openVolunteerRow('Rakib Hasan')
    if (await getPathname() !== '/admin/volunteers/rakib') {
      throw new Error(`Expected /admin/volunteers/rakib, got ${await getPathname()}`)
    }
    let volBody = await getBodyText()
    if (!volBody.includes('Rakib Hasan') || !volBody.includes('Active')) {
      throw new Error('Rakib volunteer page missing Rakib Hasan or Active status')
    }

    // Mehnaz Karim
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/admin/volunteers` })
    await new Promise((r) => setTimeout(r, 400))
    await openVolunteerRow('Mehnaz Karim')
    if (await getPathname() !== '/admin/volunteers/mehnaz') {
      throw new Error(`Expected /admin/volunteers/mehnaz, got ${await getPathname()}`)
    }
    volBody = await getBodyText()
    if (!volBody.includes('Mehnaz Karim') || !volBody.includes('Active')) {
      throw new Error('Mehnaz volunteer page missing Mehnaz Karim or Active status')
    }

    // Nusrat Jahan (Deactivated)
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/admin/volunteers` })
    await new Promise((r) => setTimeout(r, 400))
    await openVolunteerRow('Nusrat Jahan')
    if (await getPathname() !== '/admin/volunteers/nusrat') {
      throw new Error(`Expected /admin/volunteers/nusrat, got ${await getPathname()}`)
    }
    volBody = await getBodyText()
    if (!volBody.includes('Nusrat Jahan') || !volBody.includes('Deactivated')) {
      throw new Error('Nusrat volunteer page missing Nusrat Jahan or Deactivated status')
    }
    // Verify declared availability is "—" for deactivated volunteer
    const declaredPillText = await sendCdp(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const panels = Array.from(document.querySelectorAll('.auratio-admin-panel'));
        const opPanel = panels.find(p => p.textContent.includes('Operational state'));
        const pills = Array.from(opPanel?.querySelectorAll('.auratio-admin-status-pill') || []);
        return pills[0]?.textContent.trim();
      })()`,
    })
    if (declaredPillText.result.value !== '—') {
      throw new Error(`Expected declared availability "—" for Nusrat, got "${declaredPillText.result.value}"`)
    }

    console.log('\n--- [P1-5] Testing Super Admin Imran Account & Isolation ---')
    await sendCdp(ws, 'Runtime.evaluate', {
      expression: `window.__auratioResetSuperAdmin && window.__auratioResetSuperAdmin()`,
    })
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/super-admin/admin-accounts` })
    await new Promise((r) => setTimeout(r, 500))

    // Open Imran
    await sendCdp(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const rows = Array.from(document.querySelectorAll('div[style*="height: 48px"]'));
        const target = rows.find(r => r.textContent.includes('Imran Ahmed'));
        target?.querySelector('button')?.click();
      })()`,
    })
    await new Promise((r) => setTimeout(r, 400))
    console.log('Path after opening Imran:', await getPathname())
    if (await getPathname() !== '/super-admin/admin-accounts/imran') {
      throw new Error(`Expected /super-admin/admin-accounts/imran, got ${await getPathname()}`)
    }
    let imranBody = await getBodyText()
    if (!imranBody.includes('Imran Ahmed') || !imranBody.includes('Deactivated')) {
      throw new Error('Imran account page missing Imran details or Deactivated status')
    }
    const imranInputsCheck = await sendCdp(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const nameInput = document.querySelector('input[aria-label="Display name"]');
        const emailInput = document.querySelector('input[aria-label="Email / auth identity"]');
        return JSON.stringify({
          displayName: nameInput ? nameInput.value : '',
          email: emailInput ? emailInput.value : '',
        });
      })()`,
    })
    const imranInputs = JSON.parse(imranInputsCheck.result.value)
    if (imranInputs.displayName !== 'Imran Ahmed' || imranInputs.email !== 'imran@auratio.org') {
      throw new Error(`Expected Imran inputs to have canonical values, got: ${JSON.stringify(imranInputs)}`)
    }

    // Verify Deactivate button is disabled for already-deactivated account
    const deactivateBtnDisabled = await sendCdp(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.textContent.includes('Account Deactivated') || b.textContent.includes('Deactivate…'));
        return JSON.stringify({ disabled: !!btn?.disabled, text: btn ? btn.textContent.trim() : '' });
      })()`,
    })
    const deactInfo = JSON.parse(deactivateBtnDisabled.result.value)
    if (!deactInfo.disabled || deactInfo.text !== 'Account Deactivated') {
      throw new Error(`Expected disabled "Account Deactivated" button for Imran, got ${JSON.stringify(deactInfo)}`)
    }

    // Test Save Changes on Imran does not mutate Nadia
    await setInputValue('input[aria-label="Display name"]', 'Imran Ahmed Updated')
    await clickByText('button.auratio-admin-btn--primary', 'Save Changes')
    if (await getPathname() !== '/super-admin/admin-accounts') {
      throw new Error('Expected /super-admin/admin-accounts after Save Changes on Imran')
    }
    const adminProfiles = await sendCdp(ws, 'Runtime.evaluate', {
      expression: `JSON.stringify({
        imran: window.__getImranAdminAccount && window.__getImranAdminAccount(),
        nadia: window.__getNadiaAdminAccount && window.__getNadiaAdminAccount()
      })`,
    })
    const parsedProfiles = JSON.parse(adminProfiles.result.value)
    if (parsedProfiles.imran.displayName !== 'Imran Ahmed Updated' || parsedProfiles.nadia.displayName !== 'Nadia Rahman') {
      throw new Error(`Expected Imran updated and Nadia unmutated, got ${JSON.stringify(parsedProfiles)}`)
    }

    console.log('\n--- [P1-6] Testing Operational Audit Log Filters ---')
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/admin/audit` })
    await new Promise((r) => setTimeout(r, 500))

    // Helper to count visible audit rows
    async function getAuditRowCount() {
      // If empty state is shown, return 0
      const emptyCheck = await sendCdp(ws, 'Runtime.evaluate', {
        expression: `document.body.innerText.includes('No audit logs found for category')`,
      })
      if (emptyCheck.result.value) return 0
      const rowDivs = await sendCdp(ws, 'Runtime.evaluate', {
        expression: `document.querySelectorAll('div[style*="height: 48px"]').length`,
      })
      return rowDivs.result.value
    }

    // Initial All events: 5 rows
    let rowCount = await getAuditRowCount()
    if (rowCount !== 5) {
      throw new Error(`Expected 5 audit log rows for All events, got ${rowCount}`)
    }

    // Assignment filter: 1 row
    await clickByText('button.auratio-admin-status-pill', 'Assignment')
    await new Promise((r) => setTimeout(r, 200))
    rowCount = await getAuditRowCount()
    if (rowCount !== 1) {
      throw new Error(`Expected 1 audit row for Assignment, got ${rowCount}`)
    }

    // Evaluation filter: 1 row
    await clickByText('button.auratio-admin-status-pill', 'Evaluation')
    await new Promise((r) => setTimeout(r, 200))
    rowCount = await getAuditRowCount()
    if (rowCount !== 1) {
      throw new Error(`Expected 1 audit row for Evaluation, got ${rowCount}`)
    }

    // Governance filter: 1 row
    await clickByText('button.auratio-admin-status-pill', 'Governance')
    await new Promise((r) => setTimeout(r, 200))
    rowCount = await getAuditRowCount()
    if (rowCount !== 1) {
      throw new Error(`Expected 1 audit row for Governance, got ${rowCount}`)
    }

    // Volunteer filter: 2 rows
    await clickByText('button.auratio-admin-status-pill', 'Volunteer')
    await new Promise((r) => setTimeout(r, 200))
    rowCount = await getAuditRowCount()
    if (rowCount !== 2) {
      throw new Error(`Expected 2 audit rows for Volunteer, got ${rowCount}`)
    }

    // Moderation filter: 0 rows + empty state message
    await clickByText('button.auratio-admin-status-pill', 'Moderation')
    await new Promise((r) => setTimeout(r, 200))
    let auditBody = await getBodyText()
    if (!auditBody.includes('No audit logs found for category') || !auditBody.includes('Moderation')) {
      throw new Error('Expected empty state message when filtering by Moderation')
    }

    // Return to All events: 5 rows
    await clickByText('button.auratio-admin-status-pill', 'All events')
    await new Promise((r) => setTimeout(r, 200))
    rowCount = await getAuditRowCount()
    if (rowCount !== 5) {
      throw new Error(`Expected 5 audit rows after restoring All events, got ${rowCount}`)
    }

    // =================================================================
    // [P1.1] RESIDUAL INTEGRITY CORRECTIONS VERIFICATION
    // =================================================================
    console.log('\n--- [P1.1-1] Testing Unknown Moderation Route Safe Redirects & Store Isolation ---')

    // 1. Direct review unknown ID
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/admin/moderation/sub-9999` })
    await new Promise((r) => setTimeout(r, 600))
    let p11Path = await getPathname()
    if (p11Path !== '/admin/moderation') {
      throw new Error(`Expected safe redirect to /admin/moderation from /admin/moderation/sub-9999, got ${p11Path}`)
    }

    // 2. Approve unknown ID
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/admin/moderation/sub-9999/approve` })
    await new Promise((r) => setTimeout(r, 600))
    p11Path = await getPathname()
    if (p11Path !== '/admin/moderation') {
      throw new Error(`Expected safe redirect to /admin/moderation from /admin/moderation/sub-9999/approve, got ${p11Path}`)
    }

    // 3. Reject unknown ID
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/admin/moderation/sub-9999/reject` })
    await new Promise((r) => setTimeout(r, 600))
    p11Path = await getPathname()
    if (p11Path !== '/admin/moderation') {
      throw new Error(`Expected safe redirect to /admin/moderation from /admin/moderation/sub-9999/reject, got ${p11Path}`)
    }

    // 4. Re-review unknown ID
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/admin/moderation/sub-9999/re-review` })
    await new Promise((r) => setTimeout(r, 600))
    p11Path = await getPathname()
    if (p11Path !== '/admin/moderation') {
      throw new Error(`Expected safe redirect to /admin/moderation from /admin/moderation/sub-9999/re-review, got ${p11Path}`)
    }

    // 5. Verify SUB-9999 was NOT synthesized in mock data store
    const modStoreCheck = await sendCdp(ws, 'Runtime.evaluate', {
      expression: `JSON.stringify({
        hasSub9999: window.__getModerationEntityState && window.__getModerationEntityState('SUB-9999') !== undefined,
        sub8821: window.__getModerationEntityState && window.__getModerationEntityState('SUB-8821'),
        sub8730: window.__getModerationEntityState && window.__getModerationEntityState('SUB-8730'),
      })`,
    })
    const modStore = JSON.parse(modStoreCheck.result.value)
    if (modStore.hasSub9999) {
      throw new Error('SUB-9999 was improperly synthesized in moderationEntitiesState!')
    }
    if (!modStore.sub8821 || modStore.sub8821.id !== 'SUB-8821') {
      throw new Error('Canonical SUB-8821 is missing or malformed in moderation state')
    }
    if (!modStore.sub8730 || modStore.sub8730.id !== 'SUB-8730') {
      throw new Error('Canonical SUB-8730 is missing or malformed in moderation state')
    }

    console.log('\n--- [P1.1-2] Testing Active Volunteer Management for Rakib & Mehnaz ---')

    // Reset volunteer state before test
    await sendCdp(ws, 'Runtime.evaluate', {
      expression: `window.__resetAdminVolunteers && window.__resetAdminVolunteers()`,
    })

    // 1. Visit Rakib Hasan account
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/admin/volunteers/rakib` })
    await new Promise((r) => setTimeout(r, 600))
    if ((await getPathname()) !== '/admin/volunteers/rakib') {
      throw new Error(`Expected /admin/volunteers/rakib, got ${await getPathname()}`)
    }

    // Verify Rakib buttons are enabled
    const rakibBtnsCheck = await sendCdp(ws, 'Runtime.evaluate', {
      expression: `JSON.stringify((() => {
        const btns = Array.from(document.querySelectorAll('button.auratio-admin-btn'));
        const trackBtn = btns.find(b => b.innerText.includes('Manage Track Eligibility'));
        const overrideBtn = btns.find(b => b.innerText.includes('Override Availability'));
        return {
          trackDisabled: trackBtn ? trackBtn.disabled : true,
          overrideDisabled: overrideBtn ? overrideBtn.disabled : true,
        };
      })())`,
    })
    const rakibBtns = JSON.parse(rakibBtnsCheck.result.value)
    if (rakibBtns.trackDisabled || rakibBtns.overrideDisabled) {
      throw new Error('Expected Manage Track Eligibility and Override Availability to be ENABLED for Rakib!')
    }

    // 2. Click Manage Track Eligibility for Rakib
    await clickByText('button.auratio-admin-btn--primary', 'Manage Track Eligibility')
    await new Promise((r) => setTimeout(r, 500))
    p11Path = await getPathname()
    if (p11Path !== '/admin/volunteers/rakib/tracks') {
      throw new Error(`Expected /admin/volunteers/rakib/tracks after clicking Manage Track Eligibility, got ${p11Path}`)
    }

    // Verify heading for Rakib
    let p11BodyText = await getBodyText()
    if (!p11BodyText.includes('Manage Rakib Hasan’s track eligibility')) {
      throw new Error(`Expected heading "Manage Rakib Hasan’s track eligibility", got: ${p11BodyText}`)
    }

    // Toggle off Extempore for Rakib
    await clickByText('button[role="checkbox"]', 'Extempore')
    await new Promise((r) => setTimeout(r, 300))

    // Click Save Eligibility -> back to /admin/volunteers/rakib
    await clickByText('button.auratio-admin-btn--primary', 'Save Eligibility')
    await new Promise((r) => setTimeout(r, 500))
    p11Path = await getPathname()
    if (p11Path !== '/admin/volunteers/rakib') {
      throw new Error(`Expected /admin/volunteers/rakib after Save Eligibility, got ${p11Path}`)
    }

    // 3. Verify Track Isolation between Rakib and Farhana/Mehnaz
    const trackIsolationCheck = await sendCdp(ws, 'Runtime.evaluate', {
      expression: `JSON.stringify({
        rakibTracks: window.__getVolunteerTrackEligibility('rakib'),
        farhanaTracks: window.__getVolunteerTrackEligibility('farhana'),
        mehnazTracks: window.__getVolunteerTrackEligibility('mehnaz'),
      })`,
    })
    const tracksIsolated = JSON.parse(trackIsolationCheck.result.value)
    if (tracksIsolated.rakibTracks.includes('Extempore')) {
      throw new Error('Expected Rakib tracks NOT to include Extempore after removing it!')
    }
    if (tracksIsolated.farhanaTracks.length !== 3 || tracksIsolated.farhanaTracks.includes('Extempore')) {
      throw new Error('Farhana tracks were corrupted by Rakib edit!')
    }
    if (tracksIsolated.mehnazTracks.length !== 2) {
      throw new Error('Mehnaz tracks were corrupted by Rakib edit!')
    }

    // 4. Click Override Availability for Rakib
    await clickByText('button.auratio-admin-btn--primary', 'Override Availability')
    await new Promise((r) => setTimeout(r, 500))
    p11Path = await getPathname()
    if (p11Path !== '/admin/volunteers/rakib/availability') {
      throw new Error(`Expected /admin/volunteers/rakib/availability, got ${p11Path}`)
    }

    p11BodyText = await getBodyText()
    if (!p11BodyText.includes('Override Rakib Hasan’s availability')) {
      throw new Error(`Expected heading "Override Rakib Hasan’s availability", got: ${p11BodyText}`)
    }
    if (!p11BodyText.includes('Current volunteer-declared status: Available')) {
      throw new Error(`Expected declared status Available for Rakib, got: ${p11BodyText}`)
    }

    // Enter reason and apply override
    await sendCdp(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const ta = document.querySelector('textarea.auratio-admin-textarea');
        if (ta) {
          ta.value = 'Operational coverage reason for Rakib';
          ta.dispatchEvent(new Event('input', { bubbles: true }));
        }
      })()`,
    })
    await clickByText('button.auratio-admin-btn--primary', 'Apply Override')
    await new Promise((r) => setTimeout(r, 500))
    p11Path = await getPathname()
    if (p11Path !== '/admin/volunteers/rakib') {
      throw new Error(`Expected /admin/volunteers/rakib after Apply Override, got ${p11Path}`)
    }

    // 5. Test Mehnaz Karim management and Availability Override
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/admin/volunteers/mehnaz` })
    await new Promise((r) => setTimeout(r, 600))
    if ((await getPathname()) !== '/admin/volunteers/mehnaz') {
      throw new Error(`Expected /admin/volunteers/mehnaz, got ${await getPathname()}`)
    }

    // Verify Mehnaz buttons are enabled
    const mehnazBtnsCheck = await sendCdp(ws, 'Runtime.evaluate', {
      expression: `JSON.stringify((() => {
        const btns = Array.from(document.querySelectorAll('button.auratio-admin-btn'));
        const trackBtn = btns.find(b => b.innerText.includes('Manage Track Eligibility'));
        const overrideBtn = btns.find(b => b.innerText.includes('Override Availability'));
        return {
          trackDisabled: trackBtn ? trackBtn.disabled : true,
          overrideDisabled: overrideBtn ? overrideBtn.disabled : true,
        };
      })())`,
    })
    const mehnazBtns = JSON.parse(mehnazBtnsCheck.result.value)
    if (mehnazBtns.trackDisabled || mehnazBtns.overrideDisabled) {
      throw new Error('Expected Manage Track Eligibility and Override Availability to be ENABLED for Mehnaz!')
    }

    // Click Override Availability for Mehnaz
    await clickByText('button.auratio-admin-btn--primary', 'Override Availability')
    await new Promise((r) => setTimeout(r, 500))
    p11Path = await getPathname()
    if (p11Path !== '/admin/volunteers/mehnaz/availability') {
      throw new Error(`Expected /admin/volunteers/mehnaz/availability, got ${p11Path}`)
    }

    p11BodyText = await getBodyText()
    if (!p11BodyText.includes('Override Mehnaz Karim’s availability')) {
      throw new Error(`Expected heading "Override Mehnaz Karim’s availability", got: ${p11BodyText}`)
    }
    if (!p11BodyText.includes('Current volunteer-declared status: Unavailable')) {
      throw new Error(`Expected declared status Unavailable for Mehnaz, got: ${p11BodyText}`)
    }

    // Apply Override for Mehnaz -> sets to Available
    await clickByText('button.auratio-admin-btn--primary', 'Apply Override')
    await new Promise((r) => setTimeout(r, 500))
    p11Path = await getPathname()
    if (p11Path !== '/admin/volunteers/mehnaz') {
      throw new Error(`Expected /admin/volunteers/mehnaz after Apply Override, got ${p11Path}`)
    }

    // 6. Verify Availability Isolation across Farhana, Rakib, and Mehnaz
    const availIsolationCheck = await sendCdp(ws, 'Runtime.evaluate', {
      expression: `JSON.stringify({
        farhana: window.__getVolunteerAvailabilityState('farhana'),
        rakib: window.__getVolunteerAvailabilityState('rakib'),
        mehnaz: window.__getVolunteerAvailabilityState('mehnaz'),
      })`,
    })
    const availIsolated = JSON.parse(availIsolationCheck.result.value)
    if (availIsolated.farhana.effectiveAvailability !== 'Available') {
      throw new Error(`Expected Farhana effective availability to remain Available, got: ${availIsolated.farhana.effectiveAvailability}`)
    }
    if (availIsolated.rakib.effectiveAvailability !== 'Unavailable') {
      throw new Error(`Expected Rakib effective availability to be Unavailable, got: ${availIsolated.rakib.effectiveAvailability}`)
    }
    if (availIsolated.mehnaz.effectiveAvailability !== 'Available') {
      throw new Error(`Expected Mehnaz effective availability to be Available, got: ${availIsolated.mehnaz.effectiveAvailability}`)
    }

    console.log('\n--- [P1.1-3] Testing Deactivated Nusrat Controls & Safe Redirects ---')

    // 1. Visit Nusrat account
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/admin/volunteers/nusrat` })
    await new Promise((r) => setTimeout(r, 600))
    if ((await getPathname()) !== '/admin/volunteers/nusrat') {
      throw new Error(`Expected /admin/volunteers/nusrat, got ${await getPathname()}`)
    }

    // Verify Nusrat controls are disabled and pills are neutral
    const nusratCheck = await sendCdp(ws, 'Runtime.evaluate', {
      expression: `JSON.stringify((() => {
        const btns = Array.from(document.querySelectorAll('button.auratio-admin-btn'));
        const trackBtn = btns.find(b => b.innerText.includes('Manage Track Eligibility'));
        const overrideBtn = btns.find(b => b.innerText.includes('Override Availability'));
        const pills = Array.from(document.querySelectorAll('.auratio-admin-status-pill'));
        const hasDeactivatedClass = pills.some(p => p.className.includes('deactivated'));
        const hasDisabledClass = pills.some(p => p.className.includes('disabled'));
        return {
          trackDisabled: trackBtn ? trackBtn.disabled : false,
          overrideDisabled: overrideBtn ? overrideBtn.disabled : false,
          hasDeactivatedClass,
          hasDisabledClass,
        };
      })())`,
    })
    const nusratRes = JSON.parse(nusratCheck.result.value)
    if (!nusratRes.trackDisabled || !nusratRes.overrideDisabled) {
      throw new Error('Expected Manage Track Eligibility and Override Availability to be DISABLED for Nusrat!')
    }
    if (!nusratRes.hasDeactivatedClass || !nusratRes.hasDisabledClass) {
      throw new Error('Expected Nusrat status pills to have deactivated / disabled neutral styling classes!')
    }

    // 2. Direct navigation to Nusrat tracks route must safely redirect to /admin/volunteers
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/admin/volunteers/nusrat/tracks` })
    await new Promise((r) => setTimeout(r, 600))
    p11Path = await getPathname()
    if (p11Path !== '/admin/volunteers') {
      throw new Error(`Expected safe redirect to /admin/volunteers from /admin/volunteers/nusrat/tracks, got ${p11Path}`)
    }

    // 3. Direct navigation to Nusrat availability route must safely redirect to /admin/volunteers
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/admin/volunteers/nusrat/availability` })
    await new Promise((r) => setTimeout(r, 600))
    p11Path = await getPathname()
    if (p11Path !== '/admin/volunteers') {
      throw new Error(`Expected safe redirect to /admin/volunteers from /admin/volunteers/nusrat/availability, got ${p11Path}`)
    }

    // 4. Direct navigation to unknown volunteer route must safely redirect to /admin/volunteers
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/admin/volunteers/fake-vol/tracks` })
    await new Promise((r) => setTimeout(r, 600))
    p11Path = await getPathname()
    if (p11Path !== '/admin/volunteers') {
      throw new Error(`Expected safe redirect to /admin/volunteers from /admin/volunteers/fake-vol/tracks, got ${p11Path}`)
    }

    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/admin/volunteers/fake-vol/availability` })
    await new Promise((r) => setTimeout(r, 600))
    p11Path = await getPathname()
    if (p11Path !== '/admin/volunteers') {
      throw new Error(`Expected safe redirect to /admin/volunteers from /admin/volunteers/fake-vol/availability, got ${p11Path}`)
    }

    // Reset volunteer state after tests
    await sendCdp(ws, 'Runtime.evaluate', {
      expression: `window.__resetAdminVolunteers && window.__resetAdminVolunteers()`,
    })

    console.log('\nALL INTERACTION FLOWS, P1, & P1.1 REPAIR VERIFICATIONS PASSED PERFECTLY!')

    ws.close()
  } finally {
    chrome.kill()
    server.close()
  }
}

run().catch((err) => {
  console.error('Interaction test failed:', err)
  process.exit(1)
})

