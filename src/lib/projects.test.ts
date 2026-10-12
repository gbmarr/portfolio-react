import { beforeEach, describe, expect, it, vi } from 'vitest'

type TableResult = { data: unknown; error: { message: string } | null }

const h = vi.hoisted(() => {
  const tableResults = new Map<string, TableResult>()
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

  return { tableResults, calls, from }
})

vi.mock('./supabase', () => ({
  isSupabaseConfigured: true,
  supabase: { from: h.from },
}))

import { createProject, updateProject } from './projects'

beforeEach(() => {
  vi.clearAllMocks()
  h.tableResults.clear()
  h.calls.length = 0
})

const row = {
  id: 'p1',
  client_email: 'panaderia@example.com',
  title: 'Sitio para Panadería',
  type: 'web',
  status: 'lead',
  start_date: null,
  deadline: null,
  description: null,
  created_at: '2026-10-12T00:00:00Z',
  updated_at: '2026-10-12T00:00:00Z',
  completed_at: null,
}

describe('createProject (RT-02)', () => {
  it('normaliza a minúsculas el email antes de insertar', async () => {
    h.tableResults.set('projects', { data: row, error: null })
    await createProject({
      title: 'Sitio para Panadería',
      client_email: '  Panaderia@Example.com ',
      type: 'web',
      status: 'lead',
      start_date: null,
      deadline: null,
      description: null,
    })

    const insertCall = h.calls.find((call) => call.method === 'insert')
    expect(insertCall?.args[0]).toMatchObject({ client_email: 'panaderia@example.com' })
  })

  it('rechaza un email inválido sin tocar la base', async () => {
    h.tableResults.set('projects', { data: row, error: null })

    await expect(
      createProject({
        title: 'Sitio',
        client_email: 'no-soy-email',
        type: 'web',
        status: 'lead',
        start_date: null,
        deadline: null,
        description: null,
      }),
    ).rejects.toThrow('El email del cliente no es válido.')
    expect(h.from).not.toHaveBeenCalled()
  })
})

describe('updateProject (RT-02)', () => {
  it('rechaza un patch con email inválido sin tocar la base', async () => {
    h.tableResults.set('projects', { data: row, error: null })

    await expect(
      updateProject('p1', { client_email: 'aaa@bbb' }),
    ).rejects.toThrow('El email del cliente no es válido.')
    expect(h.from).not.toHaveBeenCalled()
  })

  it('normaliza el email si viene en el patch', async () => {
    h.tableResults.set('projects', { data: row, error: null })
    await updateProject('p1', { client_email: '  Nuevo@Client.example.COM ' })

    const updateCall = h.calls.find((call) => call.method === 'update')
    expect(updateCall?.args[0]).toMatchObject({ client_email: 'nuevo@client.example.com' })
  })

  it('no valida el email si el patch no lo toca', async () => {
    h.tableResults.set('projects', { data: row, error: null })
    await updateProject('p1', { title: 'Título nuevo' })

    const updateCall = h.calls.find((call) => call.method === 'update')
    expect(updateCall?.args[0]).toEqual({ title: 'Título nuevo' })
  })
})