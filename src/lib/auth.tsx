import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from './supabase'
import type { Profile } from './types'
import { AuthContext, type AalLevel, type AuthContextValue } from './auth-context'

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
  const [aalLevel, setAalLevel] = useState<AalLevel | null>(null)
  const [aalResolving, setAalResolving] = useState(false)

  // Suscripción a cambios de auth (solo setState: no hacer awaits adentro del
  // callback, Supabase lo desaconseja para evitar deadlocks).
  useEffect(() => {
    if (!isSupabaseConfigured) return

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setAuthResolved(true)
      if (!nextSession) {
        // Sin sesión no queda perfil ni nivel AAL. Se limpia acá (callback de la
        // suscripción) y no en los effects para no setear estado sincrónicamente.
        setProfileState({ userId: null, profile: null })
        setAalLevel(null)
        setAalResolving(false)
      } else {
        // Con sesión, el effect de AAL resuelve el nivel (async).
        setAalResolving(true)
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

  // Nivel de assurance (AAL). Depende del objeto `session`: al verificar MFA,
  // Supabase refresca la sesión (TOKEN_REFRESHED), el objeto cambia y el effect
  // vuelve a consultar el nivel, que pasa a `aal2` y desbloquea RequireAdmin.
  // El estado se setea solo después del `await` (patrón del efecto de perfil).
  useEffect(() => {
    let cancelled = false

    async function resolveAal() {
      if (!session) return
      try {
        const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
        if (cancelled) return
        // Solo `aal2` cuenta como segundo factor verificado; cualquier otro
        // valor (incluidos valores desconocidos a futuro) queda en AAL1.
        setAalLevel(data?.currentLevel === 'aal2' ? 'aal2' : 'aal1')
      } catch {
        // Error de red indescifrable: bloqueando a AAL1 se mantiene a los
        // admins fuera de /admin hasta que la verificación quede clara.
        if (!cancelled) setAalLevel('aal1')
      } finally {
        if (!cancelled) setAalResolving(false)
      }
    }

    void resolveAal()

    return () => {
      cancelled = true
    }
  }, [session])

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

  const listMfaFactors = useCallback(async (): Promise<string[]> => {
    assertConfigured()
    const { data, error } = await supabase.auth.mfa.listFactors()
    if (error) throw new Error(error.message)
    return data.totp.map((factor) => factor.id)
  }, [])

  const enrollMfa = useCallback(async () => {
    assertConfigured()
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' })
    if (error) throw new Error(error.message)
    return { factorId: data.id, qrCode: data.totp.qr_code }
  }, [])

  const challengeMfa = useCallback(async (factorId: string): Promise<string> => {
    assertConfigured()
    const { data, error } = await supabase.auth.mfa.challenge({ factorId })
    if (error) throw new Error(error.message)
    return data.id
  }, [])

  const verifyMfa = useCallback(
    async (factorId: string, challengeId: string, code: string): Promise<void> => {
      assertConfigured()
      const { error } = await supabase.auth.mfa.verify({ factorId, challengeId, code })
      if (error) throw new Error(error.message)
      // Al verificar, Supabase renueva la sesión en segundo plano y el effect de
      // AAL detecta el nuevo objeto `session` con currentLevel = aal2.
    },
    [],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      profile,
      loading: !authResolved || profileLoading,
      configured: isSupabaseConfigured,
      aalLevel,
      aalResolving,
      signInWithMagicLink,
      signInWithPassword,
      signOut,
      listMfaFactors,
      enrollMfa,
      challengeMfa,
      verifyMfa,
    }),
    [
      session,
      profile,
      authResolved,
      profileLoading,
      aalLevel,
      aalResolving,
      signInWithMagicLink,
      signInWithPassword,
      signOut,
      listMfaFactors,
      enrollMfa,
      challengeMfa,
      verifyMfa,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
