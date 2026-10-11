import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/auth-context'
import { Button } from '../components/Button'
import { Container } from '../components/Container'
import { FormField } from '../components/ui/FormField'
import { panelCopy } from '../data/panel'

type Step = 'checking' | 'enroll' | 'verify'
type Status = 'idle' | 'submitting'

/**
 * Step-up MFA del panel admin (`/admin/mfa`).
 *
 * Un admin con sesión AAL1 (solo contraseña) aterriza acá. Si todavía no
 * tiene un factor TOTP enrolado ve el QR para escanearlo; si ya tiene factor,
 * ve el desafío de 6 dígitos. Al verificar, la sesión sube a AAL2 y
 * `RequireAdminMfa` redirige automáticamente al panel (no se navega acá).
 */
export function AdminMfaPage() {
  const { listMfaFactors, enrollMfa, challengeMfa, verifyMfa } = useAuth()

  const [step, setStep] = useState<Step>('checking')
  const [factorId, setFactorId] = useState<string | null>(null)
  const [qrCode, setQrCode] = useState('')
  const [challengeId, setChallengeId] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      try {
        const factors = await listMfaFactors()
        if (cancelled) return

        if (factors.length === 0) {
          // Sin factor: se abre el enrolamiento y se muestra el QR.
          const enrolled = await enrollMfa()
          if (cancelled) return
          setFactorId(enrolled.factorId)
          setQrCode(enrolled.qrCode)
          setStep('enroll')
          return
        }

        // Con factor: se abre el desafío y se pide el código.
        const nextFactorId = factors[0]
        const nextChallengeId = await challengeMfa(nextFactorId)
        if (cancelled) return
        setFactorId(nextFactorId)
        setChallengeId(nextChallengeId)
        setStep('verify')
      } catch {
        if (!cancelled) setError(panelCopy.adminMfa.error)
      }
    }

    void bootstrap()
    return () => {
      cancelled = true
    }
  }, [listMfaFactors, enrollMfa, challengeMfa])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!factorId) return
    setStatus('submitting')
    setError(null)
    try {
      // En el enrolamiento (sin factor previo) todavía no existe challenge:
      // se abre uno al enviar, tras escanear el QR. Sin esto, "Activar" era
      // un no-op (challengeId null) y la verificación nunca se completaba
      // quedando el TOTP sin verificar y el server respondiendo 400.
      const activeChallengeId = challengeId ?? (await challengeMfa(factorId))
      await verifyMfa(factorId, activeChallengeId, code.trim())
      // La sesión pasa a AAL2: RequireAdminMfa redirige al panel.
    } catch (err) {
      // Se mantiene la copia amigable, pero se registra el error real de
      // GoTrue para diagnosticar un 400 (TOTP incorrecto, desafío vencido…).
      console.error('[mfa] verify falló:', err)
      setError(panelCopy.adminMfa.invalidCode)
      setStatus('idle')
    }
  }

  const sending = status === 'submitting'

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Container className="max-w-md">
        <div className="rounded-2xl border border-border bg-background/60 p-8">
          <h1 className="mb-1 font-display text-2xl font-semibold text-text">
            {panelCopy.adminMfa.title}
          </h1>
          <p className="mb-6 text-sm text-text-muted">{panelCopy.adminMfa.subtitle}</p>

          {step === 'checking' && (
            <p role="status" className="animate-pulse text-sm text-text-muted">
              {panelCopy.adminMfa.checking}
            </p>
          )}

          {step === 'enroll' && (
            <>
              <img
                src={qrCode}
                alt={panelCopy.adminMfa.qrAlt}
                className="mx-auto mb-4 h-48 w-48 rounded-lg border border-border bg-white p-2"
              />
              <p className="mb-4 text-sm text-text-muted">{panelCopy.adminMfa.enrollIntro}</p>
            </>
          )}

          {step === 'verify' && (
            <p className="mb-4 text-sm text-text-muted">{panelCopy.adminMfa.verifyIntro}</p>
          )}

          {step !== 'checking' && (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <FormField
                id="mfa-code"
                label={panelCopy.adminMfa.codeLabel}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                pattern="[0-9]{6}"
                required
                value={code}
                onValueChange={(value) => setCode(value.replace(/\D/g, '').slice(0, 6))}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={sending || code.length !== 6}
              >
                {sending
                  ? panelCopy.adminMfa.verifying
                  : step === 'enroll'
                    ? panelCopy.adminMfa.enable
                    : panelCopy.adminMfa.verify}
              </Button>
            </form>
          )}

          {step === 'enroll' && (
            <p className="mt-4 text-xs text-text-muted">{panelCopy.adminMfa.recoveryHint}</p>
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
            ← {panelCopy.adminMfa.backToSite}
          </Link>
        </p>
      </Container>
    </main>
  )
}