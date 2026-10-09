import { describe, expect, it, vi } from 'vitest'
import {
  buildContactPayload,
  contactFunctionUrl,
  validateContactPayload,
} from './contactPayload'

const base = {
  name: 'Ana Pérez',
  email: 'ana@example.com',
  message: 'Necesito una landing page',
  turnstileToken: 'mock-token',
}

describe('validateContactPayload', () => {
  it('acepta un payload válido', () => {
    expect(validateContactPayload(base)).toEqual({ ok: true })
  })

  it('rechaza nombre vacío o demasiado largo', () => {
    expect(validateContactPayload({ ...base, name: '' })).toEqual({
      ok: false,
      reason: 'name',
    })
    expect(validateContactPayload({ ...base, name: 'x'.repeat(81) })).toEqual({
      ok: false,
      reason: 'name',
    })
  })

  it('rechaza email vacío o demasiado largo', () => {
    expect(validateContactPayload({ ...base, email: '' })).toEqual({
      ok: false,
      reason: 'email',
    })
    expect(validateContactPayload({ ...base, email: 'x'.repeat(121) })).toEqual({
      ok: false,
      reason: 'email',
    })
  })

  it('rechaza mensaje demasiado corto o demasiado largo', () => {
    expect(validateContactPayload({ ...base, message: 'Hola' })).toEqual({
      ok: false,
      reason: 'message',
    })
    expect(validateContactPayload({ ...base, message: 'x'.repeat(2001) })).toEqual({
      ok: false,
      reason: 'message',
    })
  })

  it('exige el token de Turnstile', () => {
    expect(validateContactPayload({ ...base, turnstileToken: '' })).toEqual({
      ok: false,
      reason: 'turnstile',
    })
  })

  it('recorta antes de validar', () => {
    expect(validateContactPayload({ ...base, name: '  Ana Pérez  ' })).toEqual({ ok: true })
  })
})

describe('buildContactPayload', () => {
  it('recorta los campos y devuelve el payload completo', () => {
    expect(
      buildContactPayload(
        { name: '  Ana Pérez  ', email: ' ana@example.com ', message: '  Necesito una landing  ' },
        '  mock-token  ',
      ),
    ).toEqual({
      name: 'Ana Pérez',
      email: 'ana@example.com',
      message: 'Necesito una landing',
      turnstileToken: 'mock-token',
    })
  })
})

describe('contactFunctionUrl', () => {
  it('deriva la URL de funciones desde DATABASE_URL', () => {
    vi.stubEnv('DATABASE_URL', 'https://jntueibgkfwptigpncmh.supabase.co')
    expect(contactFunctionUrl()).toBe(
      'https://jntueibgkfwptigpncmh.functions.supabase.co/contact-notify',
    )
    vi.unstubAllEnvs()
  })

  it('devuelve null sin DATABASE_URL', () => {
    vi.stubEnv('DATABASE_URL', '')
    expect(contactFunctionUrl()).toBeNull()
    vi.unstubAllEnvs()
  })
})