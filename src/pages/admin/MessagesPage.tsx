import { useEffect, useState } from 'react'
import { deleteMessage, listMessages, markMessageRead } from '../../lib/messages'
import { Badge } from '../../components/ui/Badge'
import { formatDateTime } from '../../lib/format'
import { panelCopy } from '../../data/panel'
import type { ContactMessage } from '../../lib/types'

type State =
  | { loading: true; error: null; messages: null }
  | { loading: false; error: string | null; messages: ContactMessage[] | null }

/** Bandeja de mensajes del formulario de contacto. */
export function MessagesPage() {
  const [state, setState] = useState<State>({ loading: true, error: null, messages: null })
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    listMessages()
      .then((messages) => {
        if (!cancelled) setState({ loading: false, error: null, messages })
      })
      .catch(() => {
        if (!cancelled) setState({ loading: false, error: panelCopy.error.generic, messages: null })
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function reload() {
    try {
      const messages = await listMessages()
      setState({ loading: false, error: null, messages })
    } catch {
      setActionError(panelCopy.error.generic)
    }
  }

  async function handleToggleRead(message: ContactMessage) {
    setActionError(null)
    try {
      await markMessageRead(message.id, !message.read_at)
      await reload()
    } catch {
      setActionError('No se pudo actualizar el mensaje.')
    }
  }

  async function handleDelete(message: ContactMessage) {
    setActionError(null)
    try {
      await deleteMessage(message.id)
      if (expandedId === message.id) setExpandedId(null)
      await reload()
    } catch {
      setActionError('No se pudo eliminar el mensaje.')
    }
  }

  const unreadCount = state.messages?.filter((message) => !message.read_at).length ?? 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-text">{panelCopy.nav.messages}</h1>
        {!state.loading && state.messages && (
          <Badge tone={unreadCount > 0 ? 'progress' : 'neutral'}>
            {unreadCount} sin leer
          </Badge>
        )}
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

      {state.messages && state.messages.length === 0 && (
        <p className="rounded-xl border border-border bg-background/60 px-4 py-8 text-center text-text-muted">
          No hay mensajes todavía. Los envíos del formulario de contacto aparecen acá.
        </p>
      )}

      {state.messages && state.messages.length > 0 && (
        <ul className="space-y-3">
          {state.messages.map((message) => {
            const expanded = expandedId === message.id
            return (
              <li
                key={message.id}
                className={`rounded-xl border bg-background/60 p-4 ${message.read_at ? 'border-border' : 'border-accent/50'}`}
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : message.id)}
                  className="flex w-full flex-wrap items-center gap-3 text-left"
                  aria-expanded={expanded}
                >
                  {!message.read_at && (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-accent" aria-label="Sin leer" />
                  )}
                  <span className="font-medium text-text">{message.name}</span>
                  <span className="text-sm text-text-muted">{message.subject}</span>
                  <span className="ml-auto text-xs text-text-muted">{formatDateTime(message.created_at)}</span>
                </button>

                {expanded && (
                  <div className="mt-3 space-y-3 border-t border-border pt-3">
                    <p className="whitespace-pre-wrap text-sm text-text">{message.message}</p>
                    <div className="flex flex-wrap items-center gap-3">
                      <a
                        href={`mailto:${message.email}?subject=${encodeURIComponent(
                          message.subject ? `Re: ${message.subject}` : 'Re: consulta desde tu portfolio',
                        )}`}
                        className="text-sm text-accent hover:underline"
                      >
                        Responder por email ({message.email})
                      </a>
                      <div className="ml-auto flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleRead(message)}
                          className="rounded border border-border px-2 py-1 text-xs text-text-muted hover:border-accent hover:text-accent"
                        >
                          {message.read_at ? 'Marcar no leído' : 'Marcar leído'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(message)}
                          className="rounded border border-border px-2 py-1 text-xs text-text-muted hover:border-red-400 hover:text-red-300"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {actionError && (
        <p role="alert" className="rounded-lg border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-300">
          {actionError}
        </p>
      )}
    </div>
  )
}