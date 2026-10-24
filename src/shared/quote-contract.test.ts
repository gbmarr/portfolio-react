import { describe, expect, it } from 'vitest'
import {
  QUOTE_CONSENT_VERSION,
  QUOTE_LIMITS,
  QUOTE_SECTIONS,
  TURNSTILE_ACTION_QUOTE,
  buildQuotePayload,
  normalizeQuoteExtras,
  normalizeQuoteSections,
  validateQuoteFields,
  validateQuotePayload,
  type QuoteFields,
} from './quote-contract'

const base: QuoteFields = {
  name: 'Ana Pérez',
  email: 'ana@example.com',
  tier: 'landing',
  sections: 0,
  extras: ['integraciones'],
  notes: 'Necesito una landing para mi estudio.',
  consentAccepted: true,
  consentVersion: QUOTE_CONSENT_VERSION,
}

describe('quote-contract', () => {
  it('fija límites, secciones, consentimiento y acción de Turnstile', () => {
    expect(QUOTE_LIMITS).toEqual({
      nameMax: 80,
      emailMax: 120,
      notesMax: 1000,
      maxExtras: 20,
    })
    expect(QUOTE_SECTIONS).toEqual({ min: 3, max: 8 })
    expect(QUOTE_CONSENT_VERSION).toBe('2026-10-24')
    expect(TURNSTILE_ACTION_QUOTE).toBe('quote')
  })

  it('acepta una solicitud válida de landing', () => {
    expect(validateQuoteFields(base)).toEqual({ ok: true })
  })

  it('acepta institucional con secciones dentro del rango', () => {
    expect(
      validateQuoteFields({ ...base, tier: 'institucional', sections: 5, extras: ['blog'] })
    ).toEqual({ ok: true })
  })

  it('acepta medida con ecommerce incluido', () => {
    expect(
      validateQuoteFields({ ...base, tier: 'medida', extras: ['ecommerce', 'seo'] })
    ).toEqual({ ok: true })
  })

  it('rechaza nombre vacío, largo o con caracteres de control', () => {
    expect(validateQuoteFields({ ...base, name: '' })).toEqual({ ok: false, reason: 'name' })
    expect(validateQuoteFields({ ...base, name: 'x'.repeat(81) })).toEqual({
      ok: false,
      reason: 'name',
    })
    expect(validateQuoteFields({ ...base, name: 'Ana\r\nBcc: x@y.com' })).toEqual({
      ok: false,
      reason: 'name',
    })
  })

  it('rechaza emails inválidos, largos o con control chars', () => {
    expect(validateQuoteFields({ ...base, email: 'no-es-email' })).toEqual({
      ok: false,
      reason: 'email',
    })
    expect(validateQuoteFields({ ...base, email: 'x'.repeat(121) })).toEqual({
      ok: false,
      reason: 'email',
    })
    expect(validateQuoteFields({ ...base, email: 'ana@example.com\nbcc:x@y.com' })).toEqual({
      ok: false,
      reason: 'email',
    })
  })

  it('rechaza un tier desconocido', () => {
    expect(validateQuoteFields({ ...base, tier: 'express' })).toEqual({
      ok: false,
      reason: 'tier',
    })
  })

  it('exige 3–8 secciones en institucional y 0 en el resto', () => {
    expect(
      validateQuoteFields({ ...base, tier: 'institucional', sections: 2 })
    ).toEqual({ ok: false, reason: 'sections' })
    expect(
      validateQuoteFields({ ...base, tier: 'institucional', sections: 9 })
    ).toEqual({ ok: false, reason: 'sections' })
    expect(validateQuoteFields({ ...base, sections: 4 })).toEqual({
      ok: false,
      reason: 'sections',
    })
  })

  it('rechaza extras desconocidos, no permitidos o duplicados', () => {
    expect(validateQuoteFields({ ...base, extras: ['no-existe'] })).toEqual({
      ok: false,
      reason: 'extras',
    })
    expect(validateQuoteFields({ ...base, extras: ['blog'] })).toEqual({
      ok: false,
      reason: 'extras',
    })
    expect(validateQuoteFields({ ...base, extras: ['logo', 'logo'] })).toEqual({
      ok: false,
      reason: 'extras',
    })
    expect(
      validateQuoteFields({ ...base, tier: 'medida', extras: ['ecommerce'] })
    ).toEqual({ ok: true })
  })

  it('permite notas multilínea pero rechaza controles raros o demasiado largas', () => {
    expect(validateQuoteFields({ ...base, notes: 'Línea 1\nLínea 2\tcon tab' })).toEqual({
      ok: true,
    })
    expect(validateQuoteFields({ ...base, notes: 'a\u0007b' })).toEqual({
      ok: false,
      reason: 'notes',
    })
    expect(validateQuoteFields({ ...base, notes: 'x'.repeat(1001) })).toEqual({
      ok: false,
      reason: 'notes',
    })
  })

  it('exige consentimiento aceptado y versión exacta', () => {
    expect(validateQuoteFields({ ...base, consentAccepted: false })).toEqual({
      ok: false,
      reason: 'consent',
    })
    expect(validateQuoteFields({ ...base, consentVersion: '2020-01-01' })).toEqual({
      ok: false,
      reason: 'consent',
    })
  })

  it('exige token en el payload completo', () => {
    const payload = buildQuotePayload(base, '')
    expect(validateQuotePayload(payload)).toEqual({ ok: false, reason: 'turnstile' })
    expect(validateQuotePayload(buildQuotePayload(base, 'token'))).toEqual({ ok: true })
  })
})

describe('normalizeQuoteSections', () => {
  it('fuerza 0 fuera de institucional', () => {
    expect(normalizeQuoteSections('landing', 8)).toBe(0)
    expect(normalizeQuoteSections('medida', 5)).toBe(0)
  })

  it('acota institucional al rango 3–8', () => {
    expect(normalizeQuoteSections('institucional', 1)).toBe(3)
    expect(normalizeQuoteSections('institucional', 12)).toBe(8)
    expect(normalizeQuoteSections('institucional', 6)).toBe(6)
  })
})

describe('normalizeQuoteExtras', () => {
  it('descarta desconocidos, no permitidos y duplicados', () => {
    expect(
      normalizeQuoteExtras('landing', ['blog', 'logo', 'logo', 'no-existe', 'integraciones'])
    ).toEqual(['logo', 'integraciones'])
  })

  it('agrega ecommerce incluido en medida', () => {
    expect(normalizeQuoteExtras('medida', ['seo'])).toEqual(['seo', 'ecommerce'])
  })
})

describe('buildQuotePayload', () => {
  it('recorta, normaliza y fija la versión de consentimiento', () => {
    expect(
      buildQuotePayload(
        {
          ...base,
          name: '  Ana Pérez  ',
          email: ' ana@example.com ',
          notes: '  Necesito una landing.  ',
          tier: 'institucional',
          sections: 10,
          extras: ['blog', 'blog'],
        },
        '  token  '
      )
    ).toEqual({
      kind: 'quote',
      name: 'Ana Pérez',
      email: 'ana@example.com',
      tier: 'institucional',
      sections: 8,
      extras: ['blog'],
      notes: 'Necesito una landing.',
      consentAccepted: true,
      consentVersion: QUOTE_CONSENT_VERSION,
      turnstileToken: 'token',
    })
  })
})
