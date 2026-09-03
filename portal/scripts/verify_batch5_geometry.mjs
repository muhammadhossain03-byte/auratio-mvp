import { spawn } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, resolve } from 'node:path'

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const PORT = 4181

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

async function inspectBatch5Geometry() {
  const distDir = resolve(process.cwd(), 'dist')
  const server = await startStaticServer(distDir)

  const cdpPort = 9238
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
    await sendCdp(ws, 'Emulation.setDeviceMetricsOverride', {
      width: 1366,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    })

    const routes = [
      { route: '/admin/moderation', name: 'Moderation Queue' },
      { route: '/admin/moderation/sub-8821', name: 'Moderation Review' },
      { route: '/admin/moderation/sub-8821/approve', name: 'Confirm Approval' },
      { route: '/admin/moderation/sub-8821/reject', name: 'Confirm Rejection' },
      { route: '/admin/moderation/sub-8821/re-review', name: 'Request Re-review' },
      { route: '/admin/volunteers', name: 'Volunteer Evaluators' },
      { route: '/admin/volunteers/invite', name: 'Invite Volunteer' },
      { route: '/admin/volunteers/farhana', name: 'Volunteer Account' },
      { route: '/admin/volunteers/farhana/availability', name: 'Availability Override' },
      { route: '/admin/volunteers/farhana/tracks', name: 'Track Eligibility' },
      { route: '/admin/events', name: 'Event Management' },
      { route: '/admin/events/editor', name: 'Event Editor' },
      { route: '/admin/audit', name: 'Audit Log' },
    ]

    for (const { route, name } of routes) {
      console.log(`\n=================== ${name} (${route}) ===================`)
      await sendCdp(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}${route}` })
      await new Promise((r) => setTimeout(r, 600))
      await sendCdp(ws, 'Runtime.evaluate', {
        expression: 'document.fonts.ready.then(() => true)',
        awaitPromise: true,
      })

      const evalResult = await sendCdp(ws, 'Runtime.evaluate', {
        expression: `(() => {
          function rect(el) {
            if (!el) return null;
            const r = el.getBoundingClientRect();
            return {
              tag: el.tagName,
              cls: el.className ? el.className.split(' ')[0] : '',
              text: el.innerText ? el.innerText.slice(0, 30).replace(/\\n/g, ' ') : '',
              x: Math.round(r.x),
              y: Math.round(r.y),
              width: Math.round(r.width),
              height: Math.round(r.height),
            };
          }
          const sidebar = rect(document.querySelector('.auratio-admin-sidebar'));
          const topbar = rect(document.querySelector('.auratio-admin-topbar'));
          const title = rect(document.querySelector('.auratio-admin-page-title'));
          const subtitle = rect(document.querySelector('.auratio-admin-page-subtitle'));
          const panels = Array.from(document.querySelectorAll('.auratio-admin-panel')).map(rect);
          return JSON.stringify({ sidebar, topbar, title, subtitle, panels });
        })()`,
      })

      const geo = JSON.parse(evalResult.result.value)
      console.log(geo)

      // Assertions
      if (!geo.sidebar || geo.sidebar.width !== 230 || geo.sidebar.height !== 900) {
        throw new Error(`Sidebar geometry invalid on ${route}: ${JSON.stringify(geo.sidebar)}`)
      }
      if (!geo.topbar || geo.topbar.width !== 1136 || geo.topbar.height !== 72) {
        throw new Error(`Topbar geometry invalid on ${route}: ${JSON.stringify(geo.topbar)}`)
      }
      if (!geo.title || geo.title.x !== 260) {
        throw new Error(`Title geometry invalid on ${route}: expected x=260, got x=${geo.title?.x}`)
      }
      if (!geo.subtitle || geo.subtitle.x !== 260) {
        throw new Error(`Subtitle geometry invalid on ${route}: expected x=260, got x=${geo.subtitle?.x}`)
      }
      if (geo.panels.length === 0) {
        throw new Error(`No panels found on ${route}`)
      }
    }

    console.log('\nALL 13 BATCH 5 ROUTES PASSED GEOMETRY VALIDATION!')

    ws.close()
  } finally {
    chrome.kill()
    server.close()
  }
}

inspectBatch5Geometry().catch((err) => {
  console.error('Batch 5 Geometry verification failed:', err)
  process.exit(1)
})
