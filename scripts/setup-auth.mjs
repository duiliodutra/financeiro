import { readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const projectId = 'financeiro-pessoal-cd1c0'
const users = ['duiliodudu@gmail.com', 'deysinhalmeida@gmail.com']
const tempPassword = 'FinanceiroDeyse2026!'

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

async function createUser(email) {
  const res = await authFetch(
    `https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts`,
    {
      method: 'POST',
      body: JSON.stringify({
        email,
        password: tempPassword,
        emailVerified: true,
        disabled: false,
      }),
    },
  )
  const body = await parseJson(res)
  if (res.ok) {
    console.log(`✓ Usuário criado: ${email}`)
    return
  }
  if (body.error?.message?.includes('EMAIL_EXISTS')) {
    console.log(`• Usuário já existe: ${email}`)
    return
  }
  console.error(`✗ Erro ao criar ${email}:`, body.error?.message ?? body)
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

async function enableEmailPassword() {
  const res = await authFetch(
    `https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/config?updateMask=signIn.email.enabled,signIn.email.passwordRequired`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        signIn: {
          email: { enabled: true, passwordRequired: true },
        },
      }),
    },
  )
  if (res.ok) {
    console.log('✓ Login com e-mail/senha confirmado')
    return
  }
  const body = await parseJson(res)
  console.error('Erro ao configurar e-mail/senha:', body)
}

console.log('Configurando autenticação Firebase...\n')
await enableEmailPassword()
await enableGoogleSignIn()
for (const email of users) {
  await createUser(email)
}

const credsFile = join(process.cwd(), '.auth-setup.txt')
writeFileSync(
  credsFile,
  `Senha inicial para ambos os usuários: ${tempPassword}\n\nAltere após o primeiro acesso.\n`,
)
console.log(`\nSenha inicial: ${tempPassword}`)
console.log('(salva também em .auth-setup.txt — não vai para o GitHub)')
