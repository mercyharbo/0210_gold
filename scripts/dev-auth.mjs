import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const child = spawn(
  process.execPath,
  [
    require.resolve('next/dist/bin/next'),
    'dev',
    '-p',
    process.env.AUTH_PREVIEW_PORT || '4100',
  ],
  {
    stdio: 'inherit',
    env: { ...process.env, AUTH_PROVIDER: 'neon' },
  },
)
child.on('exit', (code) => process.exit(code ?? 1))
