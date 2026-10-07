import { describe, expect, it } from 'vitest'
import { isSupabaseConfigured, supabase } from './supabase'

describe('supabase client', () => {
  it('crea el cliente sin lanzar aunque falten las variables de entorno', () => {
    expect(typeof isSupabaseConfigured).toBe('boolean')
    expect(supabase).toBeDefined()
    expect(typeof supabase.auth.signInWithOtp).toBe('function')
    expect(typeof supabase.from).toBe('function')
  })
})
