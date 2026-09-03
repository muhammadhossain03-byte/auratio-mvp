import { spawn } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, resolve } from 'node:path'

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const PORT = 4175

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

async function inspectGeometry() {
  const distDir = resolve(process.cwd(), 'dist')
  const server = await startStaticServer(distDir)

  const cdpPort = 9228
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
      '/auth/forgot-password',
      '/auth/reset-link-sent',
      '/auth/reset-password',
      '/auth/password-reset-complete',
    ]

    for (const route of routes) {
      console.log(`\n=================== ROUTE: ${route} ===================`)
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
          const isAuth = !!document.querySelector('.auratio-auth-card');
          if (isAuth) {
            const card = document.querySelector('.auratio-auth-card');
            const elements = card ? Array.from(card.children).map(rect) : [];
            return JSON.stringify({ isAuth: true, elements });
          } else {
            const sidebar = rect(document.querySelector('.auratio-volunteer-sidebar'));
            const topbar = rect(document.querySelector('.auratio-volunteer-topbar'));
            const title = rect(document.querySelector('.auratio-volunteer-page-title'));
            const subtitle = rect(document.querySelector('.auratio-volunteer-page-subtitle'));
            const panels = Array.from(document.querySelectorAll('.auratio-volunteer-panel')).map(rect);
            return JSON.stringify({ isAuth: false, sidebar, topbar, title, subtitle, panels });
          }
        })()`,
      })

      console.log(JSON.parse(evalResult.result.value))
    }

    ws.close()
  } finally {
    chrome.kill()
    server.close()
  }
}

inspectGeometry().catch(console.error)
