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

    console.log('\nALL 10 INTERACTION FLOWS PASSED PERFECTLY!')

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
