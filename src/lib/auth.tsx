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
  // Perfil junto al usuario al que pertenece: permite derivar "cargando"
  // (userId actual !== userId del perfil) sin setState sincrónico en effects.
  const [profileState, setProfileState] = useState<{ userId: string | null; profile: Profile | null }>({
    userId: null,
    profile: null,
  })
  const [authResolved, setAuthResolved] = useState(!isSupabaseConfigured)

  // Suscripción a cambios de auth (solo setState: no hacer awaits adentro del
  // callback, Supabase lo desaconseja para evitar deadlocks).
  useEffect(() => {
    if (!isSupabaseConfigured) return

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setAuthResolved(true)
      // Sin sesión no queda perfil. Se limpia acá (callback de la
      // suscripción) y no en los effects para no setear estado sincrónicamente.
      if (!nextSession) {
        setProfileState({ userId: null, profile: null })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Carga del perfil (rol) cada vez que cambia el usuario de la sesión.
  const userId = session?.user.id ?? null
  useEffect(() => {
    // Sin usuario, la limpieza ya la hizo el callback de onAuthStateChange.
    if (!userId) return

    let cancelled = false

    async function loadProfile() {
      try {
        const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
        if (!cancelled) {
          setProfileState({ userId, profile: (data as Profile | null) ?? null })
        }
      } catch {
        // Sin perfil cargable: se queda sin rol (comportamiento previo).
        if (!cancelled) setProfileState({ userId, profile: null })
      }
    }

    void loadProfile()

    return () => {
      cancelled = true
    }
  }, [userId])

  // El perfil se expone solo si pertenece al usuario de la sesión actual.
  const profile = userId !== null && profileState.userId === userId ? profileState.profile : null
  const profileLoading = userId !== null && profileState.userId !== userId

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
    [
      session,
      profile,
      authResolved,
      profileLoading,
      signInWithMagicLink,
      signInWithPassword,
      signOut,
    ],
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
