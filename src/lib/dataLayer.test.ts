import { beforeEach, describe, expect, it, vi } from 'vitest'

type TableResult = { data: unknown; error: { message: string } | null }

const h = vi.hoisted(() => {
  const tableResults = new Map<string, TableResult>()

  function makeBuilder(result: TableResult) {
    const builder = {
      select: () => builder,
      insert: () => builder,
      update: () => builder,
      delete: () => builder,
      upsert: () => builder,
      eq: () => builder,
      neq: () => builder,
      order: () => builder,
      maybeSingle: () => Promise.resolve(result),
      single: () => Promise.resolve(result),
      then: (
        onFulfilled: (value: TableResult) => unknown,
        onRejected?: (reason: unknown) => unknown,
      ) => Promise.resolve(result).then(onFulfilled, onRejected),
    }
    return builder
  }

  const from = vi.fn((table: string) =>
    makeBuilder(tableResults.get(table) ?? { data: [], error: null }),
  )

  return { tableResults, from, makeBuilder }
})

vi.mock('./supabase', () => ({
  isSupabaseConfigured: true,
  supabase: { from: h.from },
}))

import {
  createProject,
  createStage,
  decideMilestone,
  deleteProject,
  deleteStage,
  getProject,
  listApprovals,
  listProjects,
  listStages,
  reorderStages,
  updateProject,
  updateStage,
} from './projects'
import { listClients } from './clients'
import { deleteMessage, listMessages, markMessageRead, saveContactMessage } from './messages'

beforeEach(() => {
  vi.clearAllMocks()
  h.tableResults.clear()
})

describe('proyectos', () => {
  it('lista proyectos ordenados', async () => {
    h.tableResults.set('projects', { data: [{ id: 'p1' }], error: null })
    await expect(listProjects()).resolves.toEqual([{ id: 'p1' }])
    expect(h.from).toHaveBeenCalledWith('projects')
  })

  it('lista proyectos devuelve vacío ante datos nulos', async () => {
    h.tableResults.set('projects', { data: null, error: null })
    await expect(listProjects()).resolves.toEqual([])
  })

  it('getProject devuelve el proyecto o lanza', async () => {
    h.tableResults.set('projects', { data: { id: 'p1' }, error: null })
    await expect(getProject('p1')).resolves.toEqual({ id: 'p1' })

    h.tableResults.set('projects', { data: null, error: null })
    await expect(getProject('nope')).rejects.toThrow('Proyecto no encontrado')

    h.tableResults.set('projects', { data: null, error: { message: 'RLS' } })
    await expect(getProject('p1')).rejects.toThrow('RLS')
  })

  it('createProject propaga errores del servidor', async () => {
    h.tableResults.set('projects', { data: null, error: { message: 'check constraint' } })
    await expect(
      createProject({
        client_email: 'a@b.com',
        title: 'Sitio',
        type: 'web',
        status: 'lead',
        start_date: null,
        deadline: null,
        description: null,
      }),
    ).rejects.toThrow('check constraint')
  })

  it('updateProject devuelve la fila actualizada', async () => {
    h.tableResults.set('projects', { data: { id: 'p1', status: 'completado' }, error: null })
    await expect(updateProject('p1', { status: 'completado' })).resolves.toEqual({
      id: 'p1',
      status: 'completado',
    })
  })

  it('deleteProject lanza ante error', async () => {
    h.tableResults.set('projects', { data: [], error: { message: 'denied' } })
    await expect(deleteProject('p1')).rejects.toThrow('denied')
  })
})

describe('etapas', () => {
  it('lista etapas del proyecto', async () => {
    h.tableResults.set('project_stages', { data: [{ id: 's1' }], error: null })
    await expect(listStages('p1')).resolves.toEqual([{ id: 's1' }])
  })

  it('createStage y updateStage devuelven la fila', async () => {
    h.tableResults.set('project_stages', { data: { id: 's1' }, error: null })
    await expect(
      createStage('p1', {
        name: 'Diseño',
        description: null,
        position: 0,
        status: 'pendiente',
        client_visible: true,
        notes: null,
      }),
    ).resolves.toEqual({ id: 's1' })
    await expect(updateStage('s1', { status: 'completada' })).resolves.toEqual({ id: 's1' })
  })

  it('deleteStage lanza ante error', async () => {
    h.tableResults.set('project_stages', { data: [], error: { message: 'boom' } })
    await expect(deleteStage('s1')).rejects.toThrow('boom')
  })

  it('reorderStages actualiza position en orden', async () => {
    h.tableResults.set('project_stages', { data: [], error: null })
    await reorderStages(['s2', 's1'])
    expect(h.from).toHaveBeenCalledTimes(2)
    const [firstCall, secondCall] = h.from.mock.calls
    expect(firstCall[0]).toBe('project_stages')
    expect(secondCall[0]).toBe('project_stages')
  })

  it('reorderStages lanza en el primer error', async () => {
    h.from.mockImplementationOnce(() => h.makeBuilder({ data: [], error: null })).mockImplementationOnce(
      () => h.makeBuilder({ data: [], error: { message: 'fail' } }),
    )
    await expect(reorderStages(['a', 'b'])).rejects.toThrow('fail')
  })
})

