import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const port = 3118
const tsxCliPath = fileURLToPath(new URL('../node_modules/tsx/dist/cli.mjs', import.meta.url))
const child = spawn(process.execPath, [tsxCliPath, 'scripts/start-production.ts'], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    APP_BASE_URL: 'https://greenmarket.example',
    DATABASE_URL: 'postgresql://health:health@localhost:5432/greenmarket',
    PORT: String(port),
  },
  stdio: 'pipe',
})

let output = ''

child.stdout.on('data', (chunk: Buffer) => {
  output += chunk.toString()
})

child.stderr.on('data', (chunk: Buffer) => {
  output += chunk.toString()
})

async function waitForHealthCheck() {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/api/health`)

      if (!response.ok) {
        throw new Error(`Health endpoint returned HTTP ${response.status}.`)
      }

      const body = await response.json()
      const headers = response.headers

      if (
        body.status !== 'ok' ||
        headers.get('cache-control') !== 'no-store' ||
        headers.get('referrer-policy') !== 'strict-origin-when-cross-origin' ||
        headers.get('x-content-type-options') !== 'nosniff' ||
        headers.get('x-frame-options') !== 'DENY'
      ) {
        throw new Error('Health endpoint did not return the expected response or security headers.')
      }

      return
    } catch (error) {
      if (attempt === 19) {
        throw error
      }

      await new Promise((resolve) => {
        setTimeout(resolve, 250)
      })
    }
  }
}

try {
  await waitForHealthCheck()
  console.log('Local production health endpoint and security headers verified.')
} finally {
  child.kill()

  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Unable to stop local production process. Output:\n${output}`))
    }, 5_000)

    child.once('exit', () => {
      clearTimeout(timeout)
      resolve()
    })
  })
}
