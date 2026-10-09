import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'

const mocks = vi.hoisted(() => ({
  onAuthStateChange: vi.fn(),
  signInWithOtp: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  maybeSingle: vi.fn(),
  configured: { value: true },
}))

vi.mock('./supabase', () => ({
  get isSupabaseConfigured() {
    return mocks.configured.value
  },
  supabase: {
    auth: {
      onAuthStateChange: mocks.onAuthStateChange,
      signInWithOtp: mocks.signInWithOtp,
      signInWithPassword: mocks.signInWithPassword,
      signOut: mocks.signOut,
    },
    from: () => ({
      select: () => ({
        eq: () => ({ maybeSingle: mocks.maybeSingle }),
      }),
    }),
  },
}))

import { AuthProvider, useAuth } from './auth'

type AuthCallback = (event: string, session: unknown) => void

let authCallback: AuthCallback
const unsubscribe = vi.fn()

const wrapper = ({ children }: { children: ReactNode }) => <AuthProvider>{children}</AuthProvider>

const sessionFixture = { user: { id: 'user-1' } } as never
const profileFixture = { id: 'user-1', role: 'admin', email: 'yo@test.com' }

beforeEach(() => {
  vi.clearAllMocks()
  mocks.configured.value = true
  mocks.onAuthStateChange.mockImplementation((callback: AuthCallback) => {
    authCallback = callback
    return { data: { subscription: { unsubscribe } } }
  })
  mocks.maybeSingle.mockResolvedValue({ data: profileFixture })
})

describe('AuthProvider', () => {
  it('mantiene loading hasta resolver sesión y perfil', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.loading).toBe(true)

    act(() => authCallback('INITIAL_SESSION', sessionFixture))
    expect(result.current.session).toBe(sessionFixture)

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.profile).toEqual(profileFixture)
    expect(result.current.session).toBe(sessionFixture)
  })

  it('resuelve sin sesión cuando INITIAL_SESSION viene vacía', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    act(() => authCallback('INITIAL_SESSION', null))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.session).toBeNull()
    expect(result.current.profile).toBeNull()
    expect(mocks.maybeSingle).not.toHaveBeenCalled()
  })

  it('envuelve signInWithOtp y agrega el redirect a /login', async () => {
    mocks.signInWithOtp.mockResolvedValue({ error: null })
    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.signInWithMagicLink('cliente@test.com')
    })

    expect(mocks.signInWithOtp).toHaveBeenCalledWith({
      email: 'cliente@test.com',
      options: { emailRedirectTo: `${window.location.origin}/login` },
    })
  })

  it('lanza cuando signInWithOtp devuelve error', async () => {
    mocks.signInWithOtp.mockResolvedValue({ error: { message: 'rate limit' } })
    const { result } = renderHook(() => useAuth(), { wrapper })

    await expect(result.current.signInWithMagicLink('a@b.com')).rejects.toThrow('rate limit')
  })

  it('signInWithPassword propaga el error del servidor', async () => {
    mocks.signInWithPassword.mockResolvedValue({ error: { message: 'invalid_credentials' } })
    const { result } = renderHook(() => useAuth(), { wrapper })

    await expect(result.current.signInWithPassword('a@b.com', 'x')).rejects.toThrow(
      'invalid_credentials',
    )
    expect(mocks.signInWithPassword).toHaveBeenCalledWith({ email: 'a@b.com', password: 'x' })
  })

  it('signOut invoca auth.signOut', async () => {
    mocks.signOut.mockResolvedValue({ error: null })
    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.signOut()
    })
    expect(mocks.signOut).toHaveBeenCalled()
  })

  it('si no está configurado: no se suscribe y los métodos rechazan', async () => {
    mocks.configured.value = false
    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.loading).toBe(false)
    expect(result.current.configured).toBe(false)
    expect(mocks.onAuthStateChange).not.toHaveBeenCalled()
    await expect(result.current.signInWithPassword('a@b.com', 'x')).rejects.toThrow(
      'Supabase no está configurado',
    )
  })

  it('useAuth fuera del provider lanza error', () => {
    expect(() => renderHook(() => useAuth())).toThrow('AuthProvider')
  })
})
