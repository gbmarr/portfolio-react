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

export type Passkey = {
  id: string
  friendly_name?: string | null
  created_at?: string
  last_used_at?: string | null
}

export type AuthContextValue = {
  session: Session | null
  profile: Profile | null
  /** `true` mientras se resuelve la sesión o el perfil. */
  loading: boolean
  configured: boolean
  /** `null` hasta que se cargan las passkeys de la sesión actual. */
  passkeys: Passkey[] | null
  signInWithMagicLink: (email: string) => Promise<void>
  signInWithPassword: (email: string, password: string) => Promise<void>
  signInWithPasskey: () => Promise<void>
  registerPasskey: () => Promise<void>
  refreshPasskeys: () => Promise<void>
  deletePasskey: (id: string) => Promise<void>
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
  const [passkeys, setPasskeys] = useState<Passkey[] | null>(null)
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
      // Sin sesión no quedan perfil ni passkeys. Se limpian acá (callback de la
      // suscripción) y no en los effects para no setear estado sincrónicamente.
      if (!nextSession) {
        setProfileState({ userId: null, profile: null })
        setPasskeys(null)
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

  // Carga las passkeys (si el dashboard las tiene habilitadas) por usuario.
  // Los errores se ignoran a propósito: sin passkeys habilitadas la sesión
  // de auth sigue funcionando con magic link / password.
  useEffect(() => {
    if (!isSupabaseConfigured) return
    const userId = session?.user.id
    // Sin usuario, la limpieza ya la hizo el callback de onAuthStateChange.
    if (!userId) return

    let cancelled = false

    async function loadPasskeys() {
      try {
        const { data, error } = await supabase.auth.passkey.list()
        if (!cancelled && !error) setPasskeys(data ?? [])
      } catch {
        // Sin soporte o sin habilitar: se deja lo que haya.
      }
    }

    void loadPasskeys()

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

  const signInWithPasskey = useCallback(async () => {
    assertConfigured()
    const { error } = await supabase.auth.signInWithPasskey()
    if (error) throw new Error(error.message)
  }, [])

  const refreshPasskeys = useCallback(async () => {
    assertConfigured()
    const { data, error } = await supabase.auth.passkey.list()
    if (error) throw new Error(error.message)
    setPasskeys(data ?? [])
  }, [])

  const registerPasskey = useCallback(async () => {
    assertConfigured()
    const { error } = await supabase.auth.registerPasskey()
    if (error) throw new Error(error.message)
    await refreshPasskeys()
  }, [refreshPasskeys])

  const deletePasskey = useCallback(async (id: string) => {
    assertConfigured()
    const { error } = await supabase.auth.passkey.delete({ passkeyId: id })
    if (error) throw new Error(error.message)
    setPasskeys((prev) => prev?.filter((p) => p.id !== id) ?? null)
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
      passkeys,
      signInWithMagicLink,
      signInWithPassword,
      signInWithPasskey,
      registerPasskey,
      refreshPasskeys,
      deletePasskey,
      signOut,
    }),
    [
      session,
      profile,
      passkeys,
      authResolved,
      profileLoading,
      signInWithMagicLink,
      signInWithPassword,
      signInWithPasskey,
      registerPasskey,
      refreshPasskeys,
      deletePasskey,
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
