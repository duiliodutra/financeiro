import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'

process.env.GITHUB_PAGES = 'true'
execSync('npm run build', { stdio: 'inherit', env: process.env })

rmSync('docs', { recursive: true, force: true })
mkdirSync('docs')
cpSync('dist', 'docs', { recursive: true })

const index = readFileSync('docs/index.html', 'utf8')
writeFileSync('docs/404.html', index)
writeFileSync('docs/.nojekyll', '')

console.log('Pasta docs/ pronta para publicação')
