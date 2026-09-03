import { spawn } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, resolve } from 'node:path'

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const PORT = 4178

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

  const cdpPort = 9232
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

    console.log('=== Step IV Integrity Hardening Verification ===\n')

    // 1. ROOT ROUTE REDIRECT
    console.log('[1/6] Testing Root Route Redirect...')
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/` })
    await new Promise((r) => setTimeout(r, 500))
    if (await getPathname() !== '/auth/sign-in') {
      throw new Error(`Expected / to redirect to /auth/sign-in, got ${await getPathname()}`)
    }
    console.log('  ✓ Root redirect to /auth/sign-in confirmed.')

    // 2. AUTH FORM VALIDATION
    console.log('\n[2/6] Testing Auth Form Validation (Sign In, Forgot Password, Reset Password)...')
    // 2A. Sign In
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/auth/sign-in` })
    await new Promise((r) => setTimeout(r, 500))

    // Clear email & password and try submit
    await setInputValue('#portal-sign-in-email', '')
    await setInputValue('#portal-sign-in-password', '')
    await clickByText('button[type="submit"]', 'Sign In')
    if (await getPathname() !== '/auth/sign-in') throw new Error('Expected submit to be blocked with empty fields')
    let bodyText = await getBodyText()
    if (!bodyText.includes('Email is required.')) throw new Error('Expected Email is required. message')

    // Invalid email format
    await setInputValue('#portal-sign-in-email', 'invalid-email')
    await setInputValue('#portal-sign-in-password', 'password123')
    await clickByText('button[type="submit"]', 'Sign In')
    if (await getPathname() !== '/auth/sign-in') throw new Error('Expected submit blocked on invalid email')
    bodyText = await getBodyText()
    if (!bodyText.includes('Please enter a valid email address.')) throw new Error('Expected valid email format error')

    // Valid email, empty password
    await setInputValue('#portal-sign-in-email', 'admin@auratio.org')
    await setInputValue('#portal-sign-in-password', '')
    await clickByText('button[type="submit"]', 'Sign In')
    if (await getPathname() !== '/auth/sign-in') throw new Error('Expected submit blocked on empty password')
    bodyText = await getBodyText()
    if (!bodyText.includes('Password is required.')) throw new Error('Expected Password is required. message')

    // Valid credentials
    await setInputValue('#portal-sign-in-email', 'admin@auratio.org')
    await setInputValue('#portal-sign-in-password', 'secret123')
    await clickByText('button[type="submit"]', 'Sign In')
    if (await getPathname() !== '/auth/role-authorization') throw new Error('Expected navigate to /auth/role-authorization on valid sign in')
    console.log('  ✓ Sign In validation passed.')

    // 2B. Forgot Password
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/auth/forgot-password` })
    await new Promise((r) => setTimeout(r, 500))
    await setInputValue('#portal-forgot-password-email', '')
    await clickByText('button[type="submit"]', 'Send Reset Link')
    if (await getPathname() !== '/auth/forgot-password') throw new Error('Expected submit blocked on empty email')
    bodyText = await getBodyText()
    if (!bodyText.includes('Email is required.')) throw new Error('Expected Email is required. on forgot password')

    await setInputValue('#portal-forgot-password-email', 'invalid')
    await clickByText('button[type="submit"]', 'Send Reset Link')
    if (await getPathname() !== '/auth/forgot-password') throw new Error('Expected submit blocked on invalid email')

    await setInputValue('#portal-forgot-password-email', 'valid@auratio.org')
    await clickByText('button[type="submit"]', 'Send Reset Link')
    if (await getPathname() !== '/auth/reset-link-sent') throw new Error('Expected navigate to /auth/reset-link-sent')
    console.log('  ✓ Forgot Password validation passed.')

    // 2C. Reset Password
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/auth/reset-password` })
    await new Promise((r) => setTimeout(r, 500))
    await clickByText('button[type="submit"]', 'Update Password')
    if (await getPathname() !== '/auth/reset-password') throw new Error('Expected submit blocked on empty password')
    bodyText = await getBodyText()
    if (!bodyText.includes('New password is required.')) throw new Error('Expected New password is required.')

    // Password too short (< 8 chars)
    await setInputValue('#portal-reset-password-new', '1234567')
    await setInputValue('#portal-reset-password-confirm', '1234567')
    await clickByText('button[type="submit"]', 'Update Password')
    if (await getPathname() !== '/auth/reset-password') throw new Error('Expected submit blocked on short password')
    bodyText = await getBodyText()
    if (!bodyText.includes('Password must be at least 8 characters.')) throw new Error('Expected 8 character length error')

    // Mismatched passwords
    await setInputValue('#portal-reset-password-new', 'password123')
    await setInputValue('#portal-reset-password-confirm', 'different123')
    await clickByText('button[type="submit"]', 'Update Password')
    if (await getPathname() !== '/auth/reset-password') throw new Error('Expected submit blocked on mismatched passwords')
    bodyText = await getBodyText()
    if (!bodyText.includes('Passwords do not match.')) throw new Error('Expected Passwords do not match. error')

    // Valid matching passwords
    await setInputValue('#portal-reset-password-new', 'SecurePass123!')
    await setInputValue('#portal-reset-password-confirm', 'SecurePass123!')
    await clickByText('button[type="submit"]', 'Update Password')
    if (await getPathname() !== '/auth/password-reset-complete') throw new Error('Expected navigate to /auth/password-reset-complete')
    console.log('  ✓ Reset Password validation passed.')

    // 3. VOLUNTEER INVITE & DIRECTORY MOCK STATE & ENTITY ISOLATION
    console.log('\n[3/6] Testing Volunteer Invite Mock State & Entity Isolation...')
    await sendCdp(ws, 'Runtime.evaluate', {
      expression: 'window.__resetAdminVolunteers && window.__resetAdminVolunteers()',
    })
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/admin/volunteers` })
    await new Promise((r) => setTimeout(r, 500))
    bodyText = await getBodyText()
    if (!bodyText.includes('Farhana Islam')) throw new Error('Expected Farhana in initial volunteer directory')

    // Navigate to invite
    await clickByText('button.auratio-admin-btn--primary', 'Invite Volunteer')
    if (await getPathname() !== '/admin/volunteers/invite') throw new Error('Expected /admin/volunteers/invite')

    // Missing name & email blocked
    await clickByText('button.auratio-admin-btn--primary', 'Send Volunteer Invite')
    if (await getPathname() !== '/admin/volunteers/invite') throw new Error('Expected submit blocked on empty fields')
    bodyText = await getBodyText()
    if (!bodyText.includes('Display name is required.')) throw new Error('Expected Display name is required.')

    // Invalid email blocked
    await setInputValue('#invite-display-name', 'Tanvir Ahmed')
    await setInputValue('#invite-email', 'invalid-email')
    await clickByText('button.auratio-admin-btn--primary', 'Send Volunteer Invite')
    if (await getPathname() !== '/admin/volunteers/invite') throw new Error('Expected submit blocked on invalid email')
    bodyText = await getBodyText()
    if (!bodyText.includes('Please enter a valid email address.')) throw new Error('Expected valid email format error')

    // Cancel creates nothing
    await clickByText('button.auratio-admin-btn--secondary', 'Cancel')
    if (await getPathname() !== '/admin/volunteers') throw new Error('Expected navigate back on Cancel')
    bodyText = await getBodyText()
    if (bodyText.includes('Tanvir Ahmed')) throw new Error('Cancel should not create any volunteer record')

    // Reopen and complete valid invite
    await clickByText('button.auratio-admin-btn--primary', 'Invite Volunteer')
    await setInputValue('#invite-display-name', 'Tanvir Ahmed')
    await setInputValue('#invite-email', 'tanvir@auratio.org')
    await clickByText('button.auratio-admin-btn--primary', 'Send Volunteer Invite')
    if (await getPathname() !== '/admin/volunteers') throw new Error('Expected navigate to /admin/volunteers after Send Invite')
    bodyText = await getBodyText()
    if (!bodyText.includes('Tanvir Ahmed')) throw new Error('Expected Tanvir Ahmed in volunteer directory')

    // Open Tanvir Ahmed account via SPA navigation and verify entity isolation
    await sendCdp(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const rows = Array.from(document.querySelectorAll('.auratio-admin-panel > div'));
        const tanvirRow = rows.find(r => r.innerText.includes('Tanvir Ahmed'));
        if (tanvirRow) {
          const btn = tanvirRow.querySelector('button');
          if (btn) btn.click();
        }
      })()`,
    })
    await new Promise((r) => setTimeout(r, 400))
    if (await getPathname() !== '/admin/volunteers/tanvir-ahmed') throw new Error('Expected /admin/volunteers/tanvir-ahmed after clicking Open')
    bodyText = await getBodyText()
    if (!bodyText.includes('Tanvir Ahmed')) throw new Error('Expected Tanvir Ahmed on account page')
    if (!bodyText.includes('Invited')) throw new Error('Expected Invited status on Tanvir account')

    // Navigate back to Volunteers via sidebar and verify Farhana canonical account is untouched
    await clickByText('button.auratio-admin-nav-item', 'Dashboard')
    await new Promise((r) => setTimeout(r, 300))
    await clickByText('button.auratio-admin-nav-item', 'Volunteers')
    await new Promise((r) => setTimeout(r, 300))
    await sendCdp(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const rows = Array.from(document.querySelectorAll('.auratio-admin-panel > div'));
        const farhanaRow = rows.find(r => r.innerText.includes('Farhana Islam'));
        if (farhanaRow) {
          const btn = farhanaRow.querySelector('button');
          if (btn) btn.click();
        }
      })()`,
    })
    await new Promise((r) => setTimeout(r, 400))
    bodyText = await getBodyText()
    if (!bodyText.includes('Farhana Islam')) throw new Error('Expected Farhana Islam on canonical route')
    if (!bodyText.includes('Active')) throw new Error('Expected Active on Farhana account')
    console.log('  ✓ Volunteer invite validation and mock state isolation passed.')

    // 4. ADMIN EVENT MOCK STATE
    console.log('\n[4/6] Testing Admin Event Mock State (Directory, Create, Edit, Save Draft)...')
    await sendCdp(ws, 'Runtime.evaluate', {
      expression: 'window.__resetAdminEvents && window.__resetAdminEvents()',
    })
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/admin/events` })
    await new Promise((r) => setTimeout(r, 500))
    bodyText = await getBodyText()
    if (!bodyText.includes('Public Speaking Summit') || !bodyText.includes('Draft Event')) {
      throw new Error('Expected initial canonical events in directory')
    }

    // Edit existing draft event via SPA
    await sendCdp(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const rows = Array.from(document.querySelectorAll('.auratio-admin-panel > div'));
        const draftRow = rows.find(r => r.innerText.includes('Draft Event'));
        if (draftRow) {
          const btn = draftRow.querySelector('button');
          if (btn) btn.click();
        }
      })()`,
    })
    await new Promise((r) => setTimeout(r, 400))

    // Set new title and location
    await setInputValue('#event-title', 'Updated Draft Event QA')
    await setInputValue('#event-division', 'Barisal Division')
    await clickByText('button.auratio-admin-btn--secondary', 'Save Draft')
    if (await getPathname() !== '/admin/events') throw new Error('Expected navigate to /admin/events after Save Draft')
    bodyText = await getBodyText()
    if (!bodyText.includes('Updated Draft Event QA') || !bodyText.includes('Barisal Division')) {
      throw new Error('Expected updated draft event values in directory')
    }

    // Reopen via SPA and verify loaded values
    await sendCdp(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const rows = Array.from(document.querySelectorAll('.auratio-admin-panel > div'));
        const draftRow = rows.find(r => r.innerText.includes('Updated Draft Event QA'));
        if (draftRow) {
          const btn = draftRow.querySelector('button');
          if (btn) btn.click();
        }
      })()`,
    })
    await new Promise((r) => setTimeout(r, 400))
    const titleVal = await sendCdp(ws, 'Runtime.evaluate', {
      expression: `document.querySelector('#event-title').value`,
    })
    if (titleVal.result.value !== 'Updated Draft Event QA') {
      throw new Error(`Expected loaded title to be "Updated Draft Event QA", got "${titleVal.result.value}"`)
    }

    // Save and return to directory
    await clickByText('button.auratio-admin-btn--secondary', 'Save Draft')
    if (await getPathname() !== '/admin/events') throw new Error('Expected navigate to /admin/events')

    // Create new event draft via SPA button
    await clickByText('button.auratio-admin-btn--primary', 'Create Event')
    if (await getPathname() !== '/admin/events/editor') throw new Error('Expected navigate to /admin/events/editor')
    await new Promise((r) => setTimeout(r, 500))
    await setInputValue('#event-title', 'New National Meetup QA')
    await setInputValue('#event-date', 'December 2026')
    await setInputValue('#event-division', 'Sylhet Division')
    await clickByText('button.auratio-admin-btn--secondary', 'Save Draft')
    if (await getPathname() !== '/admin/events') throw new Error('Expected navigate to /admin/events')
    bodyText = await getBodyText()
    if (!bodyText.includes('New National Meetup QA')) {
      throw new Error('Expected New National Meetup QA in event directory')
    }

    // Verify Publish and Delete buttons are presentation-only per live Figma
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/admin/events/editor?id=draft` })
    await new Promise((r) => setTimeout(r, 500))
    const publishBtn = await sendCdp(ws, 'Runtime.evaluate', {
      expression: `Boolean(document.querySelector('.auratio-admin-btn--presentation[role="presentation"]'))`,
    })
    if (!publishBtn.result.value) throw new Error('Expected presentation-only controls for Publish / Delete')
    console.log('  ✓ Admin Event mock state, Save Draft persistence, and Figma presentation guards passed.')

    // 5. SUPER ADMIN INVITE ADMIN MOCK STATE
    console.log('\n[5/6] Testing Super Admin Invite Admin Mock State & Governance...')
    await sendCdp(ws, 'Runtime.evaluate', {
      expression: 'window.__auratioResetSuperAdmin && window.__auratioResetSuperAdmin()',
    })
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/super-admin/admin-accounts` })
    await new Promise((r) => setTimeout(r, 500))
    bodyText = await getBodyText()
    if (!bodyText.includes('Auratio Root') || !bodyText.includes('Super Admin') || !bodyText.includes('Protected')) {
      throw new Error('Expected Root Super Admin account with Protected status')
    }

    // Open invite admin
    await clickByText('button.auratio-admin-btn--primary', 'Invite Admin')
    if (await getPathname() !== '/super-admin/admin-accounts/invite') throw new Error('Expected /super-admin/admin-accounts/invite')

    // Empty name blocked
    await setInputValue('input[aria-label="Full name"]', '')
    await clickByText('button.auratio-admin-btn--primary', 'Send Admin Invite')
    if (await getPathname() !== '/super-admin/admin-accounts/invite') throw new Error('Expected submit blocked on empty name')
    bodyText = await getBodyText()
    if (!bodyText.includes('Full name is required.')) throw new Error('Expected Full name is required.')

    // Invalid email blocked
    await setInputValue('input[aria-label="Full name"]', 'Kazi Anis')
    await setInputValue('input[aria-label="Email"]', 'notanemail')
    await clickByText('button.auratio-admin-btn--primary', 'Send Admin Invite')
    if (await getPathname() !== '/super-admin/admin-accounts/invite') throw new Error('Expected submit blocked on invalid email')
    bodyText = await getBodyText()
    if (!bodyText.includes('Please enter a valid email address.')) throw new Error('Expected valid email format error')

    // Cancel creates nothing
    await clickByText('button.auratio-admin-btn--secondary', 'Cancel')
    if (await getPathname() !== '/super-admin/admin-accounts') throw new Error('Expected navigate to /super-admin/admin-accounts')
    bodyText = await getBodyText()
    if (bodyText.includes('Kazi Anis')) throw new Error('Cancel should not create admin account')

    // Reopen and complete valid invite
    await clickByText('button.auratio-admin-btn--primary', 'Invite Admin')
    await setInputValue('input[aria-label="Full name"]', 'Kazi Anis')
    await setInputValue('input[aria-label="Email"]', 'kazi@auratio.org')
    await clickByText('button.auratio-admin-btn--primary', 'Send Admin Invite')
    if (await getPathname() !== '/super-admin/admin-accounts') throw new Error('Expected navigate to accounts')
    bodyText = await getBodyText()
    if (!bodyText.includes('Kazi Anis')) throw new Error('Expected Kazi Anis in admin accounts')

    // Verify Kazi Anis is role Admin, NOT Super Admin
    const kaziRole = await sendCdp(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const rows = Array.from(document.querySelectorAll('.auratio-admin-panel > div'));
        const kaziRow = rows.find(r => r.innerText.includes('Kazi Anis'));
        return kaziRow ? kaziRow.innerText : '';
      })()`,
    })
    if (!kaziRole.result.value.includes('Admin')) throw new Error('Expected Kazi Anis to have Admin role')
    if (kaziRole.result.value.includes('Super Admin')) throw new Error('Invited admin must NOT have Super Admin role')

    // Verify Root account remains Protected and Active
    const rootRow = await sendCdp(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const rows = Array.from(document.querySelectorAll('.auratio-admin-panel > div'));
        const rRow = rows.find(r => r.innerText.includes('Auratio Root'));
        return rRow ? rRow.innerText : '';
      })()`,
    })
    if (!rootRow.result.value.includes('Super Admin') || !rootRow.result.value.includes('Protected') || !rootRow.result.value.includes('Active')) {
      throw new Error('Expected Root account to remain Super Admin, Protected, and Active')
    }
    console.log('  ✓ Super Admin Invite Admin validation, mock provisioning, and root protection passed.')

    // 6. COMPANION PARAMETERIZED ROUTES
    console.log('\n[6/6] Testing Companion Parameterized Routes...')
    const companionRoutes = [
      { path: '/admin/requests/req-9999', expectedLabel: 'Request Details' },
      { path: '/admin/evaluations/sub-9999', expectedLabel: 'Evaluation Record' },
      { path: '/admin/moderation/sub-9999', expectedLabel: 'Moderation Review' },
      { path: '/admin/volunteers/custom-vol', expectedLabel: 'Volunteer Account' },
      { path: '/admin/events/custom-ev', expectedLabel: 'Event information' },
      { path: '/super-admin/admin-accounts/custom-admin', expectedLabel: 'Admin Account' },
    ]

    for (const route of companionRoutes) {
      await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}${route.path}` })
      await new Promise((r) => setTimeout(r, 400))
      bodyText = await getBodyText()
      if (!bodyText.toLowerCase().includes(route.expectedLabel.toLowerCase())) {
        throw new Error(`Companion route ${route.path} failed to render expected label "${route.expectedLabel}"`)
      }
      console.log(`  ✓ ${route.path} successfully resolved companion screen.`)
    }

    console.log('\n==================================================')
    console.log('ALL STEP IV INTEGRITY HARDENING TESTS PASSED 100%!')
    console.log('==================================================')
  } finally {
    chrome.kill()
    server.close()
  }
}

run().catch((err) => {
  console.error('\nVerification failed:', err)
  process.exit(1)
})


