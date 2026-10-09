import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { Button } from '../components/Button'
import { Container } from '../components/Container'
import { FormField } from '../components/ui/FormField'
import { panelCopy } from '../data/panel'

type Status = 'idle' | 'submitting' | 'magic-sent'

/**
 * Login de clientes en /login: solo enlace mágico.
 * El admin entra por su path oculto (/acceso-admin) con contraseña.
 */
export function LoginPage() {
  const { session, profile, loading, configured, signInWithMagicLink } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)

  const from = (location.state as { from?: string } | null)?.from

  useEffect(() => {
    if (loading || !session) return
    const destination = from ?? (profile?.role === 'admin' ? '/admin' : '/panel')
    navigate(destination, { replace: true })
  }, [loading, session, profile, from, navigate])

  if (loading) {
    return (
      <div
        role="status"
        className="flex min-h-screen items-center justify-center bg-background text-text-muted"
      >
        <span className="animate-pulse">{panelCopy.loading}</span>
      </div>
    )
  }

  if (!configured) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <Container className="max-w-md text-center">
          <p role="alert" className="mb-6 text-text-muted">
            {panelCopy.login.notConfigured}
          </p>
          <Link to="/" className="text-accent hover:underline">
            {panelCopy.login.backToSite}
          </Link>
        </Container>
      </main>
    )
  }

  async function handleMagicLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) {
      setError(panelCopy.login.emailRequired)
      return
    }
    setStatus('submitting')
    setError(null)
    try {
      await signInWithMagicLink(trimmed)
      setStatus('magic-sent')
    } catch {
      setError(panelCopy.error.generic)
      setStatus('idle')
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Container className="max-w-md">
        <div className="rounded-2xl border border-border bg-background/60 p-8">
          <h1 className="mb-1 font-display text-2xl font-semibold text-text">
            {panelCopy.login.title}
          </h1>
          <p className="mb-6 text-sm text-text-muted">{panelCopy.login.subtitle}</p>

          <form onSubmit={handleMagicLink} className="space-y-4" noValidate>
            <FormField
              id="login-email"
              label={panelCopy.login.email}
              type="email"
              required
              autoComplete="email"
              maxLength={120}
              value={email}
              onValueChange={setEmail}
            />
            <Button type="submit" className="w-full" disabled={status === 'submitting'}>
              {status === 'submitting' ? panelCopy.login.sending : panelCopy.login.magicLink}
            </Button>
          </form>

          {status === 'magic-sent' && (
            <p
              role="status"
              className="mt-4 rounded-lg border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-accent"
            >
              {panelCopy.login.magicSent}
            </p>
          )}
          {error && (
            <p
              role="alert"
              className="mt-4 rounded-lg border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-300"
            >
              {error}
            </p>
          )}
        </div>

        <p className="mt-6 text-center">
          <Link to="/" className="text-sm text-text-muted hover:text-accent">
            ← {panelCopy.login.backToSite}
          </Link>
        </p>
      </Container>
    </main>
  )
}