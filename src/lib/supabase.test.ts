import { describe, expect, it } from 'vitest'
import { isSupabaseConfigured, supabase } from './supabase'

describe('supabase client', () => {
  it('crea el cliente sin lanzar aunque falten las variables de entorno', () => {
    expect(typeof isSupabaseConfigured).toBe('boolean')
    expect(supabase).toBeDefined()
    expect(typeof supabase.auth.signInWithOtp).toBe('function')
    expect(typeof supabase.from).toBe('function')
  })

  it('usa flujo PKCE para el auth (SEC-008): los tokens no viajan en la URL del redirect', () => {
    // GoTrueClient expone `flowType` como propiedad en runtime (default era
    // 'implicit'; SEC-008 lo fija a 'pkce' para sacar tokens de la URL).
    expect((supabase.auth as unknown as { flowType?: string }).flowType).toBe('pkce')
  })
})
