import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const node = process.execPath
const viteCli = fileURLToPath(new URL('../node_modules/vite/bin/vite.js', import.meta.url))
const children = [
  spawn(node, ['server/index.js'], { stdio: 'inherit', env: process.env }),
  spawn(node, [viteCli, '--host', '0.0.0.0'], { stdio: 'inherit', env: process.env })
]

let closing = false
function shutdown(code = 0) {
  if (closing) return
  closing = true
  for (const child of children) child.kill('SIGINT')
  process.exit(code)
}

for (const child of children) child.on('exit', (code) => { if (!closing && code) shutdown(code) })
process.on('SIGINT', () => shutdown())
process.on('SIGTERM', () => shutdown())
