import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Badge } from '../../components/ui/Badge'
import { TextAreaField } from '../../components/ui/TextAreaField'
import { ClientBrief } from './ClientBrief'
import { useAuth } from '../../lib/auth'
import { getBrief } from '../../lib/briefs'
import { formatDate } from '../../lib/format'
import {
  decideMilestone,
  getProject,
  listApprovals,
  listStages,
} from '../../lib/projects'
import { panelCopy, statusLabels, statusTones } from '../../data/panel'
import type {
  ApprovalDecision,
  MilestoneApproval,
  Project,
  ProjectBrief,
  ProjectStage,
} from '../../lib/types'

type Detail = {
  project: Project
  stages: ProjectStage[]
  approvals: MilestoneApproval[]
  brief: ProjectBrief | null
}

type LoadState =
  | { loading: true; error: null; detail: null }
  | { loading: false; error: string | null; detail: Detail | null }

function approvalFor(approvals: MilestoneApproval[], stageId: string) {
  return approvals.find((approval) => approval.stage_id === stageId)
}

const dotClass = (status: ProjectStage['status']) => {
  if (status === 'completada') return 'bg-emerald-300'
  if (status === 'revision') return 'bg-amber-300'
  if (status === 'en_progreso') return 'bg-accent'
  return 'border-border bg-background'
}

