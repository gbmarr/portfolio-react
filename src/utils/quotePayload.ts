import {
  QUOTE_CONSENT_VERSION,
  buildQuotePayload,
  validateQuoteFields,
  validateQuotePayload as validateSharedQuotePayload,
  type QuotePayload,
  type QuoteTierId,
  type QuoteValidation,
} from '../shared/quote-contract'
import { contactFunctionUrl } from './contactPayload'

export { contactFunctionUrl }

/** Datos que captura el formulario público de presupuesto. */
export interface QuoteFormData {
  name: string
  email: string
  tier: QuoteTierId
  sections: number
  extras: string[]
  notes: string
  consentAccepted: boolean
}

/** Valida los campos del formulario con la versión de consentimiento vigente. */
export function validateQuoteForm(data: QuoteFormData): QuoteValidation {
  return validateQuoteFields({
    ...data,
    consentVersion: QUOTE_CONSENT_VERSION,
  })
}

/** Construye el payload que recibe la Edge Function. */
export function buildQuoteFormPayload(data: QuoteFormData, turnstileToken: string): QuotePayload {
  return buildQuotePayload(
    {
      ...data,
      consentVersion: QUOTE_CONSENT_VERSION,
    },
    turnstileToken
  )
}

/** Valida el payload completo (incluye token de Turnstile). */
export function validateQuotePayload(payload: QuotePayload): QuoteValidation {
  return validateSharedQuotePayload(payload)
}
