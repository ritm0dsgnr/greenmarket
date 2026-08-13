import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const port = 3119
const nextCliPath = fileURLToPath(new URL('../node_modules/next/dist/bin/next', import.meta.url))
const environment: NodeJS.ProcessEnv = {
  ...process.env,
  PORT: String(port),
}

delete environment.APP_BASE_URL
delete environment.DATABASE_URL

const child = spawn(process.execPath, [nextCliPath, 'start', '--port', String(port)], {
  cwd: process.cwd(),
  env: environment,
  stdio: 'pipe',
})

let output = ''

child.stdout.on('data', (chunk: Buffer) => {
  output += chunk.toString()
})

child.stderr.on('data', (chunk: Buffer) => {
  output += chunk.toString()
})

const result = await new Promise<{ code: number | null; signal: NodeJS.Signals | null }>(
  (resolve, reject) => {
    const timeout = setTimeout(() => {
      child.kill()
      reject(new Error('Next.js started without required production configuration.'))
    }, 5_000)

    child.once('error', reject)
    child.once('exit', (code, signal) => {
      clearTimeout(timeout)
      resolve({ code, signal })
    })
  },
)

if (result.code === 0 || result.signal || !output.includes('Production configuration is invalid: APP_BASE_URL, DATABASE_URL.')) {
  throw new Error(`Production startup validation did not fail as expected. Output:\n${output}`)
}

console.log('Direct Next.js startup rejects missing production configuration.')
