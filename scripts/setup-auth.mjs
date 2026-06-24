import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const projectId = 'financeiro-pessoal-cd1c0'
const projectNumber = '378029746975'
const oauthClientId = 'financeiro-web'
const users = ['duiliodudu@gmail.com', 'deysinhalmeida@gmail.com']

const redirectUris = [
  `https://${projectId}.firebaseapp.com/__/auth/handler`,
  `https://${projectId}.web.app/__/auth/handler`,
]

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
  if (!text) return {}
  try {
    return JSON.parse(text)
  } catch {
    return { _raw: text.slice(0, 300) }
  }
}

async function enableApi(serviceName) {
  const res = await authFetch(
    `https://serviceusage.googleapis.com/v1/projects/${projectNumber}/services/${serviceName}:enable`,
    { method: 'POST', body: '{}' },
  )
  if (res.ok || res.status === 409) return
  const body = await parseJson(res)
  console.warn(`API ${serviceName}:`, body.error?.message ?? res.status)
}

async function getGoogleIdpConfig() {
  const res = await authFetch(
    `https://identitytoolkit.googleapis.com/v2/projects/${projectId}/defaultSupportedIdpConfigs`,
  )
  const body = await parseJson(res)
  return body.defaultSupportedIdpConfigs?.find((c) => c.name?.endsWith('/google.com'))
}

async function ensureOAuthClient() {
  const parent = `projects/${projectNumber}/locations/global`
  const clientPath = `${parent}/oauthClients/${oauthClientId}`

  let clientRes = await authFetch(`https://iam.googleapis.com/v1/${clientPath}`)
  let client = await parseJson(clientRes)

  if (!clientRes.ok) {
    const createRes = await authFetch(`https://iam.googleapis.com/v1/${parent}/oauthClients?oauthClientId=${oauthClientId}`, {
      method: 'POST',
      body: JSON.stringify({
        displayName: 'Financeiro Web',
        clientType: 'CONFIDENTIAL_CLIENT',
        allowedGrantTypes: ['AUTHORIZATION_CODE_GRANT'],
        allowedScopes: ['openid', 'email', 'profile'],
        allowedRedirectUris: redirectUris,
      }),
    })
    client = await parseJson(createRes)
    if (!createRes.ok) {
      throw new Error(`Erro ao criar OAuth client: ${JSON.stringify(client)}`)
    }
    console.log('✓ Cliente OAuth criado')
  } else {
    console.log('✓ Cliente OAuth já existe')
  }

  let clientId = client.clientId
  let clientSecret = client.clientSecret

  if (!clientSecret) {
    const credRes = await authFetch(
      `https://iam.googleapis.com/v1/${clientPath}/credentials?oauthClientCredentialId=auth-v2`,
      { method: 'POST', body: '{}' },
    )
    const cred = await parseJson(credRes)
    if (credRes.ok) {
      clientSecret = cred.clientSecret
      console.log('✓ Nova credencial OAuth gerada')
    } else if (cred.error?.status === 'ALREADY_EXISTS') {
      const existing = await getGoogleIdpConfig()
      clientId = existing?.clientId ?? clientId
      clientSecret = existing?.clientSecret
      console.log('• Reutilizando credencial já vinculada ao Firebase')
    } else {
      throw new Error(`Erro ao gerar credencial OAuth: ${JSON.stringify(cred)}`)
    }
  }

  if (!clientId || !clientSecret) {
    throw new Error('Não foi possível obter clientId/clientSecret do OAuth')
  }

  return { clientId, clientSecret }
}

async function enableGoogleSignIn(clientId, clientSecret) {
  const existing = await getGoogleIdpConfig()
  if (existing?.enabled && existing.clientId) {
    console.log('✓ Login com Google já estava ativo')
    return
  }

  const payload = {
    name: `projects/${projectId}/defaultSupportedIdpConfigs/google.com`,
    enabled: true,
    clientId,
    clientSecret,
  }

  if (existing) {
    const patchRes = await authFetch(
      `https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/defaultSupportedIdpConfigs/google.com?updateMask=enabled,clientId,clientSecret`,
      { method: 'PATCH', body: JSON.stringify(payload) },
    )
    const body = await parseJson(patchRes)
    if (patchRes.ok) {
      console.log('✓ Login com Google ativado')
      return
    }
    throw new Error(`Erro ao ativar Google: ${JSON.stringify(body)}`)
  }

  const createRes = await authFetch(
    `https://identitytoolkit.googleapis.com/v2/projects/${projectId}/defaultSupportedIdpConfigs?idpId=google.com`,
    { method: 'POST', body: JSON.stringify(payload) },
  )
  const body = await parseJson(createRes)
  if (createRes.ok) {
    console.log('✓ Login com Google ativado')
    return
  }
  throw new Error(`Erro ao criar Google IDP: ${JSON.stringify(body)}`)
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
await enableApi('iap.googleapis.com')
await enableApi('identitytoolkit.googleapis.com')

const { clientId, clientSecret } = await ensureOAuthClient()
await enableGoogleSignIn(clientId, clientSecret)
await disableEmailPassword()

console.log('\nAcesso permitido com Google para:')
for (const email of users) {
  console.log(`  • ${email}`)
}
