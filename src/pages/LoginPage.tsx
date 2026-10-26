import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth-context'
import { Button } from '../components/Button'
import { Container } from '../components/Container'
import { TurnstileWidget } from '../components/Turnstile'
import { FormField } from '../components/ui/FormField'
import { panelCopy } from '../data/panel'
import { useEmailCooldown } from '../hooks/useEmailCooldown'
import { TURNSTILE_ACTION_LOGIN } from '../shared/auth-contract'
import { isValidEmail, normalizeEmail } from '../utils/email'

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
  const [captchaToken, setCaptchaToken] = useState('')
  const [captchaKey, setCaptchaKey] = useState(0)
  const { remaining, start, coolingDown } = useEmailCooldown(email)

  const siteKey = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY ?? ''

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

  function resetCaptcha() {
    setCaptchaToken('')
    setCaptchaKey((key) => key + 1)
  }

  async function handleMagicLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalized = normalizeEmail(email)
    if (!normalized) {
      setError(panelCopy.login.emailRequired)
      return
    }
    if (!isValidEmail(normalized)) {
      setError(panelCopy.login.emailInvalid)
      return
    }
    if (coolingDown) {
      setError(panelCopy.login.rateLimited)
      return
    }
    if (siteKey && !captchaToken) {
      setError(panelCopy.login.captchaRequired)
      return
    }

    setStatus('submitting')
    setError(null)
    try {
      await signInWithMagicLink(normalized, captchaToken || undefined)
      setEmail(normalized)
      setStatus('magic-sent')
      start(normalized)
      resetCaptcha()
    } catch (err) {
      const authError = err as { code?: string; status?: number; message?: string } | null
      // SEC-005: no revelar si el email tiene cuenta. Un email no autorizado
      // (user_not_found) responde igual que un envío exitoso: misma confirmación.
      if (authError?.code === 'user_not_found') {
        setStatus('magic-sent')
        start(normalized)
        resetCaptcha()
        return
      }
      if (
        authError?.status === 429 ||
        /rate.?limit/i.test(authError?.code ?? '') ||
        /rate.?limit/i.test(authError?.message ?? '')
      ) {
        setError(panelCopy.login.rateLimited)
        start(normalized)
      } else if (
        /captcha/i.test(authError?.code ?? '') ||
        /captcha/i.test(authError?.message ?? '')
      ) {
        setError(panelCopy.login.captchaError)
      } else {
        setError(panelCopy.error.generic)
      }
      resetCaptcha()
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
            {siteKey && (
              <TurnstileWidget
                key={captchaKey}
                siteKey={siteKey}
                action={TURNSTILE_ACTION_LOGIN}
                onChange={setCaptchaToken}
              />
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={status === 'submitting' || coolingDown || Boolean(siteKey && !captchaToken)}
            >
              {status === 'submitting' ? panelCopy.login.sending : panelCopy.login.magicLink}
            </Button>
          </form>

          {coolingDown && (
            <p className="mt-4 text-sm text-text-muted" aria-live="polite">
              {panelCopy.login.cooldown(remaining)}
            </p>
          )}
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
