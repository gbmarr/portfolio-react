import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from './supabase'
import type { Profile } from './types'

export type AuthContextValue = {
  session: Session | null
  profile: Profile | null
  /** `true` mientras se resuelve la sesión o el perfil. */
  loading: boolean
  configured: boolean
  signInWithMagicLink: (email: string) => Promise<void>
  signInWithPassword: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function assertConfigured(): void {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase no está configurado (faltan DATABASE_URL / DATABASE_PUBLISHABLE_KEY)')
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [authResolved, setAuthResolved] = useState(!isSupabaseConfigured)
  const [profileLoading, setProfileLoading] = useState(false)

  // Suscripción a cambios de auth (solo setState: no hacer awaits adentro del
  // callback, Supabase lo desaconseja para evitar deadlocks).
  useEffect(() => {
    if (!isSupabaseConfigured) return

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setAuthResolved(true)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Carga del perfil (rol) cada vez que cambia el usuario de la sesión.
  useEffect(() => {
    const userId = session?.user.id
    if (!userId) {
      setProfile(null)
      return
    }

    let cancelled = false
    setProfileLoading(true)

    async function loadProfile() {
      try {
        const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
        if (!cancelled) setProfile((data as Profile | null) ?? null)
      } finally {
        if (!cancelled) setProfileLoading(false)
      }
    }

    void loadProfile()

    return () => {
      cancelled = true
    }
  }, [session?.user.id])

  const signInWithMagicLink = useCallback(async (email: string) => {
    assertConfigured()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // El enlace aterriza en /login: ahí se detecta la sesión y se redirige
        // al panel correspondiente según el rol.
        emailRedirectTo: `${window.location.origin}/login`,
      },
    })
    if (error) throw new Error(error.message)
  }, [])

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    assertConfigured()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
  }, [])

  const signOut = useCallback(async () => {
    assertConfigured()
    const { error } = await supabase.auth.signOut()
    if (error) throw new Error(error.message)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      profile,
      loading: !authResolved || profileLoading,
      configured: isSupabaseConfigured,
      signInWithMagicLink,
      signInWithPassword,
      signOut,
    }),
    [session, profile, authResolved, profileLoading, signInWithMagicLink, signInWithPassword, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  }
  return context
}
