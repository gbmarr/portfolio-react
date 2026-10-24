import { describe, it, expect } from 'vitest'

import { CONTACT_LIMITS, TURNSTILE_ACTION } from '../../../src/shared/contact-contract'
import {
  QUOTE_CONSENT_VERSION,
  TURNSTILE_ACTION_QUOTE,
  type QuotePayload,
} from '../../../src/shared/quote-contract'
import {
  isDisposableEmail,
  isTurnstileResponseValid,
  validateContactInput,
  validateQuoteInput,
} from './validation'

describe('isDisposableEmail (SEC-007)', () => {
  it('detecta dominios desechables (case-insensitive y con espacios)', () => {
    expect(isDisposableEmail('usuario@mailinator.com')).toBe(true)
    expect(isDisposableEmail('usuario@10MINUTEMAIL.com')).toBe(true)
    expect(isDisposableEmail('usuario@yopmail.com ')).toBe(true)
  })

  it('no marca proveedores legítimos ni teléfonos/WhatsApp', () => {
    expect(isDisposableEmail('ana@gmail.com')).toBe(false)
    expect(isDisposableEmail('ana@empresa.com.ar')).toBe(false)
    expect(isDisposableEmail('+54 9 11 5555 5555')).toBe(false)
    expect(isDisposableEmail('')).toBe(false)
  })
})

describe('validateContactInput (SEC-005)', () => {
  const base = {
    name: 'Ana Pérez',
    email: 'ana@example.com',
    message: 'Necesito una landing page',
    turnstileToken: 'mock-token',
  }

  it('acepta un payload válido', () => {
    const result = validateContactInput(base)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.payload.email).toBe('ana@example.com')
  })

  it('rechaza inyección de headers por CRLF en el nombre', () => {
    expect(validateContactInput({ ...base, name: 'Ana\r\nBcc: attacker@example.com' })).toEqual({
      ok: false,
      reason: 'name',
    })
  })

  it('rechaza inyección de headers por CRLF en el email', () => {
    expect(validateContactInput({ ...base, email: 'ana@example.com\nbcc:x@y.com' })).toEqual({
      ok: false,
      reason: 'email',
    })
  })

  it('rechaza emails de dominios desechables (SEC-007), pero no un teléfono', () => {
    expect(validateContactInput({ ...base, email: 'spam@mailinator.com' })).toEqual({
      ok: false,
      reason: 'email',
    })
    expect(validateContactInput({ ...base, email: 'spam@10minutemail.com' })).toEqual({
      ok: false,
      reason: 'email',
    })
    // WhatsApp/teléfono no se ve afectado por la blocklist.
    expect(validateContactInput({ ...base, email: '+54 9 11 5555 5555' }).ok).toBe(true)
  })

  it('rechaza nombre/email vacíos o demasiado largos', () => {
    expect(validateContactInput({ ...base, name: '' })).toEqual({
      ok: false,
      reason: 'name',
    })
    expect(validateContactInput({ ...base, name: 'x'.repeat(CONTACT_LIMITS.nameMax + 1) })).toEqual(
      { ok: false, reason: 'name' }
    )
    expect(validateContactInput({ ...base, email: '' })).toEqual({
      ok: false,
      reason: 'email',
    })
    expect(
      validateContactInput({ ...base, email: 'x'.repeat(CONTACT_LIMITS.emailMax + 1) })
    ).toEqual({ ok: false, reason: 'email' })
  })

  it('permite saltos de línea en el mensaje (a diferencia de name/email)', () => {
    const result = validateContactInput({ ...base, message: 'Hola.\nNecesito una landing page.' })
    expect(result.ok).toBe(true)
  })

  it('exige el token de Turnstile', () => {
    expect(validateContactInput({ ...base, turnstileToken: '' })).toEqual({
      ok: false,
      reason: 'turnstile',
    })
  })
})

