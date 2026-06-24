import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const projectId = 'financeiro-pessoal-cd1c0'
const users = ['duiliodudu@gmail.com', 'deysinhalmeida@gmail.com']

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
  if (!data.access_token) throw new Error('Falha ao renovar token Firebase')
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

async function parseJson(res) {
  const text = await res.text()
  return text ? JSON.parse(text) : {}
}

async function enableGoogleSignIn() {
  const listRes = await authFetch(
    `https://identitytoolkit.googleapis.com/v2/projects/${projectId}/defaultSupportedIdpConfigs`,
  )
  const list = await parseJson(listRes)
  const googleConfig = list.defaultSupportedIdpConfigs?.find((c) =>
    c.name?.endsWith('/google.com'),
  )

  if (googleConfig?.enabled) {
    console.log('✓ Login com Google já estava ativo')
    return
  }

  if (googleConfig) {
    const patchRes = await authFetch(
      `https://identitytoolkit.googleapis.com/v2/${googleConfig.name}?updateMask=enabled`,
      {
        method: 'PATCH',
        body: JSON.stringify({ enabled: true }),
      },
    )
    const body = await parseJson(patchRes)
    if (patchRes.ok) {
      console.log('✓ Login com Google ativado')
      return
    }
    console.error('Erro ao ativar Google:', body)
    return
  }

  const createRes = await authFetch(
    `https://identitytoolkit.googleapis.com/v2/projects/${projectId}/defaultSupportedIdpConfigs?idpId=google.com`,
    {
      method: 'POST',
      body: JSON.stringify({ enabled: true }),
    },
  )
  const body = await parseJson(createRes)
  if (createRes.ok) {
    console.log('✓ Login com Google ativado')
    return
  }
  console.error('Erro ao criar config Google:', body)
}

async function disableEmailPassword() {
  const res = await authFetch(
    `https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/config?updateMask=signIn.email.enabled,signIn.email.passwordRequired`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        signIn: {
          email: { enabled: false, passwordRequired: false },
        },
      }),
    },
  )
  if (res.ok) {
    console.log('✓ Login com e-mail/senha desativado')
    return
  }
  const body = await parseJson(res)
  console.error('Erro ao desativar e-mail/senha:', body)
}

console.log('Configurando autenticação Firebase...\n')
await enableGoogleSignIn()
await disableEmailPassword()
console.log('\nAcesso permitido apenas com Google para:')
for (const email of users) {
  console.log(`  • ${email}`)
}
