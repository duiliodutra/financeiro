import { execSync } from 'node:child_process'

function getGithubToken() {
  const input = 'protocol=https\nhost=github.com\n\n'
  const out = execSync('git credential fill', {
    input,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  })
  const match = out.match(/^password=(.+)$/m)
  if (!match) throw new Error('Token GitHub não encontrado no credential manager')
  return match[1].trim()
}

const token = getGithubToken()
const owner = 'duiliodutra'
const repo = 'financeiro'

const payload = {
  build_type: 'legacy',
  source: { branch: 'main', path: '/docs' },
}

let res = await fetch(`https://api.github.com/repos/${owner}/${repo}/pages`, {
  method: 'PUT',
  headers: {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload),
})

if (res.status === 404) {
  res = await fetch(`https://api.github.com/repos/${owner}/${repo}/pages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
}

const text = await res.text()
const body = text ? JSON.parse(text) : {}
if (!res.ok) {
  console.error('Erro:', body)
  process.exit(1)
}

console.log('GitHub Pages configurado:', body.html_url ?? 'ok')
