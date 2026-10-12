import { useRef, useState, type FormEvent } from 'react'
import { copy } from '../data/copy'
import { CONTACT_LIMITS } from '../../supabase/functions/_shared/contact-contract'
import { Button } from './Button'
import {
  buildContactPayload,
  contactFunctionUrl,
  validateContactFields,
  validateContactPayload,
} from '../utils/contactPayload'
import { TurnstileWidget } from './Turnstile'

export interface ContactFormData {
  name: string
  email: string
  message: string
}

interface ContactFormProps {
  /** Resolvedor de envío. Por defecto envía a la Edge Function de contacto
   *  (Turnstile + email propio), que reemplazó a Web3Forms. */
  onSubmit?: (data: ContactFormData) => Promise<void> | void
}

type Status = 'idle' | 'sending' | 'success' | 'error'

/** Mínimo de tiempo entre envíos (anti-spam: los bots no esperan). */
export const MIN_SUBMIT_INTERVAL_MS = 3000

/** Formulario corto: nombre, email o WhatsApp, y mensaje. Nada más. */
export function ContactForm({ onSubmit }: ContactFormProps) {
  const [status, setStatus] = useState<Status>('idle')
  const lastSubmitAt = useRef(0)
  const [turnstileToken, setTurnstileToken] = useState('')
  const siteKey = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY ?? ''

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const data: ContactFormData = {
      name: String(formData.get('name') ?? '').trim(),
      email: String(formData.get('email') ?? '').trim(),
      message: String(formData.get('message') ?? '').trim(),
    }

    // Envíos demasiado seguidos (o en menos de 3 s desde el anterior) son bots.
    const now = Date.now()
    if (now - lastSubmitAt.current < MIN_SUBMIT_INTERVAL_MS) {
      setStatus('error')
      return
    }

    // Límites y saneamiento: la política vive en el módulo de contacto.
    if (!validateContactFields(data).ok) {
      setStatus('error')
      return
    }

    lastSubmitAt.current = now
    setStatus('sending')
    try {
      if (onSubmit) {
        await onSubmit(data)
      } else {
        // Honeypot: si un bot completó el campo invisible, respondemos éxito falso
        // sin llegar a la función (ni gastar el rate-limit).
        if (String(formData.get('botcheck') ?? '') !== '') {
          setStatus('success')
          form.reset()
          return
        }

        const url = contactFunctionUrl()
        if (!url) {
          throw new Error('Falta la URL de la función de contacto')
        }
        const payload = buildContactPayload(data, turnstileToken)
        const validation = validateContactPayload(payload)
        if (!validation.ok) {
          throw new Error(`Payload inválido: ${validation.reason}`)
        }
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!response.ok) {
          throw new Error(`La función respondió con estado ${response.status}`)
        }
      }
      setStatus('success')
      form.reset()
    } catch {
      setStatus('error')
    }
  }

  const inputClasses =
    'w-full rounded-lg border border-border bg-background px-4 py-3 text-text placeholder:text-text-muted/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/50'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Honeypot anti-spam: un bot que lo completa recibe éxito falso. */}
      <input
        type="text"
        name="botcheck"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />

      <div>
        <label htmlFor="contact-name" className="mb-1.5 block text-sm font-medium text-text">
          {copy.contact.form.name}
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          required
          autoComplete="name"
          maxLength={CONTACT_LIMITS.nameMax}
          className={inputClasses}
        />
      </div>

      <div>
        <label htmlFor="contact-email" className="mb-1.5 block text-sm font-medium text-text">
          {copy.contact.form.email}
        </label>
        <input
          id="contact-email"
          name="email"
          type="text"
          required
          autoComplete="email"
          inputMode="email"
          maxLength={CONTACT_LIMITS.emailMax}
          className={inputClasses}
        />
      </div>

      <div>
        <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium text-text">
          {copy.contact.form.message}
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={4}
          required
          maxLength={CONTACT_LIMITS.messageMax}
          className={inputClasses}
        />
      </div>

      {siteKey ? <TurnstileWidget siteKey={siteKey} onChange={setTurnstileToken} /> : null}

      <Button type="submit" className="w-full" disabled={status === 'sending'}>
        {status === 'sending' ? copy.contact.form.sending : copy.contact.form.submit}
      </Button>

      {status === 'success' && (
        <p
          role="status"
          className="rounded-lg border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-accent"
        >
          {copy.contact.form.success}
        </p>
      )}
      {status === 'error' && (
        <p
          role="alert"
          className="rounded-lg border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-300"
        >
          {copy.contact.form.error}
        </p>
      )}
    </form>
  )
}
