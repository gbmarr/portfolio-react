import { createContext, useContext } from 'react'
import type { Session } from '@supabase/supabase-js'
import type { Profile } from './types'

/** Nivel de assurance de la sesión (AAL1: solo primer factor; AAL2: MFA). */
export type AalLevel = 'aal1' | 'aal2'

export type AuthContextValue = {
  session: Session | null
  profile: Profile | null
  /** `true` mientras se resuelve la sesión o el perfil. */
  loading: boolean
  configured: boolean
  /** Nivel de assurance de la sesión actual (`null` cuando no hay sesión). */
  aalLevel: AalLevel | null
  /** `true` mientras se resuelve el nivel AAL de la sesión actual. */
  aalResolving: boolean
  /**
   * Pide un enlace mágico para una cuenta existente. NO crea usuarios nuevos
   * (`shouldCreateUser: false`): si el email no tiene cuenta, el error tiene
   * `code === 'user_not_found'` (la UI lo trata como envío genérico).
   */
  signInWithMagicLink: (email: string) => Promise<void>
  /**
   * Invitación del admin: envía un enlace mágico y, si el cliente todavía no
   * tiene cuenta, la crea (`shouldCreateUser: true`). Uso exclusivo del panel.
   */
  inviteByMagicLink: (email: string) => Promise<void>
  signInWithPassword: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  /** IDs de los factores TOTP enrolados por el usuario actual. */
  listMfaFactors: () => Promise<string[]>
  /** Enrola un factor TOTP y devuelve el id del factor y el QR para escanear. */
  enrollMfa: () => Promise<{ factorId: string; qrCode: string }>
  /** Abre un desafío MFA para el factor indicado; devuelve el challenge id. */
  challengeMfa: (factorId: string) => Promise<string>
  /** Verifica el código TOTP; al confirmar, la sesión sube a AAL2. */
  verifyMfa: (factorId: string, challengeId: string, code: string) => Promise<void>
}

/**
 * Contexto de auth. Vive en un módulo propio (sin JSX) para mantener
 * `auth.tsx` como archivo solo-componente (fast refresh de Vite).
 */
export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  }
  return context
}