describe('validateQuoteInput', () => {
  const baseQuote: QuotePayload = {
    kind: 'quote',
    name: 'Ana Pérez',
    email: 'Ana@Example.com',
    tier: 'landing',
    sections: 0,
    extras: ['integraciones'],
    notes: 'Necesito una landing para mi estudio.',
    consentAccepted: true,
    consentVersion: QUOTE_CONSENT_VERSION,
    turnstileToken: 'mock-token',
  }

  it('acepta un payload válido y normaliza el email a minúsculas', () => {
    const result = validateQuoteInput(baseQuote)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.payload.email).toBe('ana@example.com')
      expect(result.payload.name).toBe('Ana Pérez')
      expect(result.payload.turnstileToken).toBe('mock-token')
    }
  })

  it('rechaza emails inválidos, con control chars o desechables', () => {
    expect(validateQuoteInput({ ...baseQuote, email: 'no-es-email' })).toEqual({
      ok: false,
      reason: 'email',
    })
    expect(validateQuoteInput({ ...baseQuote, email: 'ana@example.com\nbcc:x@y.com' })).toEqual({
      ok: false,
      reason: 'email',
    })
    expect(validateQuoteInput({ ...baseQuote, email: 'spam@mailinator.com' })).toEqual({
      ok: false,
      reason: 'email',
    })
  })

  it('rechaza tier, secciones y extras inválidos', () => {
    expect(validateQuoteInput({ ...baseQuote, tier: 'express' })).toEqual({
      ok: false,
      reason: 'tier',
    })
    expect(validateQuoteInput({ ...baseQuote, sections: 4 })).toEqual({
      ok: false,
      reason: 'sections',
    })
    expect(validateQuoteInput({ ...baseQuote, extras: ['blog'] })).toEqual({
      ok: false,
      reason: 'extras',
    })
    expect(
      validateQuoteInput({ ...baseQuote, extras: 'seo' as unknown as string[] })
    ).toEqual({ ok: false, reason: 'extras' })
  })

  it('exige consentimiento vigente y token de Turnstile', () => {
    expect(validateQuoteInput({ ...baseQuote, consentAccepted: false })).toEqual({
      ok: false,
      reason: 'consent',
    })
    expect(validateQuoteInput({ ...baseQuote, consentVersion: '2020-01-01' })).toEqual({
      ok: false,
      reason: 'consent',
    })
    expect(validateQuoteInput({ ...baseQuote, turnstileToken: '' })).toEqual({
      ok: false,
      reason: 'turnstile',
    })
  })

  it('normaliza el payload con la versión de consentimiento y el token recortado', () => {
    const result = validateQuoteInput({
      ...baseQuote,
      name: '  Ana Pérez  ',
      notes: '  Necesito una landing.  ',
      turnstileToken: '  token  ',
    })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.payload).toEqual({
        ...baseQuote,
        name: 'Ana Pérez',
        email: 'ana@example.com',
        notes: 'Necesito una landing.',
        consentVersion: QUOTE_CONSENT_VERSION,
        turnstileToken: 'token',
      })
    }
  })

  it('la acción de Turnstile para presupuesto es distinta de la de contacto', () => {
    expect(TURNSTILE_ACTION_QUOTE).toBe('quote')
    expect(TURNSTILE_ACTION_QUOTE).not.toBe(TURNSTILE_ACTION)
  })
})

// SEC-006: además de `success`, se valida la acción y el hostname del token.
describe('isTurnstileResponseValid (SEC-006)', () => {
  const expectations = {
    allowedHostnames: ['gabrielmarrero.com.ar', 'www.gabrielmarrero.com.ar', 'localhost'],
    expectedAction: TURNSTILE_ACTION,
  }

  it('acepta una respuesta válida de la acción y hostname esperados', () => {
    expect(
      isTurnstileResponseValid(
        { success: true, action: 'contact', hostname: 'gabrielmarrero.com.ar' },
        expectations
      )
    ).toBe(true)
  })

  it('acepta localhost (dev) y respuestas sin hostname', () => {
    expect(
      isTurnstileResponseValid(
        { success: true, action: 'contact', hostname: 'localhost' },
        expectations
      )
    ).toBe(true)
    expect(isTurnstileResponseValid({ success: true, action: 'contact' }, expectations)).toBe(true)
  })

  it('rechaza cuando success es false o falta', () => {
    expect(
      isTurnstileResponseValid(
        { success: false, action: 'contact', hostname: 'gabrielmarrero.com.ar' },
        expectations
      )
    ).toBe(false)
    expect(isTurnstileResponseValid({ action: 'contact' }, expectations)).toBe(false)
  })

  it('rechaza una acción distinta (token de otro widget)', () => {
    expect(
      isTurnstileResponseValid(
        { success: true, action: 'other', hostname: 'gabrielmarrero.com.ar' },
        expectations
      )
    ).toBe(false)
  })

  it('rechaza un hostname no permitido', () => {
    expect(
      isTurnstileResponseValid(
        { success: true, action: 'contact', hostname: 'attacker.example' },
        expectations
      )
    ).toBe(false)
  })
})
