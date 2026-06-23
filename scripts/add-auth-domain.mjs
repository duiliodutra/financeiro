import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const projectId = 'financeiro-pessoal-cd1c0'
const newDomain = 'duiliodutra.github.io'

const config = JSON.parse(
  readFileSync(join(homedir(), '.config', 'configstore', 'firebase-tools.json'), 'utf8'),
)

let accessToken = config.tokens?.access_token

async function refreshAccessToken() {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com',
      client_secret: 'j9iVZfS8kkCEFUPaAeJV0sAi',
      refresh_token: config.tokens.refresh_token,
      grant_type: 'refresh_token',
    }),
  })
  const data = await res.json()
  if (!data.access_token) throw new Error('Falha ao renovar token')
  return data.access_token
}

async function authFetch(url, options = {}) {
  let res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  })
  if (res.status === 401) {
    accessToken = await refreshAccessToken()
    res = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
      },
    })
  }
  return res
}

const getRes = await authFetch(
  `https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/config`,
)
const current = await getRes.json()
if (!getRes.ok) {
  console.error('Erro ao ler config:', current)
  process.exit(1)
}

const domains = new Set(current.authorizedDomains ?? [])
domains.add(newDomain)

const patchRes = await authFetch(
  `https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/config?updateMask=authorizedDomains`,
  {
    method: 'PATCH',
    body: JSON.stringify({ authorizedDomains: [...domains] }),
  },
)

const result = await patchRes.json()
if (!patchRes.ok) {
  console.error('Erro ao atualizar domínios:', result)
  process.exit(1)
}

console.log('Domínios autorizados:', result.authorizedDomains?.join(', '))
