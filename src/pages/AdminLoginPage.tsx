import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth-context'
import { Button } from '../components/Button'
import { Container } from '../components/Container'
import { TurnstileWidget } from '../components/Turnstile'
import { FormField } from '../components/ui/FormField'
import { panelCopy } from '../data/panel'
import { TURNSTILE_ACTION_ADMIN_LOGIN } from '../shared/auth-contract'
import { isValidEmail, normalizeEmail } from '../utils/email'

type Status = 'idle' | 'submitting'

/**
 * Acceso de administración en /acceso-admin (path no publicado).
 * Solo admins: email + contraseña.
 */
export function AdminLoginPage() {
  const { session, profile, loading, configured, signInWithPassword } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const [captchaToken, setCaptchaToken] = useState('')
  const [captchaKey, setCaptchaKey] = useState(0)

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
            {panelCopy.adminLogin.notConfigured}
          </p>
          <Link to="/" className="text-accent hover:underline">
            {panelCopy.adminLogin.backToSite}
          </Link>
        </Container>
      </main>
    )
  }

  function resetCaptcha() {
    setCaptchaToken('')
    setCaptchaKey((key) => key + 1)
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalized = normalizeEmail(email)
    if (!isValidEmail(normalized)) {
      setError(panelCopy.adminLogin.emailInvalid)
      return
    }
    if (!password) {
      setError(panelCopy.adminLogin.passwordRequired)
      return
    }
    if (siteKey && !captchaToken) {
      setError(panelCopy.adminLogin.captchaRequired)
      return
    }

    setStatus('submitting')
    setError(null)
    try {
      await signInWithPassword(normalized, password, captchaToken || undefined)
    } catch (err) {
      const authError = err as { code?: string; message?: string } | null
      if (/captcha/i.test(authError?.code ?? '') || /captcha/i.test(authError?.message ?? '')) {
        setError(panelCopy.adminLogin.captchaError)
      } else {
        setError(panelCopy.adminLogin.invalidCredentials)
      }
      resetCaptcha()
      setStatus('idle')
    }
  }

  const sending = status === 'submitting'

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
            {siteKey && (
              <TurnstileWidget
                key={captchaKey}
                siteKey={siteKey}
                action={TURNSTILE_ACTION_ADMIN_LOGIN}
                onChange={setCaptchaToken}
              />
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={sending || Boolean(siteKey && !captchaToken)}
            >
              {sending ? panelCopy.adminLogin.sending : panelCopy.adminLogin.submit}
            </Button>
          </form>

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
