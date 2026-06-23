# Scripts de setup — execute na ordem

## 1. Firebase (uma vez)

```powershell
cd C:\Users\Duilio\Projects\Financeiro_Deyse
npm run firebase:login
node scripts/setup-firebase.mjs
```

Isso vai:
- Criar o app Web no projeto `financeiro-pessoal-cd1c0` (se não existir)
- Gerar o arquivo `.env` automaticamente
- Publicar regras e índices do Firestore

### No console Firebase (manual, 2 minutos)

1. **Authentication** → Sign-in method → ative **E-mail/Senha**
2. **Authentication** → Users → **Add user** (seu e-mail e senha)
3. **Authentication** → Settings → Authorized domains → adicione `duiliodutra.github.io`
4. **Firestore** → Create database (se ainda não existir) → modo produção

## 2. GitHub (publicar o código)

```powershell
git init
git add .
git commit -m "Sistema financeiro pessoal com Firebase"
git branch -M main
git remote add origin https://github.com/duiliodutra/financeiro.git
git push -u origin main
```

> Se o repositório `financeiro` já tiver conteúdo antigo e você quiser substituir:
> `git push -u origin main --force` (cuidado: apaga o que estava lá)

## 3. GitHub Pages + secrets

1. GitHub → repositório **financeiro** → **Settings** → **Pages** → Source: **GitHub Actions**
2. **Settings** → **Secrets and variables** → **Actions** → New repository secret

Crie estes 6 secrets (copie os valores do seu `.env`):

| Secret | Valor no .env |
|--------|----------------|
| `VITE_FIREBASE_API_KEY` | VITE_FIREBASE_API_KEY |
| `VITE_FIREBASE_AUTH_DOMAIN` | VITE_FIREBASE_AUTH_DOMAIN |
| `VITE_FIREBASE_PROJECT_ID` | VITE_FIREBASE_PROJECT_ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | VITE_FIREBASE_STORAGE_BUCKET |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | VITE_FIREBASE_MESSAGING_SENDER_ID |
| `VITE_FIREBASE_APP_ID` | VITE_FIREBASE_APP_ID |

3. Faça um push na `main` — o deploy roda sozinho.

**URL final:** https://duiliodutra.github.io/financeiro/

## 3. Testar local

```powershell
npm run dev
```

Abra http://localhost:5173 e entre com o usuário criado no Firebase.
