import { useEffect, useState } from 'react'
import {
  GoogleAuthProvider,
  getRedirectResult,
  onAuthStateChanged,
  signInWithRedirect,
  signOut,
  type User,
} from 'firebase/auth'
import { isAllowedEmail } from '../lib/allowedUsers'
import { auth } from '../lib/firebase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }

    let cancelled = false

    const validateUser = async (u: User | null) => {
      if (!u) {
        setUser(null)
        return
      }

      const email = u.email?.toLowerCase()
      if (!email || !isAllowedEmail(email)) {
        await signOut(auth!)
        setUser(null)
        setAuthError('Este e-mail não tem permissão para acessar o sistema.')
        return
      }

      setAuthError(null)
      setUser(u)
    }

    getRedirectResult(auth)
      .then(async (result) => {
        if (cancelled || !result?.user) return
        await validateUser(result.user)
      })
      .catch(() => {
        if (!cancelled) setAuthError('Não foi possível entrar com Google.')
      })

    const unsub = onAuthStateChanged(auth, async (u) => {
      if (cancelled) return
      await validateUser(u)
      setLoading(false)
    })

    return () => {
      cancelled = true
      unsub()
    }
  }, [])

  const loginWithGoogle = async () => {
    if (!auth) throw new Error('Firebase não configurado')
    setAuthError(null)
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })
    await signInWithRedirect(auth, provider)
  }

  const logout = () => {
    if (!auth) return Promise.resolve()
    setAuthError(null)
    return signOut(auth)
  }

  return { user, loading, authError, loginWithGoogle, logout, clearAuthError: () => setAuthError(null) }
}
