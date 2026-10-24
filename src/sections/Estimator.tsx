import { useMemo, useRef, useState, type FormEvent } from 'react'
import { Button } from '../components/Button'
import { Container } from '../components/Container'
import { LegalConsent } from '../components/LegalConsent'
import { Section } from '../components/Section'
import { SectionHeading } from '../components/SectionHeading'
import { TurnstileWidget } from '../components/Turnstile'
import { FormField } from '../components/ui/FormField'
import { TextAreaField } from '../components/ui/TextAreaField'
import { copy } from '../data/copy'
import {
  estimateTiers,
  getVisibleExtras,
  isExtraAllowed,
  type EstimateTierId,
} from '../data/estimate'
import { buildEstimateTimeline, MAX_SECTIONS, MIN_SECTIONS } from '../lib/estimate'
import {
  QUOTE_LIMITS,
  TURNSTILE_ACTION_QUOTE,
  type QuoteTierId,
} from '../shared/quote-contract'
import {
  buildQuoteFormPayload,
  contactFunctionUrl,
  validateQuoteForm,
  validateQuotePayload,
  type QuoteFormData,
} from '../utils/quotePayload'

const MIN_SUBMIT_INTERVAL_MS = 3000

type SubmitStatus = 'idle' | 'sending' | 'success' | 'error'

/**
 * Solicitud de presupuesto: el visitante arma un brief (tier, secciones,
 * extras) y deja su email. No se muestran precios: el presupuesto se envía
 * después de revisar la solicitud. El backend solo guarda el brief y avisa
 * al owner; no envía emails automáticos al solicitante.
 */
