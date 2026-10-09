import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  createStage,
  deleteProject,
  deleteStage,
  getProject,
  listApprovals,
  listStages,
  reorderStages,
  updateStage,
} from '../../lib/projects'
import { getBrief } from '../../lib/briefs'
import { useAuth } from '../../lib/auth'
import { formatDate } from '../../lib/format'
import { Badge } from '../../components/ui/Badge'
import { StageEditor } from './StageEditor'
import { statusLabels, statusTones, panelCopy } from '../../data/panel'
import { estimateTiers, estimateExtras } from '../../data/estimate'
import { getBriefTemplate, getExtraSections } from '../../data/briefTemplates'
import { getStageTemplate } from '../../data/stageTemplates'
import type { MilestoneApproval, Project, ProjectBrief, ProjectStage } from '../../lib/types'

type Detail = {
  project: Project
  stages: ProjectStage[]
  approvals: MilestoneApproval[]
  brief: ProjectBrief | null
}

type State =
  | { loading: true; error: null; detail: null }
  | { loading: false; error: string | null; detail: Detail | null }

/** Detalle del proyecto: datos, timeline editable e invitación. */
export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { signInWithMagicLink } = useAuth()

  const [state, setState] = useState<State>({ loading: true, error: null, detail: null })
  const [inviteStatus, setInviteStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [stageMessage, setStageMessage] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!id) return null
    const [project, stages, approvals, brief] = await Promise.all([
      getProject(id),
      listStages(id),
      listApprovals(id),
      getBrief(id),
    ])
    return { project, stages, approvals, brief } satisfies Detail
  }, [id])

  useEffect(() => {
    let cancelled = false

    async function boot() {
      try {
        const detail = await load()
        if (cancelled) return
        if (!detail) {
          setState({ loading: false, error: panelCopy.error.generic, detail: null })
          return
        }
        setState({ loading: false, error: null, detail })
      } catch {
        if (!cancelled) {
          setState({ loading: false, error: panelCopy.error.generic, detail: null })
        }
      }
    }

    void boot()
    return () => {
      cancelled = true
    }
  }, [load])

  const detail = state.detail

  function setActionError() {
    setState((current) =>
      current.detail
        ? { loading: false, error: panelCopy.error.generic, detail: current.detail }
        : current,
    )
  }

  async function refresh() {
    const detail = await load()
    if (detail) setState({ loading: false, error: null, detail })
  }

  async function run(action: () => Promise<unknown>) {
    try {
      await action()
      await refresh()
    } catch {
      setActionError()
    }
  }

  async function handleInvite() {
    if (!detail) return
    setInviteStatus('sending')
    try {
      await signInWithMagicLink(detail.project.client_email)
      setInviteStatus('sent')
    } catch {
      setInviteStatus('error')
    }
  }

  async function handleDeleteProject() {
    if (!detail) return
    try {
      await deleteProject(detail.project.id)
      navigate('/admin/proyectos')
    } catch {
      setActionError()
    }
  }

  if (state.loading) {
    return (
      <p role="status" className="animate-pulse text-text-muted">
        {panelCopy.loading}
      </p>
    )
  }

  if (state.error && !detail) {
    return (
      <p role="alert" className="rounded-lg border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-300">
        {state.error}
      </p>
    )
  }

  if (!detail) return null

  const { project, stages, approvals, brief } = detail

  const briefServiceName = brief
    ? estimateTiers.find((tier) => tier.id === brief.service_type)?.name ?? brief.service_type
    : null
  const briefExtras = brief
    ? estimateExtras.filter((extra) => brief.extra_ids.includes(extra.id))
    : []

  const briefFieldLabels = new Map<string, string>()
  const briefAnswers: Array<{ fieldId: string; label: string; value: string }> = []
  if (brief) {
    const template = getBriefTemplate(brief.service_type)
    const allSections = [...template.sections, ...getExtraSections(template, brief.extra_ids)]
    for (const section of allSections) {
      for (const field of section.fields) briefFieldLabels.set(field.id, field.label)
    }
    for (const [fieldId, rawValue] of Object.entries(brief.answers)) {
      const value = Array.isArray(rawValue) ? rawValue.join(', ') : rawValue
      if (value && value.trim()) {
        briefAnswers.push({
          fieldId,
          label: briefFieldLabels.get(fieldId) ?? fieldId,
          value,
        })
      }
    }
  }

  const suggestedStages = brief ? getStageTemplate(brief.service_type, brief.extra_ids) : []
  const existingStageNames = new Set(stages.map((item) => item.name.trim().toLowerCase()))
  const missingSuggestedStages = suggestedStages.filter(
    (name) => !existingStageNames.has(name.trim().toLowerCase()),
  )

  async function handleAddSuggestedStages() {
    if (!detail) return
    if (missingSuggestedStages.length === 0) {
      setStageMessage('Ya tenés todas las etapas sugeridas.')
      return
    }
    try {
      let position = stages.length
      for (const name of missingSuggestedStages) {
        await createStage(project.id, {
          name,
          description: null,
          position: position++,
          status: 'pendiente',
          client_visible: true,
          notes: null,
        })
      }
      await refresh()
      const count = missingSuggestedStages.length
      setStageMessage(`Se agregaron ${count} ${count === 1 ? 'etapa' : 'etapas'} sugeridas.`)
    } catch {
      setActionError()
    }
  }

  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <Link to="/admin/proyectos" className="text-sm text-text-muted hover:text-accent">
              ← Proyectos
            </Link>
            <h1 className="font-display text-2xl font-semibold text-text">{project.title}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={statusTones.project[project.status]}>
                {statusLabels.project[project.status]}
              </Badge>
              <Badge>{statusLabels.type[project.type]}</Badge>
              <span className="text-sm text-text-muted">{project.client_email}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleInvite}
              disabled={inviteStatus === 'sending'}
              className="rounded-full border border-border px-4 py-2 text-sm text-text-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-60"
            >
              {inviteStatus === 'sent' ? 'Invitación enviada ✓' : 'Enviar invitación'}
            </button>
            <Link
              to={`/admin/proyectos/${project.id}/editar`}
              className="rounded-full border border-border px-4 py-2 text-sm text-text-muted transition-colors hover:border-accent hover:text-accent"
            >
              Editar
            </Link>
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="rounded-full border border-border px-4 py-2 text-sm text-text-muted transition-colors hover:border-red-400 hover:text-red-300"
            >
              Eliminar
            </button>
          </div>
        </div>

        {inviteStatus === 'sent' && (
          <p role="status" className="rounded-lg border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-accent">
            Se envió un enlace mágico a {project.client_email}. Cuando entre, su cuenta queda activa.
          </p>
        )}
        {inviteStatus === 'error' && (
          <p role="alert" className="rounded-lg border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-300">
            No se pudo enviar la invitación.
          </p>
        )}

        {confirmDelete && (
          <div
            role="alertdialog"
            aria-label="Confirmar eliminación"
            className="flex flex-wrap items-center gap-3 rounded-lg border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-300"
          >
            <span>¿Eliminar el proyecto y todos sus datos?</span>
            <button
              type="button"
              onClick={handleDeleteProject}
              className="rounded bg-red-400/20 px-3 py-1 font-semibold hover:bg-red-400/30"
            >
              Sí, eliminar
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="rounded border border-red-400/40 px-3 py-1 hover:bg-red-400/10"
            >
              Cancelar
            </button>
          </div>
        )}

        <dl className="grid grid-cols-2 gap-4 rounded-xl border border-border bg-background/60 p-5 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-text-muted">Inicio</dt>
            <dd className="mt-1 text-text">{formatDate(project.start_date)}</dd>
          </div>
          <div>
            <dt className="text-text-muted">Entrega</dt>
            <dd className="mt-1 text-text">{formatDate(project.deadline)}</dd>
          </div>
          <div>
            <dt className="text-text-muted">Creado</dt>
            <dd className="mt-1 text-text">{formatDate(project.created_at)}</dd>
          </div>
          {project.description && (
            <div className="col-span-2 sm:col-span-4">
              <dt className="text-text-muted">Descripción</dt>
              <dd className="mt-1 whitespace-pre-wrap text-text">{project.description}</dd>
            </div>
          )}
        </dl>

        {state.error && (
          <p role="alert" className="rounded-lg border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-300">
            {state.error}
          </p>
        )}
      </div>

      <section
        aria-label="Brief del cliente"
        className="space-y-3 rounded-xl border border-border bg-background/60 p-5"
      >
        <h2 className="text-sm font-semibold text-text">Brief del cliente</h2>
        {brief ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{briefServiceName}</Badge>
              {briefExtras.map((extra) => (
                <Badge key={extra.id}>{extra.label}</Badge>
              ))}
              <Badge tone={brief.status === 'completado' ? 'done' : 'neutral'}>
                {brief.status === 'completado' ? 'Completado' : 'Pendiente'}
              </Badge>
            </div>
            {briefAnswers.length > 0 ? (
              <dl className="grid gap-3 sm:grid-cols-2">
                {briefAnswers.map((item) => (
                  <div key={item.fieldId}>
                    <dt className="text-xs text-text-muted">{item.label}</dt>
                    <dd className="mt-0.5 whitespace-pre-wrap text-sm text-text">{item.value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-sm text-text-muted">El cliente todavía no respondió ningún campo.</p>
            )}
          </>
        ) : (
          <p className="text-sm text-text-muted">
            Todavía no definiste el brief. Editá el proyecto para elegir el servicio y los extras.
          </p>
        )}
      </section>

      <section
        aria-label="Etapas sugeridas"
        className="space-y-3 rounded-xl border border-border bg-background/60 p-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-text">Etapas sugeridas</h2>
            <p className="mt-1 text-sm text-text-muted">
              {brief
                ? `Agregá la plantilla para “${briefServiceName}” y ajustá sólo lo que difiera.`
                : 'Definí el servicio y los extras en el brief para ver las etapas sugeridas.'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddSuggestedStages}
            disabled={!brief}
            className="rounded-full border border-border px-4 py-2 text-sm text-text-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-60"
          >
            Agregar etapas sugeridas
          </button>
        </div>
        {stageMessage && (
          <p role="status" className="text-sm text-accent">
            {stageMessage}
          </p>
        )}
      </section>

      <StageEditor
        stages={stages}
        approvals={approvals}
        onAdd={(name) =>
          run(() =>
            createStage(project.id, {
              name,
              description: null,
              position: stages.length,
              status: 'pendiente',
              client_visible: true,
              notes: null,
            }),
          )
        }
        onUpdate={(stageId, patch) => run(() => updateStage(stageId, patch))}
        onMove={(orderedIds, direction, index) => {
          const swapped = [...orderedIds]
          const target = index + direction
          ;[swapped[index], swapped[target]] = [swapped[target], swapped[index]]
          return run(() => reorderStages(swapped))
        }}
        onDelete={(stageId) => run(() => deleteStage(stageId))}
      />
    </div>
  )
}
