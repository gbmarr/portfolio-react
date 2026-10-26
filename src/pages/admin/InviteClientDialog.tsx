import { useEffect, useState, type FormEvent } from 'react'
import { Button } from '../../components/Button'
import { TurnstileWidget } from '../../components/Turnstile'
import { panelCopy } from '../../data/panel'
import { useAuth } from '../../lib/auth-context'
import { TURNSTILE_ACTION_INVITE } from '../../shared/auth-contract'

interface InviteClientDialogProps {
  email: string
  onClose: () => void
  onSent: (email: string) => void
}

/**
 * Diálogo de invitación con CAPTCHA. Se monta solo cuando hay un email
 * seleccionado, así cada apertura arranca con estado limpio y un widget nuevo.
 */
export function InviteClientDialog({ email, onClose, onSent }: InviteClientDialogProps) {
  const { inviteByMagicLink } = useAuth()
  const [captchaToken, setCaptchaToken] = useState('')
  const [captchaKey, setCaptchaKey] = useState(0)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const siteKey = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY ?? ''

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !sending) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, sending])

  function resetCaptcha() {
    setCaptchaToken('')
    setCaptchaKey((key) => key + 1)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (siteKey && !captchaToken) {
      setError(panelCopy.invite.captchaRequired)
      return
    }

    setSending(true)
    setError(null)
    try {
      await inviteByMagicLink(email, captchaToken || undefined)
      onSent(email)
      onClose()
    } catch (err) {
      const authError = err as { code?: string; message?: string } | null
      if (/captcha/i.test(authError?.code ?? '') || /captcha/i.test(authError?.message ?? '')) {
        setError(panelCopy.invite.captchaError)
      } else {
        setError(panelCopy.invite.error)
      }
      resetCaptcha()
      setSending(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-title"
        aria-describedby="invite-description"
        className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl"
      >
        <h2 id="invite-title" className="font-display text-xl font-semibold text-text">
          {panelCopy.invite.title}
        </h2>
        <p id="invite-description" className="mt-2 text-sm leading-relaxed text-text-muted">
          {panelCopy.invite.intro(email)}
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {siteKey && (
            <TurnstileWidget
              key={captchaKey}
              siteKey={siteKey}
              action={TURNSTILE_ACTION_INVITE}
              onChange={setCaptchaToken}
            />
          )}

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-300"
            >
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={sending}>
              {panelCopy.invite.cancel}
            </Button>
            <Button type="submit" disabled={sending || Boolean(siteKey && !captchaToken)}>
              {sending ? panelCopy.invite.sending : panelCopy.invite.send}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
