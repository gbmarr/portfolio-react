import { useState, type FormEvent } from 'react'
import { copy } from '../data/copy'
import { Button } from './Button'

export interface ContactFormData {
  name: string
  email: string
  message: string
}

interface ContactFormProps {
  /** Resolvedor de envío. Se conectará al servicio de email en la Fase 8. */
  onSubmit?: (data: ContactFormData) => Promise<void> | void
}

type Status = 'idle' | 'sending' | 'success' | 'error'

/** Formulario corto: nombre, email o WhatsApp, y mensaje. Nada más. */
export function ContactForm({ onSubmit }: ContactFormProps) {
  const [status, setStatus] = useState<Status>('idle')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data: ContactFormData = {
      name: String(new FormData(form).get('name') ?? ''),
      email: String(new FormData(form).get('email') ?? ''),
      message: String(new FormData(form).get('message') ?? ''),
    }

    setStatus('sending')
    try {
      await onSubmit?.(data)
      setStatus('success')
      form.reset()
    } catch {
      setStatus('error')
    }
  }

  const inputClasses =
    'w-full rounded-lg border border-border bg-background px-4 py-3 text-text placeholder:text-text-muted/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/50'

  return (
    <form onSubmit={handleSubmit} noValidate={false} className="space-y-5">
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