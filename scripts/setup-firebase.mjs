#!/usr/bin/env node
/**
 * Configura Firebase e gera o .env local.
 * Rode após: npm run firebase:login
 */
import { execSync } from 'node:child_process'
import { writeFileSync, existsSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const projectId = 'financeiro-pessoal-cd1c0'

function run(cmd) {
  return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim()
}

try {
  run('npx firebase projects:list')
} catch {
  console.error('\n❌ Firebase não autenticado. Rode primeiro:\n   npm run firebase:login\n')
  process.exit(1)
}

let appsJson
try {
  appsJson = run(`npx firebase apps:list --project ${projectId} --json`)
} catch (e) {
  console.error('Erro ao listar apps:', e.message)
  process.exit(1)
}

const apps = JSON.parse(appsJson)
const webApps = apps.result?.filter((a) => a.platform === 'WEB') ?? []

let appId = webApps[0]?.appId

if (!appId) {
  console.log('Nenhum app Web encontrado. Criando app "Financeiro Deyse"...')
  const created = run(
    `npx firebase apps:create WEB "Financeiro Deyse" --project ${projectId} --json`,
  )
  appId = JSON.parse(created).result?.appId
}

if (!appId) {
  console.error('Não foi possível obter ou criar o app Web.')
  process.exit(1)
}

const sdkJson = run(`npx firebase apps:sdkconfig WEB ${appId} --project ${projectId} --json`)
const sdk = JSON.parse(sdkJson).result?.sdkConfig ?? JSON.parse(sdkJson).sdkConfig

if (!sdk) {
  console.error('Não foi possível obter sdkConfig.')
  process.exit(1)
}

const envContent = `VITE_FIREBASE_API_KEY=${sdk.apiKey}
VITE_FIREBASE_AUTH_DOMAIN=${sdk.authDomain}
VITE_FIREBASE_PROJECT_ID=${sdk.projectId}
VITE_FIREBASE_STORAGE_BUCKET=${sdk.storageBucket}
VITE_FIREBASE_MESSAGING_SENDER_ID=${sdk.messagingSenderId}
VITE_FIREBASE_APP_ID=${sdk.appId}
`

const envPath = '.env'
writeFileSync(envPath, envContent)
console.log(`\n✅ ${envPath} criado com sucesso!`)
console.log(`   Projeto: ${sdk.projectId}`)
console.log(`   App ID:  ${sdk.appId}`)

console.log('\nPublicando regras do Firestore...')
try {
  execSync('npx firebase deploy --only firestore', { stdio: 'inherit' })
  console.log('\n✅ Firestore rules e índices publicados.')
} catch {
  console.log('\n⚠️  Não foi possível publicar o Firestore automaticamente.')
  console.log('   Rode manualmente: npm run firebase:deploy')
}

if (!existsSync('.env')) {
  process.exit(1)
}

console.log('\nPróximo passo: npm run dev')