describe('aprobaciones', () => {
  it('lista aprobaciones del proyecto', async () => {
    h.tableResults.set('milestone_approvals', { data: [{ id: 'a1' }], error: null })
    await expect(listApprovals('p1')).resolves.toEqual([{ id: 'a1' }])
  })

  it('decideMilestone hace upsert y propaga error', async () => {
    h.tableResults.set('milestone_approvals', { data: { id: 'a1' }, error: null })
    await expect(
      decideMilestone({
        stage_id: 's1',
        project_id: 'p1',
        client_id: 'u1',
        decision: 'aprobado',
        comment: null,
      }),
    ).resolves.toEqual({ id: 'a1' })

    h.tableResults.set('milestone_approvals', { data: null, error: { message: 'fk' } })
    await expect(
      decideMilestone({
        stage_id: 's1',
        project_id: 'p1',
        client_id: 'u1',
        decision: 'rechazado',
        comment: null,
      }),
    ).rejects.toThrow('fk')
  })
})

describe('mensajes', () => {
  it('lista mensajes o lanza', async () => {
    h.tableResults.set('contact_messages', { data: [{ id: 'm1' }], error: null })
    await expect(listMessages()).resolves.toEqual([{ id: 'm1' }])

    h.tableResults.set('contact_messages', { data: null, error: { message: 'err' } })
    await expect(listMessages()).rejects.toThrow('err')
  })

  it('markMessageRead marca y desmarca', async () => {
    h.tableResults.set('contact_messages', { data: [], error: null })
    await markMessageRead('m1', true)
    await markMessageRead('m1', false)
    expect(h.from).toHaveBeenCalledTimes(2)

    h.tableResults.set('contact_messages', { data: [], error: { message: 'upd' } })
    await expect(markMessageRead('m1', true)).rejects.toThrow('upd')
  })

  it('saveContactMessage inserta o lanza', async () => {
    h.tableResults.set('contact_messages', { data: [], error: null })
    await expect(
      saveContactMessage({ name: 'Ana', email: 'a@b.com', message: 'Hola, todo bien' }),
    ).resolves.toBeUndefined()

    h.tableResults.set('contact_messages', { data: [], error: { message: 'insert denied' } })
    await expect(
      saveContactMessage({ name: 'Ana', email: 'a@b.com', message: 'Hola, todo bien' }),
    ).rejects.toThrow('insert denied')
  })

  it('deleteMessage lanza ante error', async () => {
    h.tableResults.set('contact_messages', { data: [], error: { message: 'no borra' } })
    await expect(deleteMessage('m1')).rejects.toThrow('no borra')

    h.tableResults.set('contact_messages', { data: [], error: null })
    await expect(deleteMessage('m1')).resolves.toBeUndefined()
  })
})

describe('clientes', () => {
  it('une proyectos y perfiles: activos, conteos y orden', async () => {
    h.tableResults.set('projects', {
      data: [{ client_email: 'b@b.com' }, { client_email: 'a@a.com' }, { client_email: 'b@b.com' }],
      error: null,
    })
    h.tableResults.set('profiles', {
      data: [
        { email: 'A@a.com', full_name: 'Ana', role: 'client' },
        { email: 'yo@test.com', full_name: 'Yo', role: 'admin' },
        { email: 'c@c.com', full_name: 'Caro', role: 'client' },
      ],
      error: null,
    })

    const clients = await listClients()
    expect(clients).toEqual([
      { email: 'a@a.com', active: true, full_name: 'Ana', projectCount: 1 },
      { email: 'b@b.com', active: false, full_name: null, projectCount: 2 },
      { email: 'c@c.com', active: true, full_name: 'Caro', projectCount: 0 },
    ])
  })

  it('propaga errores de cualquiera de las dos consultas', async () => {
    h.tableResults.set('projects', { data: [], error: { message: 'e1' } })
    h.tableResults.set('profiles', { data: [], error: null })
    await expect(listClients()).rejects.toThrow('e1')

    h.tableResults.set('projects', { data: [], error: null })
    h.tableResults.set('profiles', { data: [], error: { message: 'e2' } })
    await expect(listClients()).rejects.toThrow('e2')
  })
})
