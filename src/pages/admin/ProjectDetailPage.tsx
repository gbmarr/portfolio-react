import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  createPayment,
  createStage,
  deletePayment,
  deleteProject,
  deleteStage,
  getProject,
  listApprovals,
  listPayments,
  listStages,
  reorderStages,
  updatePayment,
  updateStage,
} from '../../lib/projects'
import { useAuth } from '../../lib/auth'
import { formatDate, formatMoney } from '../../lib/format'
import { Badge } from '../../components/ui/Badge'
import { StageEditor } from './StageEditor'
import { PaymentsPanel } from './PaymentsPanel'
import { statusLabels, statusTones, panelCopy } from '../../data/panel'
import type { MilestoneApproval, Payment, Project, ProjectStage } from '../../lib/types'

type Detail = {
  project: Project
  stages: ProjectStage[]
  payments: Payment[]
  approvals: MilestoneApproval[]
}

type State =
  | { loading: true; error: null; detail: null }
  | { loading: false; error: string | null; detail: Detail | null }

/** Detalle del proyecto: datos, timeline editable, pagos e invitación. */
export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { signInWithMagicLink } = useAuth()

  const [state, setState] = useState<State>({ loading: true, error: null, detail: null })
  const [inviteStatus, setInviteStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const load = useCallback(async () => {
    if (!id) return
    try {
      const [project, stages, payments, approvals] = await Promise.all([
        getProject(id),
        listStages(id),
        listPayments(id),
        listApprovals(id),
      ])
      setState({ loading: false, error: null, detail: { project, stages, payments, approvals } })
    } catch {
      setState({ loading: false, error: panelCopy.error.generic, detail: null })
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  const detail = state.detail

  function setActionError() {
    setState((current) =>
      current.detail
        ? { loading: false, error: panelCopy.error.generic, detail: current.detail }
        : current,
    )
  }

  async function run(action: () => Promise<unknown>) {
    try {
      await action()
      await load()
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

  const { project, stages, payments, approvals } = detail

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
            <dt className="text-text-muted">Monto</dt>
            <dd className="mt-1 font-semibold text-text">{formatMoney(project.amount, project.currency)}</dd>
          </div>
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

      <PaymentsPanel
        payments={payments}
        onAdd={(input) => run(() => createPayment({ ...input, project_id: project.id }))}
        onTogglePaid={(payment) =>
          run(() =>
            updatePayment(payment.id, {
              status: payment.status === 'pagado' ? 'pendiente' : 'pagado',
              paid_at: payment.status === 'pagado' ? null : new Date().toISOString(),
            }),
          )
        }
        onDelete={(payment) => run(() => deletePayment(payment.id))}
      />
    </div>
  )
}
