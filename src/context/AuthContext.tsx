import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  GoogleAuthProvider,
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type User,
} from 'firebase/auth'
import { isAllowedEmail } from '../lib/allowedUsers'
import { auth } from '../lib/firebase'

interface AuthContextValue {
  user: User | null
  loading: boolean
  signingIn: boolean
  authError: string | null
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  clearAuthError: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function cleanAuthUrl() {
  const url = new URL(window.location.href)
  let dirty = false

  for (const key of ['apiKey', 'oobCode', 'mode', 'lang', 'authType', 'continueUrl']) {
    if (url.searchParams.has(key)) {
      url.searchParams.delete(key)
      dirty = true
    }
  }

  if (url.hash.includes('__/auth/') || url.hash.includes('apiKey=')) {
    url.hash = ''
    dirty = true
  }

  if (dirty) {
    const next = `${url.pathname}${url.search}`
    window.history.replaceState({}, document.title, next)
  }
}

function googleProvider() {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  return provider
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [signingIn, setSigningIn] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }

    let active = true

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

    const boot = async () => {
      try {
        const result = await getRedirectResult(auth!)
        if (active && result?.user) {
          await validateUser(result.user)
        }
      } catch {
        if (active) setAuthError('Não foi possível entrar com Google.')
      } finally {
        cleanAuthUrl()
      }
    }

    void boot()

    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!active) return
      await validateUser(u)
      setLoading(false)
    })

    return () => {
      active = false
      unsub()
    }
  }, [])

  const loginWithGoogle = useCallback(async () => {
    if (!auth) throw new Error('Firebase não configurado')

    setAuthError(null)
    setSigningIn(true)

    try {
      await signOut(auth)
      const provider = googleProvider()

      try {
        await signInWithPopup(auth, provider)
      } catch (error) {
        const code = (error as { code?: string }).code
        if (code === 'auth/popup-closed-by-user') return
        if (code === 'auth/popup-blocked') {
          await signInWithRedirect(auth, provider)
          return
        }
        throw error
      }
    } catch {
      setAuthError('Não foi possível entrar com Google. Tente novamente.')
    } finally {
      setSigningIn(false)
      cleanAuthUrl()
    }
  }, [])

  const logout = useCallback(async () => {
    if (!auth) return
    setAuthError(null)
    await signOut(auth)
    setUser(null)
    cleanAuthUrl()
  }, [])

  const clearAuthError = useCallback(() => setAuthError(null), [])

  const value = useMemo(
    () => ({
      user,
      loading,
      signingIn,
      authError,
      loginWithGoogle,
      logout,
      clearAuthError,
    }),
    [user, loading, signingIn, authError, loginWithGoogle, logout, clearAuthError],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}
