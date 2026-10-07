import { useEffect, useState } from 'react'
import { listClients, type ClientRow } from '../../lib/clients'
import { useAuth } from '../../lib/auth'
import { Badge } from '../../components/ui/Badge'
import { panelCopy } from '../../data/panel'

type State =
  | { loading: true; error: null; clients: null }
  | { loading: false; error: string | null; clients: ClientRow[] | null }

/** Clientes detectados (proyectos + perfiles) con invitación por magic link. */
export function ClientsPage() {
  const { signInWithMagicLink } = useAuth()
  const [state, setState] = useState<State>({ loading: true, error: null, clients: null })
  const [invited, setInvited] = useState<Set<string>>(new Set())
  const [sending, setSending] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    listClients()
      .then((clients) => {
        if (!cancelled) setState({ loading: false, error: null, clients })
      })
      .catch(() => {
        if (!cancelled) setState({ loading: false, error: panelCopy.error.generic, clients: null })
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function handleInvite(email: string) {
    setSending(email)
    setActionError(null)
    try {
      await signInWithMagicLink(email)
      setInvited((current) => new Set(current).add(email))
    } catch {
      setActionError(`No se pudo enviar la invitación a ${email}.`)
    } finally {
      setSending(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-text">{panelCopy.nav.clients}</h1>
        <p className="mt-1 text-sm text-text-muted">
          Los clientes se detectan a partir de los proyectos cargados. Cuando entran por primera vez con su
          enlace mágico, quedan activos.
        </p>
      </div>

      {state.loading && (
        <p role="status" className="animate-pulse text-text-muted">
          {panelCopy.loading}
        </p>
      )}

      {state.error && (
        <p role="alert" className="rounded-lg border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-300">
          {state.error}
        </p>
      )}

      {state.clients && state.clients.length === 0 && (
        <p className="rounded-xl border border-border bg-background/60 px-4 py-8 text-center text-text-muted">
          Todavía no hay clientes. Creá un proyecto y su cliente aparecerá acá.
        </p>
      )}

      {state.clients && state.clients.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-background/60 text-xs uppercase tracking-wider text-text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Nombre</th>
                <th className="px-4 py-3 font-semibold">Proyectos</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold">Acción</th>
              </tr>
            </thead>
            <tbody>
              {state.clients.map((client) => (
                <tr key={client.email} className="border-b border-border last:border-b-0 hover:bg-background/40">
                  <td className="px-4 py-3 text-text">{client.email}</td>
                  <td className="px-4 py-3 text-text-muted">{client.full_name ?? '—'}</td>
                  <td className="px-4 py-3 text-text-muted">{client.projectCount}</td>
                  <td className="px-4 py-3">
                    {client.active ? (
                      <Badge tone="done">Activo</Badge>
                    ) : (
                      <Badge tone="neutral">Por activar</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {client.active || invited.has(client.email) ? (
                      <span className="text-xs text-emerald-300">
                        {invited.has(client.email) ? 'Invitación enviada ✓' : '—'}
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={sending === client.email}
                        onClick={() => handleInvite(client.email)}
                        className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-60"
                      >
                        {sending === client.email ? 'Enviando…' : 'Invitar'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {actionError && (
        <p role="alert" className="rounded-lg border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-300">
          {actionError}
        </p>
      )}
    </div>
  )
}