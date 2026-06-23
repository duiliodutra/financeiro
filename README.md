# Financeiro Deyse

Sistema pessoal de controle financeiro com blocos de contas, pessoas que você deve e pessoas que te devem. Controle mês a mês com panorama de saldo e previsão de caixa.

**Stack:** React + Vite + Tailwind CSS + Firebase (Auth + Firestore) + GitHub Pages

## Funcionalidades

- **Resumo** — cartões com saldo pessoal, contas em aberto, eu devo, me devem e previsão de fechamento
- **Previsão de caixa** — dinheiro em conta, previsão de recebimento e valor já recebido
- **Contas** — blocos personalizáveis (despesas, receitas, eu devo, me devem)
- **Lançamentos** — despesa/receita com status pago, parcial ou em aberto
- **Navegação por mês** — todos os dados filtrados pelo período selecionado

## Desenvolvimento local

```bash
npm install
cp .env.example .env
# Preencha o .env com as credenciais do Firebase
npm run dev
```

## Configurar Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/) e crie um projeto
2. Ative **Authentication** → método **E-mail/Senha**
3. Crie um usuário em Authentication → Users (uso pessoal)
4. Ative **Firestore Database** (modo produção)
5. Em Configurações do projeto → Seus apps → Web, copie as credenciais para o `.env`
6. Publique as regras e índices:

```bash
npm install -g firebase-tools
firebase login
firebase init firestore   # use os arquivos firestore.rules e firestore.indexes.json já existentes
firebase deploy --only firestore
```

7. Em Authentication → Settings → Authorized domains, adicione `seu-usuario.github.io`

## Publicar no GitHub Pages

1. Crie um repositório no GitHub (ex: `Financeiro_Deyse`)
2. Envie o código:

```bash
git init
git add .
git commit -m "Sistema financeiro pessoal"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/Financeiro_Deyse.git
git push -u origin main
```

3. No GitHub: **Settings → Pages → Source → GitHub Actions**
4. Em **Settings → Secrets and variables → Actions**, adicione os secrets:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

5. O deploy roda automaticamente a cada push na branch `main`

> Se o nome do repositório for diferente de `financeiro`, altere o `base` em `vite.config.ts`.

**Repositório:** https://github.com/duiliodutra/financeiro  
**URL publicada:** https://duiliodutra.github.io/financeiro/

## Estrutura de dados (Firestore)

| Coleção    | Descrição                                      |
|-----------|------------------------------------------------|
| `blocks`  | Blocos (categorias ou pessoas)                 |
| `entries` | Lançamentos por mês/ano                        |
| `forecasts` | Previsão de caixa por mês                    |

Cada documento inclui `userId` para isolamento por usuário autenticado.

## Tipos de bloco

| Tipo       | Uso                                      |
|-----------|------------------------------------------|
| Despesa   | Contas a pagar (luz, água, cartão...)    |
| Receita   | Entradas de dinheiro                     |
| Eu devo   | Pessoas/valores que você deve            |
| Me devem  | Pessoas/valores que te devem             |
