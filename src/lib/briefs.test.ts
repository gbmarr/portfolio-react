import { beforeEach, describe, expect, it, vi } from 'vitest'

type TableResult = { data: unknown; error: { message: string } | null }

const h = vi.hoisted(() => {
  const tableResults = new Map<string, TableResult>()
  /** Registro de llamadas: { method, args } en orden. */
  const calls: Array<{ method: string; args: unknown[] }> = []

  function makeBuilder(result: TableResult) {
    const builder = {
      select: (...args: unknown[]) => {
        calls.push({ method: 'select', args })
        return builder
      },
      insert: (payload: unknown) => {
        calls.push({ method: 'insert', args: [payload] })
        return builder
      },
      update: (patch: unknown) => {
        calls.push({ method: 'update', args: [patch] })
        return builder
      },
      delete: () => builder,
      upsert: () => builder,
      eq: (...args: unknown[]) => {
        calls.push({ method: 'eq', args })
        return builder
      },
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

  return { tableResults, calls, from, makeBuilder }
})

vi.mock('./supabase', () => ({
  isSupabaseConfigured: true,
  supabase: { from: h.from },
}))

import { getBrief, listBriefs, updateBriefAnswers, upsertBrief } from './briefs'

beforeEach(() => {
  vi.clearAllMocks()
  h.tableResults.clear()
  h.calls.length = 0
})

const briefRow = {
  id: 'b1',
  project_id: 'p1',
  service_type: 'landing',
  extra_ids: ['blog'],
  answers: {},
  status: 'pendiente',
  created_at: '2026-10-08T00:00:00Z',
  updated_at: '2026-10-08T00:00:00Z',
}

describe('getBrief', () => {
  it('devuelve null cuando el proyecto no tiene brief', async () => {
    h.tableResults.set('project_briefs', { data: null, error: null })
    await expect(getBrief('p1')).resolves.toBeNull()
  })

  it('devuelve el brief existente', async () => {
    h.tableResults.set('project_briefs', { data: briefRow, error: null })
    await expect(getBrief('p1')).resolves.toEqual(briefRow)
    expect(h.from).toHaveBeenCalledWith('project_briefs')
  })

  it('lanza ante error del servidor', async () => {
    h.tableResults.set('project_briefs', { data: null, error: { message: 'RLS denied' } })
    await expect(getBrief('p1')).rejects.toThrow('RLS denied')
  })
})

describe('upsertBrief', () => {
  it('crea un brief nuevo cuando el proyecto no tiene uno', async () => {
    h.tableResults.set('project_briefs', { data: null, error: null })
    h.calls.length = 0
    await upsertBrief('p1', 'landing', ['blog'])

    const insertCall = h.calls.find((call) => call.method === 'insert')
    expect(insertCall?.args[0]).toMatchObject({
      project_id: 'p1',
      service_type: 'landing',
      extra_ids: ['blog'],
      answers: {},
      status: 'pendiente',
    })
  })

  it('devuelve el brief existente tal cual si servicio y extras no cambian', async () => {
    h.tableResults.set('project_briefs', { data: briefRow, error: null })
    await expect(upsertBrief('p1', 'landing', ['blog'])).resolves.toEqual(briefRow)
    expect(h.calls.some((call) => call.method === 'update')).toBe(false)
  })

  it('resetea answers y vuelve a pendiente si cambia el servicio', async () => {
    h.tableResults.set('project_briefs', {
      data: { ...briefRow, answers: { nombre: 'X' }, status: 'completado' },
      error: null,
    })
    await upsertBrief('p1', 'institucional', ['blog'])

    const updateCall = h.calls.find((call) => call.method === 'update')
    expect(updateCall?.args[0]).toMatchObject({
      service_type: 'institucional',
      extra_ids: ['blog'],
      answers: {},
      status: 'pendiente',
    })
  })

  it('resetea answers y vuelve a pendiente si cambian los extras', async () => {
    h.tableResults.set('project_briefs', {
      data: { ...briefRow, status: 'completado' },
      error: null,
    })
    await upsertBrief('p1', 'landing', ['blog', 'seo'])

    const updateCall = h.calls.find((call) => call.method === 'update')
    expect(updateCall?.args[0]).toMatchObject({
      service_type: 'landing',
      extra_ids: ['blog', 'seo'],
      answers: {},
      status: 'pendiente',
    })
  })
})

describe('updateBriefAnswers', () => {
  it('guarda respuestas y marca completado cuando todos los obligatorios están respondidos', async () => {
    h.tableResults.set('project_briefs', { data: briefRow, error: null })
    const answers: Record<string, string> = {
      nombre: 'Mi marca',
      sector: 'Gimnasio',
      descripcion_corta: 'Entrenamiento personalizado',
      objetivo: 'Conseguir clientes',
      cta_principal: 'Escribir por WhatsApp',
      color_principal: '#123456',
      blog_contenidos: 'si',
    }
    await updateBriefAnswers('p1', answers)

    const updateCall = h.calls.find((call) => call.method === 'update')
    expect(updateCall?.args[0]).toMatchObject({ answers, status: 'completado' })
  })

  it('deja el brief en pendiente cuando faltan obligatorios', async () => {
    h.tableResults.set('project_briefs', { data: briefRow, error: null })
    const answers: Record<string, string> = { nombre: 'Mi marca' }
    await updateBriefAnswers('p1', answers)

    const updateCall = h.calls.find((call) => call.method === 'update')
    expect(updateCall?.args[0]).toMatchObject({ answers, status: 'pendiente' })
  })

  it('lanza si el proyecto no tiene brief', async () => {
    h.tableResults.set('project_briefs', { data: null, error: null })
    await expect(updateBriefAnswers('p1', {})).rejects.toThrow('Brief no encontrado')
  })

  it('lanza ante error del servidor al actualizar', async () => {
    h.tableResults.set('project_briefs', { data: briefRow, error: null })
    h.from.mockImplementationOnce(() => h.makeBuilder({ data: briefRow, error: null }))
    h.from.mockImplementationOnce(() =>
      h.makeBuilder({ data: null, error: { message: 'update denied' } }),
    )
    await expect(updateBriefAnswers('p1', {})).rejects.toThrow('update denied')
  })
})

describe('listBriefs', () => {
  it('devuelve todos los briefs', async () => {
    h.tableResults.set('project_briefs', { data: [briefRow], error: null })
    await expect(listBriefs()).resolves.toEqual([briefRow])
  })

  it('devuelve lista vacía ante datos nulos', async () => {
    h.tableResults.set('project_briefs', { data: null, error: null })
    await expect(listBriefs()).resolves.toEqual([])
  })

  it('lanza ante error', async () => {
    h.tableResults.set('project_briefs', { data: null, error: { message: 'boom' } })
    await expect(listBriefs()).rejects.toThrow('boom')
  })
})