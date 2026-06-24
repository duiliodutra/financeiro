import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
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

function publishTo(targetDir) {
  mkdirSync(targetDir, { recursive: true })
  for (const file of ['index.html', 'favicon.svg', 'icons.svg']) {
    cpSync(`dist/${file}`, `${targetDir}/${file}`)
  }
  rmSync(`${targetDir}/assets`, { recursive: true, force: true })
  cpSync('dist/assets', `${targetDir}/assets`, { recursive: true })
  writeFileSync(`${targetDir}/.nojekyll`, '')
  const index = readFileSync(`${targetDir}/index.html`, 'utf8')
  writeFileSync(`${targetDir}/404.html`, index)
}

writeFileSync('index.html', devIndex)
process.env.GITHUB_PAGES = 'true'
execSync('npm run build', { stdio: 'inherit', env: process.env })

publishTo('.')
publishTo('docs')

writeFileSync('.nojekyll', '')
if (!process.env.CI) {
  writeFileSync('index.html', devIndex)
}

console.log('Build publicado na raiz e em docs/')
