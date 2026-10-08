import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { Button } from '../components/Button'
import { Container } from '../components/Container'
import { FormField } from '../components/ui/FormField'
import { panelCopy } from '../data/panel'

type Status = 'idle' | 'submitting'

/**
 * Acceso de administración en /acceso-admin (path no publicado).
 * Solo admins: email + contraseña o passkey (Face ID / Touch ID / Windows Hello).
 */
export function AdminLoginPage() {
  const { session, profile, loading, configured, signInWithPassword, signInWithPasskey } =
    useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
            {panelCopy.adminLogin.notConfigured}
          </p>
          <Link to="/" className="text-accent hover:underline">
            {panelCopy.adminLogin.backToSite}
          </Link>
        </Container>
      </main>
    )
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('submitting')
    setError(null)
    try {
      await signInWithPassword(email.trim(), password)
    } catch {
      setError(panelCopy.adminLogin.invalidCredentials)
      setStatus('idle')
    }
  }

  async function handlePasskey() {
    setStatus('submitting')
    setError(null)
    try {
      await signInWithPasskey()
    } catch {
      setError(panelCopy.adminLogin.passkeyError)
      setStatus('idle')
    }
  }

  const sending = status === 'submitting'
  const passkeySupported =
    typeof window !== 'undefined' && 'PublicKeyCredential' in window

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Container className="max-w-md">
        <div className="rounded-2xl border border-border bg-background/60 p-8">
          <h1 className="mb-1 font-display text-2xl font-semibold text-text">
            {panelCopy.adminLogin.title}
          </h1>
          <p className="mb-6 text-sm text-text-muted">{panelCopy.adminLogin.subtitle}</p>

          <form onSubmit={handlePasswordSubmit} className="space-y-4" noValidate>
            <FormField
              id="admin-email"
              label={panelCopy.adminLogin.email}
              type="email"
              required
              autoComplete="username"
              maxLength={120}
              value={email}
              onValueChange={setEmail}
            />
            <FormField
              id="admin-password"
              label={panelCopy.adminLogin.password}
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onValueChange={setPassword}
            />
            <Button type="submit" className="w-full" disabled={sending}>
              {sending ? panelCopy.adminLogin.sending : panelCopy.adminLogin.submit}
            </Button>
          </form>

          {passkeySupported && (
            <button
              type="button"
              onClick={() => void handlePasskey()}
              disabled={sending}
              className="mt-4 w-full rounded-full border border-border bg-background px-4 py-2.5 text-center text-sm font-medium text-text transition-colors hover:border-accent hover:text-accent disabled:opacity-60"
            >
              {panelCopy.adminLogin.passkey}
            </button>
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
            ← {panelCopy.adminLogin.backToSite}
          </Link>
        </p>
      </Container>
    </main>
  )
}