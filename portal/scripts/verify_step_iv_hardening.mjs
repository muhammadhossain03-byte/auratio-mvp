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
    if (!bodyText.includes('Informative • Persuasive • Business Pitch / Sales Pitch')) {
      throw new Error('Expected exact authorized tracks displayed on Tanvir account')
    }

    // Verify track management and availability override buttons are disabled on custom/invited volunteer
    const trackMgmtDisabled = await sendCdp(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Manage Track Eligibility'));
        return btn ? btn.disabled : false;
      })()`,
    })
    if (!trackMgmtDisabled.result.value) throw new Error('Expected Manage Track Eligibility to be disabled for non-Farhana')

    const availOverrideDisabled = await sendCdp(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Override Availability'));
        return btn ? btn.disabled : false;
      })()`,
    })
    if (!availOverrideDisabled.result.value) throw new Error('Expected Override Availability to be disabled for non-Farhana')

    // Navigate back to Volunteers via sidebar and verify 5-row directory
    await clickByText('button.auratio-admin-nav-item', 'Dashboard')
    await new Promise((r) => setTimeout(r, 300))
    await clickByText('button.auratio-admin-nav-item', 'Volunteers')
    await new Promise((r) => setTimeout(r, 400))

    // Verify Farhana canonical account is untouched
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
    // Assert exact canonical first event according to live Figma 282:3603
    const firstRowData = await sendCdp(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const rows = Array.from(document.querySelectorAll('.auratio-admin-panel > div'));
        const row = rows.find(r => r.innerText.includes('Public Speaking Summit'));
        if (!row) return null;
        const innerRow = row.querySelector('div[style*="display: flex"]') || row;
        const divs = Array.from(innerRow.children);
        const title = divs[0]?.innerText.trim();
        const date = divs[1]?.innerText.trim();
        const btn = row.querySelector('button');
        const actionLabel = btn?.innerText.trim();
        return { title, date, actionLabel };
      })()`,
      returnByValue: true,
    })
    const summit = firstRowData.result.value
    if (!summit || summit.title !== 'Public Speaking Summit' || summit.date !== 'Upcoming date' || summit.actionLabel !== 'Edit') {
      throw new Error(`Canonical first event must match Figma 282:3603 exactly: title="Public Speaking Summit", date="Upcoming date", actionLabel="Edit", got ${JSON.stringify(summit)}`)
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
    if (await getPathname() !== '/admin/events') throw new Error('Expected navigate to /admin/events after create Save Draft')
    bodyText = await getBodyText()
    if (!bodyText.includes('New National Meetup QA') || !bodyText.includes('Sylhet Division')) {
      throw new Error('Expected newly created draft event in directory')
    }

    // Reopen newly created draft event and verify persistence
    await sendCdp(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const rows = Array.from(document.querySelectorAll('.auratio-admin-panel > div'));
        const newRow = rows.find(r => r.innerText.includes('New National Meetup QA'));
        if (newRow) {
          const btn = newRow.querySelector('button');
          if (btn) btn.click();
        }
      })()`,
    })
    await new Promise((r) => setTimeout(r, 400))
    const newTitleVal = await sendCdp(ws, 'Runtime.evaluate', {
      expression: `document.querySelector('#event-title').value`,
    })
    if (newTitleVal.result.value !== 'New National Meetup QA') {
      throw new Error(`Expected loaded title to be "New National Meetup QA", got "${newTitleVal.result.value}"`)
    }
    await clickByText('button.auratio-admin-btn--secondary', 'Save Draft')
    if (await getPathname() !== '/admin/events') throw new Error('Expected navigate to /admin/events')
    console.log('  ✓ Admin Event mock state, Save Draft persistence, and Figma presentation guards passed.')

    // 5. SUPER ADMIN INVITE ADMIN MOCK STATE & GOVERNANCE
    console.log('\n[5/6] Testing Super Admin Invite Admin Mock State & Governance...')
    await sendCdp(ws, 'Runtime.evaluate', {
      expression: 'window.__auratioResetSuperAdmin && window.__auratioResetSuperAdmin()',
    })
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/super-admin/admin-accounts` })
    await new Promise((r) => setTimeout(r, 500))
    bodyText = await getBodyText()
    if (!bodyText.includes('Auratio Root') || !bodyText.includes('Nadia Rahman')) {
      throw new Error('Expected canonical Super Admin and Admin in directory')
    }

    // Open Invite Admin form
    await clickByText('button.auratio-admin-btn--primary', 'Invite Admin')
    if (await getPathname() !== '/super-admin/admin-accounts/invite') throw new Error('Expected navigate to /super-admin/admin-accounts/invite')
    await new Promise((r) => setTimeout(r, 400))

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

    // Reopen and complete valid invite for Kazi Anis
    await clickByText('button.auratio-admin-btn--primary', 'Invite Admin')
    await setInputValue('input[aria-label="Full name"]', 'Kazi Anis')
    await setInputValue('input[aria-label="Email"]', 'kazi@auratio.org')
    await clickByText('button.auratio-admin-btn--primary', 'Send Admin Invite')
    if (await getPathname() !== '/super-admin/admin-accounts') throw new Error('Expected navigate to accounts')
    bodyText = await getBodyText()
    if (!bodyText.includes('Kazi Anis')) throw new Error('Expected Kazi Anis in admin accounts')

    // Verify Kazi Anis is role Admin, NOT Super Admin, and has status Invited
    const kaziRole = await sendCdp(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const rows = Array.from(document.querySelectorAll('.auratio-admin-panel > div'));
        const kaziRow = rows.find(r => r.innerText.includes('Kazi Anis'));
        return kaziRow ? kaziRow.innerText : '';
      })()`,
    })
    if (!kaziRole.result.value.includes('Admin')) throw new Error('Expected Kazi Anis to have Admin role')
    if (kaziRole.result.value.includes('Super Admin')) throw new Error('Invited admin must NOT have Super Admin role')
    if (!kaziRole.result.value.includes('Invited')) throw new Error('Expected Kazi Anis to have Invited status upon invite')

    // Open Kazi Anis account via SPA navigation
    await sendCdp(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const rows = Array.from(document.querySelectorAll('.auratio-admin-panel > div'));
        const kaziRow = rows.find(r => r.innerText.includes('Kazi Anis'));
        if (kaziRow) {
          const btn = kaziRow.querySelector('button');
          if (btn) btn.click();
        }
      })()`,
    })
    await new Promise((r) => setTimeout(r, 400))
    if (await getPathname() !== '/super-admin/admin-accounts/kazi-anis') throw new Error('Expected /super-admin/admin-accounts/kazi-anis')
    bodyText = await getBodyText()

    // Assert Invited Admin consistency
    if (!bodyText.includes('Invited')) throw new Error('Expected Invited status pill on Kazi Anis account')
    if (!bodyText.includes('Invite sent / activation pending')) {
      throw new Error('Expected "Invite sent / activation pending" lifecycle text for invited admin')
    }
    if (bodyText.includes('Invite accepted / account active')) {
      throw new Error('Invited admin must NOT display "Invite accepted / account active"')
    }
    if (bodyText.includes('Stops active portal access')) {
      throw new Error('Invited admin must NOT claim active portal access exists before activation')
    }
    if (!bodyText.includes('Cancels pending portal access')) {
      throw new Error('Expected "Cancels pending portal access" copy for invited admin deactivation callout')
    }

    // Edit Kazi Anis details and Save
    await setInputValue('input[aria-label="Display name"]', 'Kazi Anis Updated')
    await setInputValue('input[aria-label="Email / auth identity"]', 'kazi.updated@auratio.org')
    await clickByText('button.auratio-admin-btn--primary', 'Save Changes')
    if (await getPathname() !== '/super-admin/admin-accounts') throw new Error('Expected navigate back to accounts on Save')
    bodyText = await getBodyText()
    if (!bodyText.includes('Kazi Anis Updated') || !bodyText.includes('kazi.updated@auratio.org')) {
      throw new Error('Expected updated Kazi Anis details in accounts directory')
    }

    // Verify Nadia account was NOT mutated
    const nadiaState = await sendCdp(ws, 'Runtime.evaluate', {
      expression: 'window.__getNadiaAdminAccount && window.__getNadiaAdminAccount()',
      returnByValue: true,
    })
    if (nadiaState.result.value.displayName !== 'Nadia Rahman' || nadiaState.result.value.email !== 'nadia@auratio.org') {
      throw new Error('Nadia account must NEVER be mutated by custom admin changes')
    }

    // Reopen Kazi Anis via SPA row button, click Deactivate, and verify parameterized deactivation flow
    await sendCdp(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const rows = Array.from(document.querySelectorAll('.auratio-admin-panel > div'));
        const kaziRow = rows.find(r => r.innerText.includes('Kazi Anis Updated'));
        if (kaziRow) {
          const btn = kaziRow.querySelector('button');
          if (btn) btn.click();
        }
      })()`,
    })
    await new Promise((r) => setTimeout(r, 400))
    await clickByText('button.auratio-admin-btn--secondary', 'Deactivate')
    if (await getPathname() !== '/super-admin/admin-accounts/kazi-anis/deactivate') {
      throw new Error(`Expected /super-admin/admin-accounts/kazi-anis/deactivate, got ${await getPathname()}`)
    }
    bodyText = await getBodyText()
    if (!bodyText.includes('Deactivate Kazi Anis Updated?') || !bodyText.includes('kazi.updated@auratio.org • Admin')) {
      throw new Error('Expected deactivation screen to target Kazi Anis, not Nadia')
    }
    if (!bodyText.includes('This cancels pending Admin portal activation for the selected ordinary Admin account.')) {
      throw new Error('Expected invited deactivation subtitle copy for invited admin')
    }
    if (!bodyText.includes('Pending Admin portal activation is cancelled.')) {
      throw new Error('Expected pending activation cancelled in impact box for invited admin')
    }
    if (bodyText.includes('This removes active Admin portal authorization')) {
      throw new Error('Invited admin deactivation confirmation must NOT claim active portal authorization is being removed')
    }
    if (bodyText.includes('Active Admin portal access is removed')) {
      throw new Error('Invited admin deactivation confirmation must NOT claim active portal access is removed')
    }

    // Confirm deactivation
    await clickByText('button.auratio-admin-btn--primary', 'Confirm Deactivation')
    if (await getPathname() !== '/super-admin/admin-accounts') throw new Error('Expected navigate to accounts after deactivation')
    bodyText = await getBodyText()

    const kaziDeactivatedRow = await sendCdp(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const rows = Array.from(document.querySelectorAll('.auratio-admin-panel > div'));
        const kaziRow = rows.find(r => r.innerText.includes('Kazi Anis Updated'));
        return kaziRow ? kaziRow.innerText : '';
      })()`,
    })
    if (!kaziDeactivatedRow.result.value.includes('Deactivated')) throw new Error('Expected Kazi Anis to be Deactivated')

    // Verify Nadia remains Active
    const nadiaAfter = await sendCdp(ws, 'Runtime.evaluate', {
      expression: 'window.__getNadiaAdminAccount && window.__getNadiaAdminAccount()',
      returnByValue: true,
    })
    if (nadiaAfter.result.value.status === 'Deactivated') throw new Error('Nadia must remain Active')

    // Verify Root deactivation UI is COMPLETELY blocked
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/super-admin/admin-accounts/root/deactivate` })
    await new Promise((r) => setTimeout(r, 400))
    if (await getPathname() !== '/super-admin/admin-accounts/root') {
      throw new Error(`Expected /super-admin/admin-accounts/root/deactivate to redirect to /super-admin/admin-accounts/root, got ${await getPathname()}`)
    }
    bodyText = await getBodyText()
    if (!bodyText.includes('Auratio Root') || !bodyText.includes('Protected root Super Admin account')) {
      throw new Error('Expected protected Root account screen')
    }
    if (bodyText.includes('Confirm Deactivation') || bodyText.includes('Deactivate Auratio Root?')) {
      throw new Error('Direct root/deactivate must NEVER expose deactivation controls')
    }

    // Navigate back to accounts directory and invite a SECOND admin account (Sabrina Khan) to test 5-row overflow
    await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/super-admin/admin-accounts` })
    await new Promise((r) => setTimeout(r, 400))
    await clickByText('button.auratio-admin-btn--primary', 'Invite Admin')
    await new Promise((r) => setTimeout(r, 400))
    await setInputValue('input[aria-label="Full name"]', 'Sabrina Khan')
    await setInputValue('input[aria-label="Email"]', 'sabrina@auratio.org')
    await clickByText('button.auratio-admin-btn--primary', 'Send Admin Invite')
    await new Promise((r) => setTimeout(r, 400))
    if (await getPathname() !== '/super-admin/admin-accounts') throw new Error('Expected navigate to accounts')
    bodyText = await getBodyText()
    if (!bodyText.includes('Sabrina Khan')) throw new Error('Expected Sabrina Khan in admin accounts')

    // Assert 5-row admin accounts directory dynamic overflow and boundary isolation
    const adminTableMetrics = await sendCdp(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const panels = Array.from(document.querySelectorAll('.auratio-admin-panel'));
        const table = panels[1];
        const boundary = panels[2];
        if (!table || !boundary) return null;
        const rows = Array.from(table.querySelectorAll('[data-testid^="admin-account-row-"]'));
        const tableRect = table.getBoundingClientRect();
        const boundaryRect = boundary.getBoundingClientRect();
        const tableStyle = window.getComputedStyle(table);
        return {
          rowCount: rows.length,
          overflowY: tableStyle.overflowY,
          tableBottom: tableRect.bottom,
          boundaryTop: boundaryRect.top,
          isOverlapping: tableRect.bottom > boundaryRect.top,
        };
      })()`,
      returnByValue: true,
    })
    const metrics = adminTableMetrics.result.value
    if (!metrics || metrics.rowCount < 5) {
      throw new Error(`Expected at least 5 admin rows with two invited admins, got ${metrics ? metrics.rowCount : null}`)
    }
    if (metrics.overflowY !== 'auto' && metrics.overflowY !== 'scroll') {
      throw new Error(`Expected admin accounts table to have overflowY auto, got ${metrics.overflowY}`)
    }
    if (metrics.isOverlapping) {
      throw new Error(`Admin accounts table (${metrics.tableBottom}px) overlaps Permission Boundary card (${metrics.boundaryTop}px)`)
    }
    console.log('  ✓ Super Admin Invite Admin validation, mock provisioning, entity isolation, and root protection passed.')

    // 6. DYNAMIC MOCK RESOLUTION & SAFE UNKNOWN ENTITY REDIRECTION
    console.log('\n[6/6] Testing Dynamic Mock Resolution & Safe Unknown Entity Redirection...')

    // A. Safe redirection for unknown dynamic IDs (no fake mutable entities fabricated)
    const unknownRoutes = [
      { path: '/admin/requests/req-9999', expectedRedirect: '/admin/requests' },
      { path: '/admin/requests/req-9999/assign', expectedRedirect: '/admin/requests' },
      { path: '/admin/requests/req-9999/reassign', expectedRedirect: '/admin/requests' },
      { path: '/admin/volunteers/unknown-vol', expectedRedirect: '/admin/volunteers' },
      { path: '/admin/events/unknown-event', expectedRedirect: '/admin/events' },
      { path: '/super-admin/admin-accounts/unknown-admin', expectedRedirect: '/super-admin/admin-accounts' },
      { path: '/super-admin/admin-accounts/unknown-admin/deactivate', expectedRedirect: '/super-admin/admin-accounts' },
    ]

    for (const r of unknownRoutes) {
      await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}${r.path}` })
      await new Promise((res) => setTimeout(res, 400))
      const currentPath = await getPathname()
      if (currentPath !== r.expectedRedirect) {
        throw new Error(`Expected unknown dynamic route ${r.path} to redirect to ${r.expectedRedirect}, got ${currentPath}`)
      }
      console.log(`  ✓ ${r.path} safely redirected to ${r.expectedRedirect}.`)
    }

    // B. Canonical and session-created entities resolve genuine mock data
    const canonicalAndSessionRoutes = [
      { path: '/admin/requests/req-1042', expectedLabel: 'REQ-1042' },
      { path: '/admin/evaluations/sub-8834', expectedLabel: 'SUB-8834 — Evaluation Record' },
      { path: '/admin/moderation/sub-8821', expectedLabel: 'SUB-8821 — Moderation Review' },
      { path: '/admin/volunteers/farhana', expectedLabel: 'Farhana Islam' },
      { path: '/super-admin/admin-accounts/nadia', expectedLabel: 'Nadia Rahman' },
      { path: '/super-admin/admin-accounts/root', expectedLabel: 'Auratio Root' },
      { path: '/admin/volunteers/tanvir-ahmed', expectedLabel: 'Tanvir Ahmed' },
      { path: '/super-admin/admin-accounts/sabrina-khan', expectedLabel: 'Sabrina Khan' },
    ]

    for (const route of canonicalAndSessionRoutes) {
      await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}${route.path}` })
      await new Promise((res) => setTimeout(res, 400))
      bodyText = await getBodyText()
      if (!bodyText.includes(route.expectedLabel)) {
        throw new Error(`Expected route ${route.path} to contain "${route.expectedLabel}"`)
      }
      console.log(`  ✓ ${route.path} successfully resolved exact entity "${route.expectedLabel}".`)
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


