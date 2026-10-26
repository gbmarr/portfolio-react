import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'

const mocks = vi.hoisted(() => ({
  onAuthStateChange: vi.fn(),
  signInWithOtp: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  maybeSingle: vi.fn(),
  getAuthenticatorAssuranceLevel: vi.fn(),
  listFactors: vi.fn(),
  enroll: vi.fn(),
  challenge: vi.fn(),
  verify: vi.fn(),
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
      mfa: {
        getAuthenticatorAssuranceLevel: mocks.getAuthenticatorAssuranceLevel,
        listFactors: mocks.listFactors,
        enroll: mocks.enroll,
        challenge: mocks.challenge,
        verify: mocks.verify,
      },
    },
    from: () => ({
      select: () => ({
        eq: () => ({ maybeSingle: mocks.maybeSingle }),
      }),
    }),
  },
}))

import { AuthProvider } from './auth'
import { useAuth } from './auth-context'

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
  mocks.getAuthenticatorAssuranceLevel.mockResolvedValue({
    data: { currentLevel: 'aal1', nextLevel: 'aal1' },
    error: null,
  })
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

  it('envuelve signInWithOtp con redirect y sin crear usuario (SEC-005)', async () => {
    mocks.signInWithOtp.mockResolvedValue({ error: null })
    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.signInWithMagicLink('cliente@test.com')
    })

    expect(mocks.signInWithOtp).toHaveBeenCalledWith({
      email: 'cliente@test.com',
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        shouldCreateUser: false,
      },
    })
  })

  it('reenvía el token de CAPTCHA en el magic link', async () => {
    mocks.signInWithOtp.mockResolvedValue({ error: null })
    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.signInWithMagicLink('cliente@test.com', 'captcha-token')
    })

    expect(mocks.signInWithOtp).toHaveBeenCalledWith({
      email: 'cliente@test.com',
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        shouldCreateUser: false,
        captchaToken: 'captcha-token',
      },
    })
  })

  it('inviteByMagicLink envía con shouldCreateUser true (invitación del admin)', async () => {
    mocks.signInWithOtp.mockResolvedValue({ error: null })
    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.inviteByMagicLink('nuevo@test.com')
    })

    expect(mocks.signInWithOtp).toHaveBeenCalledWith({
      email: 'nuevo@test.com',
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        shouldCreateUser: true,
      },
    })
  })

  it('reenvía el token de CAPTCHA al invitar', async () => {
    mocks.signInWithOtp.mockResolvedValue({ error: null })
    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.inviteByMagicLink('nuevo@test.com', 'captcha-token')
    })

    expect(mocks.signInWithOtp).toHaveBeenCalledWith({
      email: 'nuevo@test.com',
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        shouldCreateUser: true,
        captchaToken: 'captcha-token',
      },
    })
  })

  it('lanza cuando signInWithOtp devuelve error', async () => {
    mocks.signInWithOtp.mockResolvedValue({ error: { message: 'rate limit' } })
    const { result } = renderHook(() => useAuth(), { wrapper })

    await expect(result.current.signInWithMagicLink('a@b.com')).rejects.toThrow('rate limit')
  })

  it('propaga el code user_not_found al llamar por un email sin cuenta', async () => {
    mocks.signInWithOtp.mockResolvedValue({
      error: { message: 'Email not found', code: 'user_not_found' },
    })
    const { result } = renderHook(() => useAuth(), { wrapper })

    const err = (await result.current
      .signInWithMagicLink('sin-cuenta@test.com')
      .catch((e: unknown) => e)) as {
      message: string
      code?: string
    }
    expect(err).toBeInstanceOf(Error)
    expect(err.message).toBe('Email not found')
    expect(err.code).toBe('user_not_found')
  })

  it('signInWithPassword propaga el error del servidor', async () => {
    mocks.signInWithPassword.mockResolvedValue({ error: { message: 'invalid_credentials' } })
    const { result } = renderHook(() => useAuth(), { wrapper })

    await expect(result.current.signInWithPassword('a@b.com', 'x')).rejects.toThrow(
      'invalid_credentials'
    )
    expect(mocks.signInWithPassword).toHaveBeenCalledWith({ email: 'a@b.com', password: 'x' })
  })

  it('reenvía el token de CAPTCHA al iniciar sesión con contraseña', async () => {
    mocks.signInWithPassword.mockResolvedValue({ error: null })
    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.signInWithPassword('a@b.com', 'x', 'captcha-token')
    })

    expect(mocks.signInWithPassword).toHaveBeenCalledWith({
      email: 'a@b.com',
      password: 'x',
      options: { captchaToken: 'captcha-token' },
    })
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
      'Supabase no está configurado'
    )
  })

  it('expone aalLevel aal1 cuando la sesión tiene AAL1', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    act(() => authCallback('INITIAL_SESSION', sessionFixture))
    await waitFor(() => expect(result.current.aalResolving).toBe(false))
    expect(result.current.aalLevel).toBe('aal1')
    expect(mocks.getAuthenticatorAssuranceLevel).toHaveBeenCalled()
  })

  it('expone aalLevel aal2 cuando getAuthenticatorAssuranceLevel devuelve aal2', async () => {
    mocks.getAuthenticatorAssuranceLevel.mockResolvedValue({
      data: { currentLevel: 'aal2', nextLevel: 'aal2' },
      error: null,
    })
    const { result } = renderHook(() => useAuth(), { wrapper })

    act(() => authCallback('INITIAL_SESSION', sessionFixture))
    await waitFor(() => expect(result.current.aalLevel).toBe('aal2'))
  })

  it('sin sesión expone aalLevel null y aalResolving false', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    act(() => authCallback('INITIAL_SESSION', null))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.aalLevel).toBeNull()
    expect(result.current.aalResolving).toBe(false)
  })

  it('listMfaFactors devuelve los ids de los factores TOTP', async () => {
    mocks.listFactors.mockResolvedValue({
      data: { totp: [{ id: 'f-1' }, { id: 'f-2' }], phone: [] },
      error: null,
    })
    const { result } = renderHook(() => useAuth(), { wrapper })

    await expect(result.current.listMfaFactors()).resolves.toEqual(['f-1', 'f-2'])
    expect(mocks.listFactors).toHaveBeenCalled()
  })

  it('enrollMfa devuelve factorId y qrCode', async () => {
    mocks.enroll.mockResolvedValue({
      data: { id: 'f-1', totp: { qr_code: 'data:image/svg+xml;utf8,<svg/>' } },
      error: null,
    })
    const { result } = renderHook(() => useAuth(), { wrapper })

    await expect(result.current.enrollMfa()).resolves.toEqual({
      factorId: 'f-1',
      qrCode: 'data:image/svg+xml;utf8,<svg/>',
    })
    expect(mocks.enroll).toHaveBeenCalledWith({ factorType: 'totp' })
  })

  it('challengeMfa devuelve el challenge id', async () => {
    mocks.challenge.mockResolvedValue({ data: { id: 'c-1' }, error: null })
    const { result } = renderHook(() => useAuth(), { wrapper })

    await expect(result.current.challengeMfa('f-1')).resolves.toBe('c-1')
    expect(mocks.challenge).toHaveBeenCalledWith({ factorId: 'f-1' })
  })

  it('verifyMfa verifica el código y propaga errores', async () => {
    mocks.verify.mockResolvedValue({ error: null })
    const { result } = renderHook(() => useAuth(), { wrapper })

    await expect(result.current.verifyMfa('f-1', 'c-1', '123456')).resolves.toBeUndefined()
    expect(mocks.verify).toHaveBeenCalledWith({
      factorId: 'f-1',
      challengeId: 'c-1',
      code: '123456',
    })

    mocks.verify.mockResolvedValue({ error: { message: 'invalid' } })
    await expect(result.current.verifyMfa('f-1', 'c-1', '000000')).rejects.toThrow('invalid')
  })

  it('useAuth fuera del provider lanza error', () => {
    expect(() => renderHook(() => useAuth())).toThrow('AuthProvider')
  })
})
