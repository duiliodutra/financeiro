import { useState } from 'react'
import { LogOut } from 'lucide-react'
import { isFirebaseConfigured } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading, login, logout } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!isFirebaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
          <h1 className="text-xl font-bold text-amber-900">Firebase não configurado</h1>
          <p className="mt-3 text-sm text-amber-800">
            Copie <code className="rounded bg-amber-100 px-1">.env.example</code> para{' '}
            <code className="rounded bg-amber-100 px-1">.env</code> e preencha as credenciais do
            seu projeto Firebase.
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setError('')
      setSubmitting(true)
      try {
        await login(email, password)
      } catch {
        setError('E-mail ou senha inválidos.')
      } finally {
        setSubmitting(false)
      }
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-lg"
        >
          <h1 className="text-2xl font-bold text-slate-800">Financeiro Deyse</h1>
          <p className="mt-1 text-sm text-slate-500">Controle pessoal de contas</p>

          <label className="mt-6 block text-sm font-medium text-slate-700">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            required
          />

          <label className="mt-4 block text-sm font-medium text-slate-700">Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            required
          />

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <>
      {children}
      <button
        type="button"
        onClick={() => logout()}
        className="fixed bottom-4 right-4 flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-600 shadow-md hover:bg-slate-50"
      >
        <LogOut size={14} />
        Sair
      </button>
    </>
  )
}
