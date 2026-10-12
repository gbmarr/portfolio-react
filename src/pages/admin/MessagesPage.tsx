import { useState } from 'react'
import { deleteMessage, listMessages, markMessageRead } from '../../lib/messages'
import { Badge } from '../../components/ui/Badge'
import { formatDateTime } from '../../lib/format'
import { safeMailtoAddress } from '../../utils/contactSafety'
import { Loading } from '../../components/ui/Loading'
import { ErrorAlert } from '../../components/ui/ErrorAlert'
import { useAsyncData } from '../../hooks/useAsyncData'
import { panelCopy } from '../../data/panel'
import type { ContactMessage } from '../../lib/types'

/** Bandeja de mensajes del formulario de contacto. */
export function MessagesPage() {
  const { data: messages, error, loading, reload } = useAsyncData(() => listMessages(), [])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

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

  const unreadCount = messages?.filter((message) => !message.read_at).length ?? 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-text">{panelCopy.nav.messages}</h1>
        {!loading && messages && (
          <Badge tone={unreadCount > 0 ? 'progress' : 'neutral'}>{unreadCount} sin leer</Badge>
        )}
      </div>

      {loading && <Loading />}

      {error && <ErrorAlert>{error}</ErrorAlert>}

      {messages && messages.length === 0 && (
        <p className="rounded-xl border border-border bg-background/60 px-4 py-8 text-center text-text-muted">
          No hay mensajes todavía. Los envíos del formulario de contacto aparecen acá.
        </p>
      )}

      {messages && messages.length > 0 && (
        <ul className="space-y-3">
          {messages.map((message) => {
            const expanded = expandedId === message.id
            const replyAddress = safeMailtoAddress(message.email)
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
                    <span
                      className="h-2 w-2 shrink-0 rounded-full bg-accent"
                      aria-label="Sin leer"
                    />
                  )}
                  <span className="font-medium text-text">{message.name}</span>
                  <span className="text-sm text-text-muted">{message.subject}</span>
                  <span className="ml-auto text-xs text-text-muted">
                    {formatDateTime(message.created_at)}
                  </span>
                </button>

                {expanded && (
                  <div className="mt-3 space-y-3 border-t border-border pt-3">
                    <p className="whitespace-pre-wrap text-sm text-text">{message.message}</p>
                    <div className="flex flex-wrap items-center gap-3">
                      {replyAddress ? (
                        <a
                          href={`mailto:${replyAddress}?subject=${encodeURIComponent(
                            message.subject
                              ? `Re: ${message.subject}`
                              : 'Re: consulta desde tu portfolio'
                          )}`}
                          className="text-sm text-accent hover:underline"
                        >
                          Responder por email ({message.email})
                        </a>
                      ) : (
                        <span className="text-sm text-text-muted">{message.email}</span>
                      )}
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

      {actionError && <ErrorAlert>{actionError}</ErrorAlert>}
    </div>
  )
}
