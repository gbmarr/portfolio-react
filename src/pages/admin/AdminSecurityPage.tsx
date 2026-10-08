import { useState } from 'react'
import { useAuth } from '../../lib/auth'
import { Button } from '../../components/Button'
import { formatDate } from '../../lib/format'
import { panelCopy } from '../../data/panel'

/**
 * Gestión de passkeys del admin (registrar, listar y eliminar).
 * Las passkeys viajan en el contexto de auth: `passkeys === null` mientras
 * no se terminan de cargar las de la sesión actual.
 */
export function AdminSecurityPage() {
  const { passkeys, registerPasskey, deletePasskey } = useAuth()
  const [registering, setRegistering] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  async function handleRegister() {
    setRegistering(true)
    setMessage(null)
    setActionError(null)
    try {
      await registerPasskey()
      setMessage(panelCopy.security.registered)
    } catch {
      setActionError(panelCopy.security.registerError)
    } finally {
      setRegistering(false)
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    setMessage(null)
    setActionError(null)
    try {
      await deletePasskey(id)
      setMessage(panelCopy.security.deleted)
    } catch {
      setActionError(panelCopy.security.deleteError)
    } finally {
      setDeletingId(null)
    }
  }

  if (passkeys === null) {
    return (
      <div role="status" className="py-12 text-center text-text-muted">
        <span className="animate-pulse">{panelCopy.loading}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-semibold text-text">{panelCopy.security.title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-text-muted">{panelCopy.security.intro}</p>
        <p className="mt-1 max-w-2xl text-xs text-text-muted/80">{panelCopy.security.howItWorks}</p>
      </header>

      {message && (
        <p
          role="status"
          className="rounded-lg border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-accent"
        >
          {message}
        </p>
      )}
      {actionError && (
        <p
          role="alert"
          className="rounded-lg border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-300"
        >
          {actionError}
        </p>
      )}

      <section aria-label={panelCopy.security.listTitle}>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">
          {panelCopy.security.listTitle}
        </h2>
        {passkeys.length === 0 ? (
          <p className="rounded-lg border border-border bg-background/60 px-4 py-6 text-center text-sm text-text-muted">
            {panelCopy.security.listEmpty}
          </p>
        ) : (
          <ul className="space-y-3">
            {passkeys.map((passkey) => (
              <li
                key={passkey.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background/60 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-text">
                    {passkey.friendly_name ?? 'Passkey'}
                  </p>
                  <p className="text-xs text-text-muted">
                    {panelCopy.security.registeredOn} {formatDate(passkey.created_at ?? '')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void handleDelete(passkey.id)}
                  disabled={deletingId === passkey.id}
                  className="shrink-0 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-red-300 transition-colors hover:border-red-400/50 disabled:opacity-60"
                >
                  {deletingId === passkey.id ? panelCopy.security.deleting : panelCopy.security.delete}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Button type="button" onClick={() => void handleRegister()} disabled={registering}>
        {registering ? panelCopy.security.registering : panelCopy.security.register}
      </Button>
    </div>
  )
}