export function Estimator() {
  const [tier, setTier] = useState<EstimateTierId>('landing')
  const [sections, setSections] = useState(0)
  const [selectedExtras, setSelectedExtras] = useState<string[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [consentAccepted, setConsentAccepted] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [status, setStatus] = useState<SubmitStatus>('idle')
  const lastSubmitAt = useRef(0)

  const visibleExtras = useMemo(() => getVisibleExtras(tier), [tier])
  const timeline = useMemo(
    () => buildEstimateTimeline({ tier, sections, extras: selectedExtras }),
    [tier, sections, selectedExtras]
  )
  const selectedExtraLabels = useMemo(() => {
    const labels = visibleExtras
      .filter((extra) => extra.includedFor?.includes(tier) || selectedExtras.includes(extra.id))
      .map((extra) => extra.label)

    return labels.length > 0 ? labels.join(', ') : copy.estimator.noExtras
  }, [tier, visibleExtras, selectedExtras])

  function toggleExtra(id: string) {
    setSelectedExtras((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    )
  }

  /** Al cambiar de tier, descarta los extras que dejan de aplicar. */
  function handleTierChange(nextTier: EstimateTierId) {
    setTier(nextTier)
    setSections(nextTier === 'institucional' ? 5 : 0)
    setSelectedExtras((current) => current.filter((id) => isExtraAllowed(nextTier, id)))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(form)

    // Honeypot: un humano no lo ve ni lo completa. Respondemos éxito falso
    // para no darle señal al bot.
    if (String(formData.get('botcheck') ?? '') !== '') {
      setStatus('success')
      return
    }

    const now = Date.now()
    if (now - lastSubmitAt.current < MIN_SUBMIT_INTERVAL_MS) {
      setStatus('error')
      return
    }

    const data: QuoteFormData = {
      name,
      email,
      tier: tier as QuoteTierId,
      sections,
      extras: selectedExtras,
      notes,
      consentAccepted,
    }

    const formValidation = validateQuoteForm(data)
    if (!formValidation.ok) {
      setStatus('error')
      return
    }

    const url = contactFunctionUrl()
    if (!url) {
      setStatus('error')
      return
    }

    lastSubmitAt.current = now
    setStatus('sending')

    try {
      const payload = buildQuoteFormPayload(data, turnstileToken)
      const payloadValidation = validateQuotePayload(payload)
      if (!payloadValidation.ok) {
        throw new Error(`invalid quote payload: ${payloadValidation.reason}`)
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`quote request failed: ${response.status}`)
      }

      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <Section id="estimador">
      <Container className="max-w-3xl">
        <SectionHeading
          eyebrow={copy.estimator.eyebrow}
          title={copy.estimator.title}
          subtitle={copy.estimator.subtitle}
        />
        <p className="mb-6 text-center text-sm font-medium text-accent">{copy.estimator.slots}</p>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-6 rounded-xl border border-border bg-background/60 p-6 sm:p-8"
        >
          <input
            type="text"
            name="botcheck"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="hidden"
          />

          <fieldset>
            <legend className="mb-3 text-sm font-semibold uppercase tracking-wide text-text">
              {copy.estimator.tierLegend}
            </legend>
            <div className="space-y-2">
              {estimateTiers.map((item) => (
                <label key={item.id} className="flex items-center gap-3 text-sm text-text-muted">
                  <input
                    type="radio"
                    name="estimate-tier"
                    value={item.id}
                    checked={tier === item.id}
                    onChange={() => handleTierChange(item.id)}
                    className="h-4 w-4 accent-accent"
                  />
                  {item.name}
                </label>
              ))}
            </div>
          </fieldset>

          {tier === 'institucional' && (
            <div>
              <label
                htmlFor="estimate-sections"
                className="mb-2 block text-sm font-semibold uppercase tracking-wide text-text"
              >
                {copy.estimator.sectionsLabel} ({sections})
              </label>
              <input
                id="estimate-sections"
                type="range"
                min={MIN_SECTIONS}
                max={MAX_SECTIONS}
                value={sections}
                aria-valuetext={`${sections} secciones`}
                onChange={(event) => setSections(Number(event.target.value))}
                className="w-full accent-accent"
              />
            </div>
          )}

          <fieldset>
            <legend className="mb-3 text-sm font-semibold uppercase tracking-wide text-text">
              {copy.estimator.extrasLegend}
            </legend>
            <div className="space-y-2">
              {visibleExtras.map((extra) => {
                const isIncluded = extra.includedFor?.includes(tier) ?? false
                return (
                  <label key={extra.id} className="flex items-center gap-3 text-sm text-text-muted">
                    <input
                      type="checkbox"
                      checked={isIncluded || selectedExtras.includes(extra.id)}
                      disabled={isIncluded}
                      onChange={() => toggleExtra(extra.id)}
                      className="h-4 w-4 accent-accent"
                    />
                    <span>
                      {extra.label}
                      {isIncluded && (
                        <span className="ml-1 text-accent">— {copy.estimator.includedNote}</span>
                      )}
                    </span>
                  </label>
                )
              })}
            </div>
          </fieldset>

          <div
            data-testid="quote-summary"
            className="space-y-2 rounded-xl border border-accent/30 bg-surface p-5"
          >
            <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">
              {copy.estimator.summaryLabel}
            </p>
            <p className="text-sm text-text">
              {copy.estimator.timelineLabel}:{' '}
              <span aria-live="polite" aria-atomic="true">
                {timeline}
              </span>
            </p>
            <p className="text-sm text-text-muted">
              {copy.estimator.extrasLegend}: {selectedExtraLabels}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              id="quote-name"
              label={copy.estimator.form.name}
              value={name}
              onValueChange={setName}
              name="name"
              autoComplete="name"
              maxLength={QUOTE_LIMITS.nameMax}
              required
            />
            <FormField
              id="quote-email"
              label={copy.estimator.form.email}
              value={email}
              onValueChange={setEmail}
              name="email"
              type="email"
              autoComplete="email"
              maxLength={QUOTE_LIMITS.emailMax}
              required
            />
          </div>

          <TextAreaField
            id="quote-notes"
            label={copy.estimator.form.notes}
            value={notes}
            onValueChange={setNotes}
            name="notes"
            rows={4}
            maxLength={QUOTE_LIMITS.notesMax}
          />

          <LegalConsent
            id="quote-consent"
            checked={consentAccepted}
            onChange={setConsentAccepted}
          />

          <TurnstileWidget
            siteKey={import.meta.env.PUBLIC_TURNSTILE_SITE_KEY ?? ''}
            action={TURNSTILE_ACTION_QUOTE}
            onChange={setTurnstileToken}
          />

          <Button type="submit" disabled={status === 'sending'} className="w-full sm:w-auto">
            {status === 'sending' ? copy.estimator.form.sending : copy.estimator.form.submit}
          </Button>

          {status === 'success' && (
            <p role="status" className="text-sm text-accent">
              {copy.estimator.form.success}
            </p>
          )}
          {status === 'error' && (
            <p role="alert" className="text-sm text-red-400">
              {copy.estimator.form.error}
            </p>
          )}

          <p className="text-sm text-text-muted">{copy.estimator.disclaimer}</p>
        </form>
      </Container>
    </Section>
  )
}
