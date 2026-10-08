import { useMemo, useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { FormField } from '../../components/ui/FormField'
import { SelectField } from '../../components/ui/SelectField'
import { TextAreaField } from '../../components/ui/TextAreaField'
import {
  computeBriefStatus,
  getBriefTemplate,
  getExtraSections,
  getRequiredFields,
  type BriefField,
} from '../../data/briefTemplates'
import { panelCopy } from '../../data/panel'
import { updateBriefAnswers } from '../../lib/briefs'
import type { ProjectBrief } from '../../lib/types'

interface ClientBriefProps {
  brief: ProjectBrief
  onSaved: (updated: ProjectBrief) => void
}

const yesnoOptions = [
  { value: '', label: panelCopy.client.brief.yesnoPlaceholder },
  { value: 'si', label: panelCopy.client.brief.yesnoYes },
  { value: 'no', label: panelCopy.client.brief.yesnoNo },
]

interface BriefFieldInputProps {
  field: BriefField
  value: string
  onValueChange: (value: string) => void
}

function BriefFieldInput({ field, value, onValueChange }: BriefFieldInputProps) {
  if (field.kind === 'longtext') {
    return (
      <TextAreaField
        id={field.id}
        label={field.label}
        value={value}
        onValueChange={onValueChange}
        rows={4}
      />
    )
  }

  if (field.kind === 'color') {
    return (
      <FormField
        id={field.id}
        label={field.label}
        type="color"
        value={value || '#000000'}
        onValueChange={onValueChange}
        className="h-10 w-20 cursor-pointer rounded-lg border border-border bg-background"
      />
    )
  }

  if (field.kind === 'yesno') {
    return (
      <SelectField
        id={field.id}
        label={field.label}
        value={value}
        onValueChange={onValueChange}
        options={yesnoOptions}
      />
    )
  }

  return (
    <FormField
      id={field.id}
      label={field.label}
      type={field.kind === 'url' ? 'url' : 'text'}
      value={value}
      onValueChange={onValueChange}
    />
  )
}

/** Sección interactiva "¿Qué vamos a necesitar?" del panel del cliente. */
export function ClientBrief({ brief, onSaved }: ClientBriefProps) {
  const [answers, setAnswers] = useState<Record<string, string>>(brief.answers)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const template = useMemo(() => getBriefTemplate(brief.service_type), [brief.service_type])
  const sections = useMemo(
    () => [...template.sections, ...getExtraSections(template, brief.extra_ids)],
    [template, brief.extra_ids],
  )
  const requiredFields = useMemo(
    () => getRequiredFields(template, brief.extra_ids),
    [template, brief.extra_ids],
  )

  const done = requiredFields.filter((field) => (answers[field.id] ?? '').trim().length > 0).length
  const total = requiredFields.length
  const status = computeBriefStatus(template, brief.extra_ids, answers)

  function updateField(fieldId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }))
  }

  async function handleSave() {
    setSaving(true)
    setMessage(null)
    setError(null)
    try {
      const updated = await updateBriefAnswers(brief.project_id, answers)
      onSaved(updated)
      setMessage(panelCopy.client.brief.saved)
    } catch {
      setError(panelCopy.client.brief.saveError)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section aria-label={panelCopy.client.brief.title} className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
          {panelCopy.client.brief.title}
        </h2>
        <p className="text-sm text-text-muted">{panelCopy.client.brief.intro}</p>
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone={status === 'completado' ? 'done' : 'neutral'}>
            {status === 'completado'
              ? panelCopy.client.brief.statusCompleted
              : panelCopy.client.brief.statusPending}
          </Badge>
          <span className="text-sm text-text-muted">
            {panelCopy.client.brief.progress(done, total)}
          </span>
        </div>
      </div>

      {sections.map((section) => (
        <fieldset
          key={section.id}
          className="space-y-4 rounded-xl border border-border bg-surface/40 p-4"
        >
          <legend className="px-1 text-sm font-semibold text-text">{section.title}</legend>
          {section.fields.map((field) => (
            <div key={field.id}>
              <BriefFieldInput
                field={field}
                value={answers[field.id] ?? ''}
                onValueChange={(value) => updateField(field.id, value)}
              />
              {field.hint && <p className="mt-1 text-xs text-text-muted">{field.hint}</p>}
            </div>
          ))}
        </fieldset>
      ))}

      {message && (
        <p
          role="status"
          className="rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300"
        >
          {message}
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-300"
        >
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? panelCopy.client.brief.saving : panelCopy.client.brief.save}
      </button>
    </section>
  )
}
