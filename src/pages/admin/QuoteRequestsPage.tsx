import { useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { ErrorAlert } from '../../components/ui/ErrorAlert'
import { Loading } from '../../components/ui/Loading'
import { panelCopy } from '../../data/panel'
import { estimateExtras, estimateTiers } from '../../data/estimate'
import { useAsyncData } from '../../hooks/useAsyncData'
import { formatDateTime } from '../../lib/format'
import { computeEstimate } from '../../lib/estimate'
import {
  deleteQuoteRequest,
  listQuoteRequests,
  updateQuoteRequestStatus,
} from '../../lib/quoteRequests'
import type { QuoteRequest, QuoteRequestStatus } from '../../lib/types'
import { safeMailtoAddress } from '../../utils/contactSafety'

const statusTones = {
  new: 'progress',
  contacted: 'review',
  closed: 'done',
} as const

function tierName(tier: QuoteRequest['tier']): string {
  return estimateTiers.find((item) => item.id === tier)?.name ?? tier
}

function extraNames(extras: string[]): string {
  if (extras.length === 0) return panelCopy.quotesPage.noExtras
  return extras
    .map((id) => estimateExtras.find((extra) => extra.id === id)?.label ?? id)
    .join(', ')
}

/** Solicitudes de presupuesto: brief, contacto y estado. Nunca montos. */
export function QuoteRequestsPage() {
  const { data: requests, error, loading, reload } = useAsyncData(() => listQuoteRequests(), [])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  async function handleStatus(request: QuoteRequest, status: QuoteRequestStatus) {
    setActionError(null)
    try {
      await updateQuoteRequestStatus(request.id, status)
      await reload()
    } catch {
      setActionError(panelCopy.quotesPage.statusError)
    }
  }

  async function handleDelete(request: QuoteRequest) {
    setActionError(null)
    try {
      await deleteQuoteRequest(request.id)
      if (expandedId === request.id) setExpandedId(null)
      await reload()
    } catch {
      setActionError(panelCopy.quotesPage.deleteError)
    }
  }

  const newCount = requests?.filter((request) => request.status === 'new').length ?? 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-text">
          {panelCopy.nav.quotes}
        </h1>
        {!loading && requests && newCount > 0 && (
          <Badge tone="progress">{panelCopy.quotesPage.newCount(newCount)}</Badge>
        )}
      </div>

      {loading && <Loading />}

      {error && <ErrorAlert>{error}</ErrorAlert>}

      {requests && requests.length === 0 && (
        <p className="rounded-xl border border-border bg-background/60 px-4 py-8 text-center text-text-muted">
          {panelCopy.quotesPage.empty}
        </p>
      )}

      {requests && requests.length > 0 && (
        <ul className="space-y-3">
          {requests.map((request) => {
            const expanded = expandedId === request.id
            const replyAddress = safeMailtoAddress(request.email)
            const subject = `Presupuesto — ${tierName(request.tier)} — ${request.name}`
            return (
              <li
                key={request.id}
                className={`rounded-xl border bg-background/60 p-4 ${
                  request.status === 'new' ? 'border-accent/50' : 'border-border'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : request.id)}
                  className="flex w-full flex-wrap items-center gap-3 text-left"
                  aria-expanded={expanded}
                >
                  {request.status === 'new' && (
                    <>
                      <span
                        className="h-2 w-2 shrink-0 rounded-full bg-accent"
                        aria-hidden="true"
                      />
                      <span className="sr-only">Solicitud nueva.</span>
                    </>
                  )}
                  <span className="font-medium text-text">{request.name}</span>
                  <span className="text-sm text-text-muted">{request.email}</span>
                  <span className="ml-auto text-xs text-text-muted">
                    {formatDateTime(request.created_at)}
                  </span>
                  <Badge tone={statusTones[request.status]}>
                    {panelCopy.quotesPage.statuses[request.status]}
                  </Badge>
                </button>

                <div
                  className={`grid transition-[grid-template-rows,opacity] duration-[220ms] ease-out motion-reduce:transition-none ${
                    expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                  aria-hidden={!expanded}
                  inert={!expanded}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div className="mt-3 space-y-4 border-t border-border pt-3">
                      <dl className="grid gap-3 text-sm sm:grid-cols-2">
                        <div>
                          <dt className="text-text-muted">{panelCopy.quotesPage.tier}</dt>
                          <dd className="text-text">{tierName(request.tier)}</dd>
                        </div>
                        <div>
                          <dt className="text-text-muted">{panelCopy.quotesPage.sections}</dt>
                          <dd className="text-text">
                            {request.sections > 0
                              ? request.sections
                              : panelCopy.quotesPage.notApplicable}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-text-muted">{panelCopy.quotesPage.extras}</dt>
                          <dd className="text-text">{extraNames(request.extras)}</dd>
                        </div>
                        <div>
                          <dt className="text-text-muted">{panelCopy.quotesPage.consent}</dt>
                          <dd className="text-text">
                            v{request.consent_version} — {formatDateTime(request.consent_at)}
                          </dd>
                        </div>
                      </dl>

                      {(() => {
                        const estimate = computeEstimate({
                          tier: request.tier,
                          sections: request.sections,
                          extras: request.extras,
                        })
                        const arsApprox = estimate.maxUsd * 1200
                        return (
                          <div className="rounded-lg border border-border/70 bg-background/40 p-3">
                            <p className="text-sm font-medium text-text">Estimado (referencia)</p>
                            <p className="mt-1 text-sm text-text-muted">
                              USD {estimate.minUsd} – {estimate.maxUsd} (aprox. ARS {arsApprox.toLocaleString('es-AR')})
                            </p>
                            {estimate.breakdown.length > 0 && (
                              <ul className="mt-2 space-y-1 text-xs text-text-muted">
                                {estimate.breakdown.map((item) => (
                                  <li key={item.id} className="flex items-center justify-between gap-3">
                                    <span>{item.label}</span>
                                    <span>+USD {item.amountUsd}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                            <p className="mt-2 text-xs text-text-muted">
                              Solo lectura, orientativo y no vinculante.
                            </p>
                          </div>
                        )
                      })()}

                      <div>
                        <p className="text-sm text-text-muted">{panelCopy.quotesPage.notes}</p>
                        <p className="mt-1 whitespace-pre-wrap text-sm text-text">
                          {request.notes || panelCopy.quotesPage.noNotes}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        {replyAddress ? (
                          <a
                            href={`mailto:${replyAddress}?subject=${encodeURIComponent(subject)}`}
                            className="rounded text-sm text-accent hover-fine:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                          >
                            {panelCopy.quotesPage.contact}
                          </a>
                        ) : (
                          <span className="text-sm text-text-muted">{request.email}</span>
                        )}

                        <div className="ml-auto flex flex-wrap gap-2">
                          {request.status === 'new' && (
                            <button
                              type="button"
                              onClick={() => handleStatus(request, 'contacted')}
                              className="rounded border border-border px-2 py-1 text-xs text-text-muted transition-colors duration-150 hover-fine:border-accent hover-fine:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                            >
                              {panelCopy.quotesPage.markContacted}
                            </button>
                          )}
                          {request.status !== 'closed' && (
                            <button
                              type="button"
                              onClick={() => handleStatus(request, 'closed')}
                              className="rounded border border-border px-2 py-1 text-xs text-text-muted transition-colors duration-150 hover-fine:border-accent hover-fine:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                            >
                              {panelCopy.quotesPage.close}
                            </button>
                          )}
                          {request.status !== 'new' && (
                            <button
                              type="button"
                              onClick={() => handleStatus(request, 'new')}
                              className="rounded border border-border px-2 py-1 text-xs text-text-muted transition-colors duration-150 hover-fine:border-accent hover-fine:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                            >
                              {panelCopy.quotesPage.reopen}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDelete(request)}
                            className="rounded border border-border px-2 py-1 text-xs text-text-muted transition-colors duration-150 hover-fine:border-red-400 hover-fine:text-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50"
                          >
                            {panelCopy.quotesPage.delete}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {actionError && <ErrorAlert>{actionError}</ErrorAlert>}
    </div>
  )
}
