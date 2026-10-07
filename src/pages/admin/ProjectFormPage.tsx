import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { createProject, getProject, updateProject } from '../../lib/projects'
import { listClients } from '../../lib/clients'
import { FormField } from '../../components/ui/FormField'
import { SelectField } from '../../components/ui/SelectField'
import { TextAreaField } from '../../components/ui/TextAreaField'
import { statusLabels, panelCopy } from '../../data/panel'
import type { Currency, ProjectStatus, ProjectType } from '../../lib/types'

const typeOptions = (
  Object.entries(statusLabels.type) as Array<[ProjectType, string]>
).map(([value, label]) => ({ value, label }))

const statusOptions = (
  Object.entries(statusLabels.project) as Array<[ProjectStatus, string]>
).map(([value, label]) => ({ value, label }))

const currencyOptions = [
  { value: 'ARS', label: 'ARS' },
  { value: 'USD', label: 'USD' },
]

type FormState = {
  title: string
  client_email: string
  type: ProjectType
  amount: string
  currency: Currency
  status: ProjectStatus
  start_date: string
  deadline: string
  description: string
}

const emptyForm: FormState = {
  title: '',
  client_email: '',
  type: 'web',
  amount: '',
  currency: 'ARS',
  status: 'lead',
  start_date: '',
  deadline: '',
  description: '',
}

/** Alta y edición de proyectos. `/admin/proyectos/nuevo` y `.../:id/editar`. */
export function ProjectFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState<FormState>(emptyForm)
  const [clientEmails, setClientEmails] = useState<string[]>([])
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [clients, project] = await Promise.all([
          listClients(),
          id ? getProject(id) : Promise.resolve(null),
        ])
        if (cancelled) return
        setClientEmails(clients.map((client) => client.email))
        if (project) {
          setForm({
            title: project.title,
            client_email: project.client_email,
            type: project.type,
            amount: String(project.amount),
            currency: project.currency,
            status: project.status,
            start_date: project.start_date ?? '',
            deadline: project.deadline ?? '',
            description: project.description ?? '',
          })
        }
        setLoading(false)
      } catch {
        if (!cancelled) {
          setError(panelCopy.error.generic)
          setLoading(false)
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [id])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const email = form.client_email.trim().toLowerCase()
    const amount = Number(form.amount)

    if (!form.title.trim() || !email) {
      setError('Completá el título y el email del cliente.')
      return
    }
    if (Number.isNaN(amount) || amount < 0) {
      setError('El monto debe ser un número mayor o igual a cero.')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const input = {
        title: form.title.trim(),
        client_email: email,
        type: form.type,
        amount,
        currency: form.currency,
        status: form.status,
        start_date: form.start_date || null,
        deadline: form.deadline || null,
        description: form.description.trim() || null,
      }
      const saved = isEdit ? await updateProject(id!, input) : await createProject(input)
      navigate(`/admin/proyectos/${saved.id}`)
    } catch {
      setError(panelCopy.error.generic)
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <p role="status" className="animate-pulse text-text-muted">
        {panelCopy.loading}
      </p>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-text">
          {isEdit ? 'Editar proyecto' : 'Nuevo proyecto'}
        </h1>
        <Link to="/admin/proyectos" className="text-sm text-text-muted hover:text-accent">
          Volver
        </Link>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4 rounded-xl border border-border bg-background/60 p-6">
        <FormField
          id="project-title"
          label="Título"
          required
          maxLength={160}
          value={form.title}
          onValueChange={(value) => set('title', value)}
        />
        <FormField
          id="project-client"
          label="Email del cliente"
          type="email"
          required
          maxLength={254}
          list="known-clients"
          value={form.client_email}
          onValueChange={(value) => set('client_email', value)}
        />
        <datalist id="known-clients">
          {clientEmails.map((email) => (
            <option key={email} value={email} />
          ))}
        </datalist>

        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            id="project-type"
            label="Tipo"
            value={form.type}
            onValueChange={(value) => set('type', value as ProjectType)}
            options={typeOptions}
          />
          <SelectField
            id="project-status"
            label="Estado"
            value={form.status}
            onValueChange={(value) => set('status', value as ProjectStatus)}
            options={statusOptions}
          />
          <FormField
            id="project-amount"
            label="Monto"
            type="number"
            min="0"
            step="0.01"
            required
            value={form.amount}
            onValueChange={(value) => set('amount', value)}
          />
          <SelectField
            id="project-currency"
            label="Moneda"
            value={form.currency}
            onValueChange={(value) => set('currency', value as Currency)}
            options={currencyOptions}
          />
          <FormField
            id="project-start"
            label="Fecha de inicio"
            type="date"
            value={form.start_date}
            onValueChange={(value) => set('start_date', value)}
          />
          <FormField
            id="project-deadline"
            label="Fecha de entrega"
            type="date"
            value={form.deadline}
            onValueChange={(value) => set('deadline', value)}
          />
        </div>

        <TextAreaField
          id="project-description"
          label="Descripción"
          rows={4}
          maxLength={2000}
          value={form.description}
          onValueChange={(value) => set('description', value)}
        />

        {error && (
          <p role="alert" className="rounded-lg border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-accent px-6 py-3 font-semibold text-background transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Guardando…' : 'Guardar'}
          </button>
          <Link
            to="/admin/proyectos"
            className="rounded-full border border-border px-6 py-3 font-medium text-text transition-colors hover:border-accent hover:text-accent"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
