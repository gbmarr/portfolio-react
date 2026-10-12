import { useState } from 'react'
import { listClients } from '../../lib/clients'
import { useAuth } from '../../lib/auth-context'
import { Badge } from '../../components/ui/Badge'
import { Loading } from '../../components/ui/Loading'
import { ErrorAlert } from '../../components/ui/ErrorAlert'
import { useAsyncData } from '../../hooks/useAsyncData'
import { panelCopy } from '../../data/panel'

/** Clientes detectados (proyectos + perfiles) con invitación por magic link. */
export function ClientsPage() {
  const { inviteByMagicLink } = useAuth()
  const { data: clients, error, loading } = useAsyncData(() => listClients(), [])
  const [invited, setInvited] = useState<Set<string>>(new Set())
  const [sending, setSending] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  async function handleInvite(email: string) {
    setSending(email)
    setActionError(null)
    try {
      await inviteByMagicLink(email)
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
          Los clientes se detectan a partir de los proyectos cargados. Podés invitar a los
          pendientes o reenviar el enlace mágico a cuentas ya creadas (por ejemplo, si perdieron el
          correo).
        </p>
      </div>

      {loading && <Loading />}

      {error && <ErrorAlert>{error}</ErrorAlert>}

      {clients && clients.length === 0 && (
        <p className="rounded-xl border border-border bg-background/60 px-4 py-8 text-center text-text-muted">
          Todavía no hay clientes. Creá un proyecto y su cliente aparecerá acá.
        </p>
      )}

      {clients && clients.length > 0 && (
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
              {clients.map((client) => (
                <tr
                  key={client.email}
                  className="border-b border-border last:border-b-0 hover:bg-background/40"
                >
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
                    {invited.has(client.email) ? (
                      <span className="text-xs text-emerald-300">Invitación enviada ✓</span>
                    ) : (
                      <button
                        type="button"
                        disabled={sending === client.email}
                        onClick={() => handleInvite(client.email)}
                        className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-60"
                      >
                        {sending === client.email
                          ? 'Enviando…'
                          : client.active
                            ? 'Reenviar enlace'
                            : 'Invitar'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {actionError && <ErrorAlert>{actionError}</ErrorAlert>}
    </div>
  )
}