/** Detalle de proyecto para el cliente: timeline + aprobaciones. */
export function ClientProjectDetailPage() {
  const { id } = useParams()
  const { session } = useAuth()
  const [state, setState] = useState<LoadState>({ loading: true, error: null, detail: null })
  const [pending, setPending] = useState<{ stageId: string; decision: ApprovalDecision } | null>(null)
  const [comment, setComment] = useState('')
  const [sendingStage, setSendingStage] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [editingBrief, setEditingBrief] = useState(false)

  const load = useCallback(async () => {
    if (!id) return null
    const [project, stages, approvals, brief] = await Promise.all([
      getProject(id),
      listStages(id),
      listApprovals(id),
      getBrief(id),
    ])
    return { project, stages, approvals, brief }
  }, [id])

  useEffect(() => {
    let cancelled = false

    async function boot() {
      try {
        const detail = await load()
        if (!cancelled) setState({ loading: false, error: null, detail })
      } catch (error) {
        if (!cancelled) {
          const notFound = error instanceof Error && error.message === 'Proyecto no encontrado'
          setState({ loading: false, error: notFound ? panelCopy.client.notFound : panelCopy.error.generic, detail: null })
        }
      }
    }

    void boot()
    return () => {
      cancelled = true
    }
  }, [load])

  async function refresh() {
    const detail = await load()
    if (detail) setState({ loading: false, error: null, detail })
  }

  function handleBriefSaved(updated: ProjectBrief) {
    setState((prev) =>
      prev.detail ? { loading: false, error: null, detail: { ...prev.detail, brief: updated } } : prev,
    )
    setEditingBrief(false)
  }

  async function handleSubmitDecision(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!pending || !session) return
    const { stageId, decision } = pending
    setSendingStage(stageId)
    setActionError(null)
    setActionMessage(null)
    try {
      await decideMilestone({
        stage_id: stageId,
        project_id: state.detail?.project.id ?? '',
        client_id: session.user.id,
        decision,
        comment: comment.trim() || null,
      })
      setPending(null)
      setComment('')
      setActionMessage(panelCopy.client.decisionSent)
      await refresh()
    } catch {
      setActionError(panelCopy.client.decisionError)
    } finally {
      setSendingStage(null)
    }
  }

  if (state.loading) {
    return (
      <p role="status" className="animate-pulse text-text-muted">
        {panelCopy.loading}
      </p>
    )
  }

  if (state.error || !state.detail) {
    return (
      <div className="space-y-4">
        <p role="alert" className="rounded-lg border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-300">
          {state.error ?? panelCopy.error.generic}
        </p>
        <Link to="/panel" className="text-sm text-accent hover:underline">
          {panelCopy.client.backLink}
        </Link>
      </div>
    )
  }

  const { project, stages, approvals, brief } = state.detail
  const visibleStages = stages.filter((stage) => stage.client_visible)

  return (
    <section className="space-y-10">
      <header className="space-y-3">
        <Link to="/panel" className="text-sm text-text-muted hover:text-accent">
          {panelCopy.client.backLink}
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-2xl font-semibold text-text">{project.title}</h1>
          <Badge tone={statusTones.project[project.status]}>
            {statusLabels.project[project.status]}
          </Badge>
          <span className="text-xs text-text-muted">{statusLabels.type[project.type]}</span>
        </div>
        {project.description && (
          <p className="whitespace-pre-wrap text-sm text-text-muted">{project.description}</p>
        )}
      </header>

      {brief &&
        (brief.status === 'completado' && !editingBrief ? (
          <section
            aria-label={panelCopy.client.brief.completedTitle}
            className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-emerald-400/40 bg-emerald-400/10 p-5"
          >
            <div className="space-y-1">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-emerald-300">
                {panelCopy.client.brief.completedTitle}
              </h2>
              <p className="text-sm text-text-muted">{panelCopy.client.brief.completedHint}</p>
            </div>
            <button
              type="button"
              onClick={() => setEditingBrief(true)}
              className="rounded-full border border-border px-4 py-2 text-sm text-text-muted transition-colors hover:text-accent"
            >
              {panelCopy.client.brief.editAgain}
            </button>
          </section>
        ) : (
          <ClientBrief brief={brief} onSaved={handleBriefSaved} />
        ))}

      {actionMessage && (
        <p role="status" className="rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
          {actionMessage}
        </p>
      )}
      {actionError && (
        <p role="alert" className="rounded-lg border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-300">
          {actionError}
        </p>
      )}

      <section aria-label={panelCopy.client.timeline} className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
          {panelCopy.client.timeline}
        </h2>
        {visibleStages.length === 0 ? (
          <p className="text-text-muted">{panelCopy.client.timelineEmpty}</p>
        ) : (
          <ol className="relative space-y-6 border-l border-border pl-6">
            {visibleStages.map((stage) => {
              const approval = approvalFor(approvals, stage.id)
              const reviewing = stage.status === 'revision' && !approval
              return (
                <li key={stage.id} className="relative">
                  <span
                    className={`absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-background ${dotClass(stage.status)}`}
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium text-text">{stage.name}</h3>
                    <Badge tone={statusTones.stage[stage.status]}>
                      {statusLabels.stage[stage.status]}
                    </Badge>
                    {approval && (
                      <Badge tone={approval.decision === 'aprobado' ? 'done' : 'danger'}>
                        {approval.decision === 'aprobado'
                          ? panelCopy.client.youApproved
                          : panelCopy.client.youRejected}
                      </Badge>
                    )}
                  </div>

                  {stage.description && (
                    <p className="mt-1 whitespace-pre-wrap text-sm text-text-muted">{stage.description}</p>
                  )}

                  {(stage.started_at || stage.completed_at) && (
                    <p className="mt-1 text-xs text-text-muted">
                      {stage.started_at && <>Inicio: {formatDate(stage.started_at)}</>}
                      {stage.started_at && stage.completed_at && ' · '}
                      {stage.completed_at && <>Fin: {formatDate(stage.completed_at)}</>}
                    </p>
                  )}

                  {approval?.comment && (
                    <blockquote className="mt-2 rounded-lg border border-border bg-background/60 px-3 py-2 text-sm text-text-muted">
                      “{approval.comment}”
                    </blockquote>
                  )}

                  {reviewing && (
                    <div className="mt-3 space-y-3">
                      <p className="text-sm text-text-muted">{panelCopy.client.stageReview}</p>
                      {pending?.stageId === stage.id ? (
                        <form onSubmit={handleSubmitDecision} className="space-y-3">
                          <TextAreaField
                            id={`comment-${stage.id}`}
                            label="Comentario"
                            hideLabel
                            rows={3}
                            maxLength={1000}
                            placeholder={panelCopy.client.commentPlaceholder}
                            value={comment}
                            onValueChange={setComment}
                          />
                          <div className="flex gap-3">
                            <button
                              type="submit"
                              disabled={sendingStage === stage.id}
                              className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {sendingStage === stage.id ? panelCopy.client.deciding : panelCopy.client.sendDecision}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setPending(null)
                                setComment('')
                              }}
                              className="rounded-full border border-border px-4 py-2 text-sm text-text-muted hover:text-accent"
                            >
                              {panelCopy.client.cancel}
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => setPending({ stageId: stage.id, decision: 'aprobado' })}
                            className="rounded-full bg-emerald-300 px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
                          >
                            {panelCopy.client.approve}
                          </button>
                          <button
                            type="button"
                            onClick={() => setPending({ stageId: stage.id, decision: 'rechazado' })}
                            className="rounded-full bg-red-300 px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
                          >
                            {panelCopy.client.reject}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              )
            })}
          </ol>
        )}
      </section>
    </section>
  )
}