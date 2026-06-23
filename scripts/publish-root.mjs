import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'

process.env.GITHUB_PAGES = 'true'
execSync('npm run build', { stdio: 'inherit', env: process.env })

const files = ['index.html', 'favicon.svg', 'icons.svg']
for (const file of files) {
  cpSync(`dist/${file}`, file)
}

rmSync('assets', { recursive: true, force: true })
cpSync('dist/assets', 'assets', { recursive: true })

writeFileSync('.nojekyll', '')
const index = readFileSync('index.html', 'utf8')
writeFileSync('404.html', index)

console.log('Build publicado na raiz do repositório')
