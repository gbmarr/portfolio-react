import { useRef, useState, type FormEvent } from 'react'
import { copy } from '../data/copy'
import { Button } from './Button'
import { submitContactForm } from '../utils/formSubmission'

export interface ContactFormData {
  name: string
  email: string
  message: string
}

interface ContactFormProps {
  /** Resolvedor de envío. Por defecto usa Web3Forms. */
  onSubmit?: (data: ContactFormData) => Promise<void> | void
}

type Status = 'idle' | 'sending' | 'success' | 'error'

/** Mínimo de tiempo entre envíos (anti-spam: los bots no esperan). */
export const MIN_SUBMIT_INTERVAL_MS = 3000

const MAX_NAME_LENGTH = 80
const MAX_EMAIL_LENGTH = 120
const MAX_MESSAGE_LENGTH = 2000
const MIN_MESSAGE_LENGTH = 10

/** Formulario corto: nombre, email o WhatsApp, y mensaje. Nada más. */
export function ContactForm({ onSubmit }: ContactFormProps) {
  const [status, setStatus] = useState<Status>('idle')
  const lastSubmitAt = useRef(0)

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

    // Límites y saneamiento básico: sin esto el payload puede ser basura.
    if (
      data.name.length === 0 ||
      data.name.length > MAX_NAME_LENGTH ||
      data.email.length === 0 ||
      data.email.length > MAX_EMAIL_LENGTH ||
      data.message.length < MIN_MESSAGE_LENGTH ||
      data.message.length > MAX_MESSAGE_LENGTH
    ) {
      setStatus('error')
      return
    }

    lastSubmitAt.current = now
    setStatus('sending')
    try {
      if (onSubmit) {
        await onSubmit(data)
      } else {
        await submitContactForm(data, String(formData.get('botcheck') ?? ''))
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
      {/* Honeypot anti-spam: Web3Forms descarta envíos donde este campo viene lleno. */}
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
          maxLength={MAX_NAME_LENGTH}
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
          maxLength={MAX_EMAIL_LENGTH}
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
          maxLength={MAX_MESSAGE_LENGTH}
          className={inputClasses}
        />
      </div>

      <Button type="submit" className="w-full" disabled={status === 'sending'}>
        {status === 'sending' ? copy.contact.form.sending : copy.contact.form.submit}
      </Button>

      {status === 'success' && (
        <p role="status" className="rounded-lg border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-accent">
          {copy.contact.form.success}
        </p>
      )}
      {status === 'error' && (
        <p role="alert" className="rounded-lg border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-300">
          {copy.contact.form.error}
        </p>
      )}
    </form>
  )
}