import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'

const mocks = vi.hoisted(() => ({
  onAuthStateChange: vi.fn(),
  signInWithOtp: vi.fn(),
  signInWithPassword: vi.fn(),
  signInWithPasskey: vi.fn(),
  registerPasskey: vi.fn(),
  passkeyList: vi.fn(),
  passkeyDelete: vi.fn(),
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
      signInWithPasskey: mocks.signInWithPasskey,
      registerPasskey: mocks.registerPasskey,
      passkey: {
        list: mocks.passkeyList,
        delete: mocks.passkeyDelete,
      },
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
  mocks.passkeyList.mockResolvedValue({ data: [], error: null })
  mocks.signInWithPasskey.mockResolvedValue({ error: null })
  mocks.registerPasskey.mockResolvedValue({ error: null })
  mocks.passkeyDelete.mockResolvedValue({ error: null })
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

  it('carga las passkeys de la sesión actual', async () => {
    mocks.passkeyList.mockResolvedValue({
      data: [{ id: 'pk-1', friendly_name: 'Notebook', created_at: '2026-09-05' }],
      error: null,
    })
    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.passkeys).toBeNull()

    act(() => authCallback('INITIAL_SESSION', sessionFixture))

    await waitFor(() => expect(result.current.passkeys).toEqual([
      { id: 'pk-1', friendly_name: 'Notebook', created_at: '2026-09-05' },
    ]))
    expect(mocks.passkeyList).toHaveBeenCalled()
  })

  it('signInWithPasskey invoca auth y propaga el error', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.signInWithPasskey()
    })
    expect(mocks.signInWithPasskey).toHaveBeenCalled()

    mocks.signInWithPasskey.mockResolvedValue({ error: { message: 'user_cancelled' } })
    await expect(result.current.signInWithPasskey()).rejects.toThrow('user_cancelled')
  })

  it('registerPasskey registra y recarga la lista', async () => {
    mocks.passkeyList.mockResolvedValueOnce({ data: [], error: null })
    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.registerPasskey()
    })
    expect(mocks.registerPasskey).toHaveBeenCalled()
    expect(mocks.passkeyList).toHaveBeenCalled()
  })

  it('registerPasskey propaga el error del servidor', async () => {
    mocks.registerPasskey.mockResolvedValue({ error: { message: 'passkey_disabled' } })
    const { result } = renderHook(() => useAuth(), { wrapper })

    await expect(result.current.registerPasskey()).rejects.toThrow('passkey_disabled')
  })

  it('deletePasskey llama con passkeyId y descarta la passkey local', async () => {
    mocks.passkeyList.mockResolvedValue({
      data: [
        { id: 'pk-1', friendly_name: 'Notebook', created_at: '2026-09-05' },
        { id: 'pk-2', friendly_name: 'Celular', created_at: '2026-09-06' },
      ],
      error: null,
    })
    const { result } = renderHook(() => useAuth(), { wrapper })
    act(() => authCallback('INITIAL_SESSION', sessionFixture))
    await waitFor(() => expect(result.current.passkeys).toHaveLength(2))

    await act(async () => {
      await result.current.deletePasskey('pk-1')
    })

    expect(mocks.passkeyDelete).toHaveBeenCalledWith({ passkeyId: 'pk-1' })
    expect(result.current.passkeys?.map((p) => p.id)).toEqual(['pk-2'])
  })

  it('deletePasskey propaga el error del servidor', async () => {
    mocks.passkeyDelete.mockResolvedValue({ error: { message: 'not_found' } })
    const { result } = renderHook(() => useAuth(), { wrapper })

    await expect(result.current.deletePasskey('pk-x')).rejects.toThrow('not_found')
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
    await expect(result.current.signInWithPasskey()).rejects.toThrow('Supabase no está configurado')
    await expect(result.current.registerPasskey()).rejects.toThrow('Supabase no está configurado')
    await expect(result.current.deletePasskey('pk-1')).rejects.toThrow(
      'Supabase no está configurado',
    )
  })

  it('useAuth fuera del provider lanza error', () => {
    expect(() => renderHook(() => useAuth())).toThrow('AuthProvider')
  })
})
