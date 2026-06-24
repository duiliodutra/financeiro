import { cpSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'

const devIndex = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Financeiro Deyse</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`

writeFileSync('index.html', devIndex)
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
if (!process.env.CI) {
  writeFileSync('index.html', devIndex)
}

console.log('Build publicado na raiz do repositório')
