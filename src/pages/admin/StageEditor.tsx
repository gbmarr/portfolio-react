import { useState, type FormEvent } from 'react'
import { Badge } from '../../components/ui/Badge'
import { FormField } from '../../components/ui/FormField'
import { SelectField } from '../../components/ui/SelectField'
import { TextAreaField } from '../../components/ui/TextAreaField'
import { statusLabels, statusTones } from '../../data/panel'
import type {
  ApprovalDecision,
  MilestoneApproval,
  ProjectStage,
  StageStatus,
} from '../../lib/types'

const stageStatusOptions = (Object.entries(statusLabels.stage) as Array<[StageStatus, string]>).map(
  ([value, label]) => ({ value, label })
)

export type StageEditorProps = {
  stages: ProjectStage[]
  approvals: MilestoneApproval[]
  onAdd: (name: string) => Promise<void>
  onUpdate: (id: string, patch: Partial<ProjectStage>) => Promise<void>
  onMove: (orderedIds: string[], direction: -1 | 1, index: number) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

function approvalFor(approvals: MilestoneApproval[], stageId: string) {
  return approvals.find((approval) => approval.stage_id === stageId)
}

function DecisionBadge({ decision }: { decision: ApprovalDecision }) {
  return (
    <Badge tone={decision === 'aprobado' ? 'done' : 'danger'}>
      Cliente: {decision === 'aprobado' ? 'aprobó' : 'rechazó'}
    </Badge>
  )
}

/** Editor del timeline de etapas del proyecto (solo admin). */
export function StageEditor({
  stages,
  approvals,
  onAdd,
  onUpdate,
  onMove,
  onDelete,
}: StageEditorProps) {
  const [newStageName, setNewStageName] = useState('')
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = newStageName.trim()
    if (!name) return
    setAdding(true)
    setError(null)
    try {
      await onAdd(name)
      setNewStageName('')
    } catch {
      setError('No se pudo agregar la etapa.')
    } finally {
      setAdding(false)
    }
  }

  function startEditing(stage: ProjectStage) {
    setEditingId(stage.id)
    setEditName(stage.name)
    setEditDescription(stage.description ?? '')
  }

  async function saveEditing(stage: ProjectStage) {
    const name = editName.trim()
    if (!name) return
    try {
      await onUpdate(stage.id, { name, description: editDescription.trim() || null })
      setEditingId(null)
    } catch {
      setError('No se pudo guardar la etapa.')
    }
  }

  async function handleStatusChange(stage: ProjectStage, status: StageStatus) {
    try {
      await onUpdate(stage.id, {
        status,
        started_at: status === 'pendiente' ? null : (stage.started_at ?? new Date().toISOString()),
        completed_at: status === 'completada' ? new Date().toISOString() : null,
      })
    } catch {
      setError('No se pudo cambiar el estado.')
    }
  }

  async function handleDelete(stage: ProjectStage) {
    try {
      await onDelete(stage.id)
    } catch {
      setError('No se pudo eliminar la etapa.')
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
        Etapas del proyecto
      </h2>

      <ol className="space-y-3">
        {stages.map((stage, index) => {
          const approval = approvalFor(approvals, stage.id)
          const isEditing = editingId === stage.id
          return (
            <li key={stage.id} className="rounded-xl border border-border bg-background/60 p-4">
              {isEditing ? (
                <div className="space-y-3">
                  <FormField
                    id={`stage-name-${stage.id}`}
                    label="Nombre"
                    value={editName}
                    onValueChange={setEditName}
                    maxLength={120}
                  />
                  <TextAreaField
                    id={`stage-desc-${stage.id}`}
                    label="Descripción"
                    rows={2}
                    value={editDescription}
                    onValueChange={setEditDescription}
                  />
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => saveEditing(stage)}
                      className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-background hover:bg-accent/90"
                    >
                      Guardar
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="rounded-full border border-border px-4 py-2 text-sm text-text-muted hover:border-accent hover:text-accent"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-semibold text-text-muted">{index + 1}.</span>
                    <span className="font-medium text-text">{stage.name}</span>
                    <Badge tone={statusTones.stage[stage.status]}>
                      {statusLabels.stage[stage.status]}
                    </Badge>
                    {approval && <DecisionBadge decision={approval.decision} />}
                    {!stage.client_visible && <Badge>oculta al cliente</Badge>}

                    <div className="ml-auto flex flex-wrap items-center gap-2">
                      <SelectField
                        id={`stage-status-${stage.id}`}
                        label="Estado"
                        hideLabel
                        aria-label={`Estado de ${stage.name}`}
                        className="w-auto rounded-lg border border-border bg-background px-2 py-1.5 text-xs"
                        value={stage.status}
                        onValueChange={(value) => handleStatusChange(stage, value as StageStatus)}
                        options={stageStatusOptions}
                      />
                      <button
                        type="button"
                        aria-label={`Subir ${stage.name}`}
                        disabled={index === 0}
                        onClick={() =>
                          onMove(
                            stages.map((s) => s.id),
                            -1,
                            index
                          )
                        }
                        className="rounded border border-border px-2 py-1 text-xs text-text-muted hover:border-accent hover:text-accent disabled:opacity-40"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        aria-label={`Bajar ${stage.name}`}
                        disabled={index === stages.length - 1}
                        onClick={() =>
                          onMove(
                            stages.map((s) => s.id),
                            1,
                            index
                          )
                        }
                        className="rounded border border-border px-2 py-1 text-xs text-text-muted hover:border-accent hover:text-accent disabled:opacity-40"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        aria-label={`Visibilidad de ${stage.name}`}
                        onClick={() =>
                          onUpdate(stage.id, { client_visible: !stage.client_visible })
                        }
                        className="rounded border border-border px-2 py-1 text-xs text-text-muted hover:border-accent hover:text-accent"
                      >
                        {stage.client_visible ? 'visible' : 'oculta'}
                      </button>
                      <button
                        type="button"
                        aria-label={`Editar ${stage.name}`}
                        onClick={() => startEditing(stage)}
                        className="rounded border border-border px-2 py-1 text-xs text-text-muted hover:border-accent hover:text-accent"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        aria-label={`Eliminar ${stage.name}`}
                        onClick={() => handleDelete(stage)}
                        className="rounded border border-border px-2 py-1 text-xs text-text-muted hover:border-red-400 hover:text-red-300"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  {approval?.comment?.trim() && (
                    <blockquote className="mt-2 rounded-lg border border-border bg-background/60 px-3 py-2 text-sm text-text-muted">
                      "{approval.comment}"
                    </blockquote>
                  )}
                </>
              )}
            </li>
          )
        })}
      </ol>

      {stages.length === 0 && (
        <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-text-muted">
          Sin etapas todavía. Agregá la primera acá abajo.
        </p>
      )}

      <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3">
        <div className="min-w-56 flex-1">
          <FormField
            id="new-stage-name"
            label="Nueva etapa"
            placeholder="Ej.: Diseño aprobado"
            maxLength={120}
            value={newStageName}
            onValueChange={setNewStageName}
          />
        </div>
        <button
          type="submit"
          disabled={adding || !newStageName.trim()}
          className="rounded-full border border-border px-5 py-3 text-sm font-medium text-text transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
        >
          Agregar etapa
        </button>
      </form>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-300"
        >
          {error}
        </p>
      )}
    </div>
  )
}
