import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StageEditor, type StageEditorProps } from './StageEditor'
import type { MilestoneApproval, ProjectStage } from '../../lib/types'

const stage = (over: Partial<ProjectStage> = {}): ProjectStage => ({
  id: 'stage-1',
  project_id: 'p1',
  name: 'Diseño aprobado',
  description: null,
  position: 0,
  status: 'pendiente',
  client_visible: true,
  started_at: null,
  completed_at: null,
  notes: null,
  created_at: '2026-01-01T00:00:00Z',
  ...over,
})

const approval = (over: Partial<MilestoneApproval> = {}): MilestoneApproval => ({
  id: 'a1',
  stage_id: 'stage-1',
  project_id: 'p1',
  client_id: 'c1',
  decision: 'aprobado',
  comment: null,
  created_at: '2026-01-02T00:00:00Z',
  ...over,
})

const props: StageEditorProps = {
  stages: [stage()],
  approvals: [],
  onAdd: vi.fn<() => Promise<void>>(async () => {}),
  onUpdate: vi.fn<() => Promise<void>>(async () => {}),
  onMove: vi.fn<() => Promise<void>>(async () => {}),
  onDelete: vi.fn<() => Promise<void>>(async () => {}),
}

function renderEditor(over: Partial<typeof props> = {}) {
  return render(<StageEditor {...props} {...over} />)
}

describe('StageEditor', () => {
  it('renderiza las etapas con su nombre y estado', () => {
    renderEditor({ stages: [stage(), stage({ id: 's2', name: 'Desarrollo', status: 'en_progreso' })] })
    expect(screen.getByText('Diseño aprobado')).toBeInTheDocument()
    expect(screen.getByText('Desarrollo')).toBeInTheDocument()
    expect(screen.getAllByText('En progreso').length).toBeGreaterThan(0)
  })

  it('muestra el badge de decisión del cliente cuando hay aprobación', () => {
    renderEditor({ approvals: [approval()] })
    expect(screen.getByText('Cliente: aprobó')).toBeInTheDocument()
  })

  it('muestra badge de rechazo', () => {
    renderEditor({ approvals: [approval({ decision: 'rechazado' })] })
    expect(screen.getByText('Cliente: rechazó')).toBeInTheDocument()
  })

  it('marca las etapas ocultas al cliente', () => {
    renderEditor({ stages: [stage({ client_visible: false })] })
    expect(screen.getByText('oculta al cliente')).toBeInTheDocument()
  })

  it('agrega una etapa al enviar el formulario', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn<() => Promise<void>>(async () => {})
    renderEditor({ stages: [], onAdd })

    await user.type(screen.getByLabelText('Nueva etapa'), 'Maquetado')
    await user.click(screen.getByRole('button', { name: 'Agregar etapa' }))

    await waitFor(() => expect(onAdd).toHaveBeenCalledWith('Maquetado'))
    expect(screen.getByLabelText('Nueva etapa')).toHaveValue('')
  })

  it('no agrega etapas vacías y avisa si falla', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn<() => Promise<void>>(async () => {
      throw new Error('boom')
    })
    renderEditor({ onAdd })

    await user.click(screen.getByRole('button', { name: 'Agregar etapa' }))
    expect(onAdd).not.toHaveBeenCalled()

    await user.type(screen.getByLabelText('Nueva etapa'), 'X')
    await user.click(screen.getByRole('button', { name: 'Agregar etapa' }))
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('No se pudo agregar la etapa.'))
  })

  it('cambia el estado de una etapa y registra fechas', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn<() => Promise<void>>(async () => {})
    renderEditor({ onUpdate })

    await user.selectOptions(screen.getByLabelText('Estado de Diseño aprobado'), 'completada')

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith(
        'stage-1',
        expect.objectContaining({ status: 'completada', completed_at: expect.any(String) }),
      )
    })
  })

  it('alterna la visibilidad del cliente', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn<() => Promise<void>>(async () => {})
    renderEditor({ onUpdate })

    await user.click(screen.getByRole('button', { name: 'Visibilidad de Diseño aprobado' }))

    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith('stage-1', { client_visible: false }),
    )
  })

  it('mueve etapas con las flechas', async () => {
    const user = userEvent.setup()
    const onMove = vi.fn<() => Promise<void>>(async () => {})
    const stages = [
      stage({ id: 's1', name: 'Uno' }),
      stage({ id: 's2', name: 'Dos', position: 1 }),
    ]
    renderEditor({ stages, onMove })

    await user.click(screen.getByRole('button', { name: 'Bajar Uno' }))
    expect(onMove).toHaveBeenCalledWith(['s1', 's2'], 1, 0)

    await user.click(screen.getByRole('button', { name: 'Subir Dos' }))
    expect(onMove).toHaveBeenCalledWith(['s1', 's2'], -1, 1)
  })

  it('deshabilita mover en los extremos', () => {
    renderEditor({ stages: [stage()] })
    expect(screen.getByRole('button', { name: 'Subir Diseño aprobado' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Bajar Diseño aprobado' })).toBeDisabled()
  })

  it('edita nombre y descripción desde el modo edición', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn<() => Promise<void>>(async () => {})
    renderEditor({ stages: [stage()], onUpdate })

    await user.click(screen.getByRole('button', { name: 'Editar Diseño aprobado' }))
    const nameInput = screen.getByLabelText('Nombre')
    await user.clear(nameInput)
    await user.type(nameInput, 'Diseño final')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith('stage-1', { name: 'Diseño final', description: null }),
    )
  })

  it('elimina una etapa', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn<() => Promise<void>>(async () => {})
    renderEditor({ onDelete })

    await user.click(screen.getByRole('button', { name: 'Eliminar Diseño aprobado' }))
    expect(onDelete).toHaveBeenCalledWith('stage-1')
  })

  it('muestra estado vacío sin etapas', () => {
    renderEditor({ stages: [] })
    expect(screen.getByText(/Sin etapas todavía/)).toBeInTheDocument()
  })
})