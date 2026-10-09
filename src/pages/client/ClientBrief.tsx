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
  hasAnswer,
  type BriefField,
} from '../../data/briefTemplates'
import { panelCopy } from '../../data/panel'
import { updateBriefAnswers } from '../../lib/briefs'
import type { BriefAnswers, ProjectBrief } from '../../lib/types'

interface ClientBriefProps {
  brief: ProjectBrief
  onSaved: (updated: ProjectBrief) => void
}

const OTHER_SELECT_VALUE = '__other__'

const yesnoOptions = [
  { value: '', label: panelCopy.client.brief.yesnoPlaceholder },
  { value: 'si', label: panelCopy.client.brief.yesnoYes },
  { value: 'no', label: panelCopy.client.brief.yesnoNo },
]

interface BriefFieldInputProps {
  field: BriefField
  value: string | string[] | undefined
  onValueChange: (value: string | string[]) => void
}

/** Chips de selección múltiple con opción de agregar una propia. */
function ChipsField({
  field,
  value,
  onValueChange,
}: {
  field: BriefField
  value: string[]
  onValueChange: (value: string[]) => void
}) {
  const [draft, setDraft] = useState('')
  const options = field.options ?? []
  const custom = value.filter((item) => !options.includes(item))

  function toggle(option: string) {
    onValueChange(
      value.includes(option) ? value.filter((item) => item !== option) : [...value, option],
    )
  }

  function addCustom() {
    const next = draft.trim()
    if (!next || value.includes(next)) {
      setDraft('')
      return
    }
    onValueChange([...value, next])
    setDraft('')
  }

  return (
    <div className="space-y-2" role="group" aria-label={field.label}>
      <span className="block text-sm font-medium text-text">{field.label}</span>
      <div className="flex flex-wrap gap-2">
        {[...options, ...custom].map((option) => {
          const isSelected = value.includes(option)
          return (
            <button
              key={option}
              type="button"
              aria-pressed={isSelected}
              onClick={() => toggle(option)}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                isSelected
                  ? 'border-accent bg-accent/15 text-accent'
                  : 'border-border bg-background text-text-muted hover:border-accent/50'
              }`}
            >
              {option}
            </button>
          )
        })}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor={`${field.id}-custom`} className="sr-only">
          {panelCopy.client.brief.addOptionLabel}
        </label>
        <input
          id={`${field.id}-custom`}
          type="text"
          value={draft}
          placeholder={panelCopy.client.brief.addOptionPlaceholder}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              addCustom()
            }
          }}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-text placeholder:text-text-muted/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/50"
        />
        <button
          type="button"
          onClick={addCustom}
          className="rounded-full border border-border px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:border-accent/50 hover:text-text"
        >
          {panelCopy.client.brief.addOptionButton}
        </button>
      </div>
    </div>
  )
}

/** Select con opción "Otra" que revela un campo de texto libre. */
function SelectOtherField({
  field,
  value,
  onValueChange,
}: {
  field: BriefField
  value: string
  onValueChange: (value: string) => void
}) {
  const options = field.options ?? []
  const isOther = value !== '' && !options.includes(value)
  const [showOther, setShowOther] = useState(isOther)
  const [draft, setDraft] = useState(isOther ? value : '')

  const selectOptions = [
    { value: '', label: panelCopy.client.brief.yesnoPlaceholder },
    ...options.map((option) => ({ value: option, label: option })),
    { value: OTHER_SELECT_VALUE, label: panelCopy.client.brief.selectOtherLabel },
  ]

  function handleSelect(next: string) {
    if (next === OTHER_SELECT_VALUE) {
      setShowOther(true)
      onValueChange(draft)
      return
    }
    setShowOther(false)
    setDraft('')
    onValueChange(next)
  }

  return (
    <div className="space-y-2">
      <SelectField
        id={field.id}
        label={field.label}
        value={showOther ? OTHER_SELECT_VALUE : value}
        onValueChange={handleSelect}
        options={selectOptions}
      />
      {showOther && (
        <FormField
          id={`${field.id}-other`}
          label={panelCopy.client.brief.selectOtherLabel}
          value={draft}
          onValueChange={(next) => {
            setDraft(next)
            onValueChange(next)
          }}
        />
      )}
    </div>
  )
}

function BriefFieldInput({ field, value, onValueChange }: BriefFieldInputProps) {
  if (field.kind === 'chips') {
    return (
      <ChipsField
        field={field}
        value={Array.isArray(value) ? value : []}
        onValueChange={onValueChange}
      />
    )
  }

  if (field.kind === 'select') {
    return (
      <SelectOtherField
        field={field}
        value={typeof value === 'string' ? value : ''}
        onValueChange={onValueChange}
      />
    )
  }

  const stringValue = typeof value === 'string' ? value : ''

  if (field.kind === 'longtext') {
    return (
      <TextAreaField
        id={field.id}
        label={field.label}
        value={stringValue}
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
        value={stringValue || '#000000'}
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
        value={stringValue}
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
      value={stringValue}
      onValueChange={onValueChange}
    />
  )
}

/** Sección interactiva "¿Qué vamos a necesitar?" del panel del cliente. */
export function ClientBrief({ brief, onSaved }: ClientBriefProps) {
  const [answers, setAnswers] = useState<BriefAnswers>(brief.answers)
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

  const done = requiredFields.filter((field) => hasAnswer(answers[field.id])).length
  const total = requiredFields.length
  const status = computeBriefStatus(template, brief.extra_ids, answers)

  function updateField(fieldId: string, value: string | string[]) {
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
                value={answers[field.id]}
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
