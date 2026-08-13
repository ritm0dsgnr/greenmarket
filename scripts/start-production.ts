import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { validateProductionEnvironment } from '../src/config/production-environment'

validateProductionEnvironment(process.env)

const nextCliPath = fileURLToPath(new URL('../node_modules/next/dist/bin/next', import.meta.url))

const child = spawn(process.execPath, [nextCliPath, 'start'], {
  env: process.env,
  stdio: 'inherit',
})

const stopChild = () => {
  child.kill('SIGTERM')
}

process.once('SIGINT', stopChild)
process.once('SIGTERM', stopChild)

child.once('error', (error) => {
  console.error(`Unable to start Next.js: ${error.message}`)
  process.exitCode = 1
})

child.once('exit', (code, signal) => {
  process.off('SIGINT', stopChild)
  process.off('SIGTERM', stopChild)

  if (signal) {
    process.exitCode = signal === 'SIGTERM' ? 0 : 1
    return
  }

  process.exitCode = code ?? 1
})
