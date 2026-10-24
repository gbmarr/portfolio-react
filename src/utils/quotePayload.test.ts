import { describe, expect, it } from 'vitest'
import { QUOTE_CONSENT_VERSION, type QuoteTierId } from '../shared/quote-contract'
import {
  buildQuoteFormPayload,
  validateQuoteForm,
  validateQuotePayload,
  type QuoteFormData,
} from './quotePayload'

const base: QuoteFormData = {
  name: 'Ana Pérez',
  email: 'ana@example.com',
  tier: 'landing',
  sections: 0,
  extras: ['integraciones'],
  notes: 'Necesito una landing para mi estudio.',
  consentAccepted: true,
}

describe('validateQuoteForm', () => {
  it('acepta un formulario válido', () => {
    expect(validateQuoteForm(base)).toEqual({ ok: true })
  })

  it('bloquea si no se aceptó el consentimiento', () => {
    expect(validateQuoteForm({ ...base, consentAccepted: false })).toEqual({
      ok: false,
      reason: 'consent',
    })
  })

  it('rechaza un email de WhatsApp en vez de email', () => {
    expect(validateQuoteForm({ ...base, email: '+54 9 11 5555-5555' })).toEqual({
      ok: false,
      reason: 'email',
    })
  })

  it('rechaza combinaciones de tier/extra inválidas', () => {
    expect(validateQuoteForm({ ...base, extras: ['blog'] })).toEqual({
      ok: false,
      reason: 'extras',
    })
  })
})

describe('buildQuoteFormPayload', () => {
  it('envía kind quote, consentimiento versionado y extras normalizados', () => {
    expect(
      buildQuoteFormPayload(
        {
          ...base,
          tier: 'institucional' as QuoteTierId,
          sections: 12,
          extras: ['blog', 'blog'],
          notes: '  texto  ',
        },
        ' tok '
      )
    ).toEqual({
      kind: 'quote',
      name: 'Ana Pérez',
      email: 'ana@example.com',
      tier: 'institucional',
      sections: 8,
      extras: ['blog'],
      notes: 'texto',
      consentAccepted: true,
      consentVersion: QUOTE_CONSENT_VERSION,
      turnstileToken: 'tok',
    })
  })

  it('agrega ecommerce a medida', () => {
    const payload = buildQuoteFormPayload(
      { ...base, tier: 'medida', extras: ['seo'] },
      'tok'
    )
    expect(payload.extras).toEqual(['seo', 'ecommerce'])
  })
})

describe('validateQuotePayload', () => {
  it('exige token de Turnstile', () => {
    const payload = buildQuoteFormPayload(base, '')
    expect(validateQuotePayload(payload)).toEqual({ ok: false, reason: 'turnstile' })
  })
})
