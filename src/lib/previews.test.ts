import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  ALLOWED_PREVIEW_MIME_TYPES,
  MAX_PREVIEW_BYTES,
  buildPreviewPath,
  deleteProjectPreview,
  listProjectPreviews,
  normalizePreviewLabel,
  normalizePreviewUrl,
  updateProjectPreview,
  uploadProjectPreview,
  validatePreviewFile,
} from './previews'

type State = {
  previewRows: unknown[]
  listError: { message: string } | null
  lastPosition: { position: number } | null
  insertResult: { data: unknown; error: { message: string } | null }
  updateResult: { data: unknown; error: { message: string } | null }
  deleteResult: { error: { message: string } | null }
  signedResult: { data: { signedUrl: string } | null; error: { message: string } | null }
  uploadResult: { error: { message: string } | null }
  removeResult: { error: { message: string } | null }
  calls: Array<{ method: string; args: unknown[] }>
}

const h = vi.hoisted(() => {
  const state: State = {
    previewRows: [],
    listError: null,
    lastPosition: null,
    insertResult: { data: null, error: null },
    updateResult: { data: null, error: null },
    deleteResult: { error: null },
    signedResult: { data: { signedUrl: 'https://cdn.example/preview.png' }, error: null },
    uploadResult: { error: null },
    removeResult: { error: null },
    calls: [],
  }

  function builder() {
    let mode: 'select' | 'insert' | 'update' | 'delete' = 'select'

    const b = {
      select: (...args: unknown[]) => {
        state.calls.push({ method: 'select', args })
        return b
      },
      insert: (payload: unknown) => {
        mode = 'insert'
        state.calls.push({ method: 'insert', args: [payload] })
        return b
      },
      update: (payload: unknown) => {
        mode = 'update'
        state.calls.push({ method: 'update', args: [payload] })
        return b
      },
      delete: () => {
        mode = 'delete'
        state.calls.push({ method: 'delete', args: [] })
        return b
      },
      eq: (...args: unknown[]) => {
        state.calls.push({ method: 'eq', args })
        return b
      },
      order: (...args: unknown[]) => {
        state.calls.push({ method: 'order', args })
        return b
      },
      limit: (...args: unknown[]) => {
        state.calls.push({ method: 'limit', args })
        return b
      },
      maybeSingle: () => Promise.resolve({ data: state.lastPosition, error: null }),
      single: () => {
        if (mode === 'insert') return Promise.resolve(state.insertResult)
        if (mode === 'update') return Promise.resolve(state.updateResult)
        return Promise.resolve({ data: null, error: null })
      },
      then: (
        onFulfilled: (value: unknown) => unknown,
        onRejected?: (reason: unknown) => unknown
      ) => {
        const result =
          mode === 'delete'
            ? state.deleteResult
            : { data: state.previewRows, error: state.listError }
        return Promise.resolve(result).then(onFulfilled, onRejected)
      },
    }
    return b
  }

  const from = vi.fn((table: string) => {
    state.calls.push({ method: 'from', args: [table] })
    return builder()
  })

  const storageFrom = vi.fn((bucket: string) => {
    state.calls.push({ method: 'storage.from', args: [bucket] })
    return {
      upload: (...args: unknown[]) => {
        state.calls.push({ method: 'upload', args })
        return Promise.resolve(state.uploadResult)
      },
      createSignedUrl: (...args: unknown[]) => {
        state.calls.push({ method: 'createSignedUrl', args })
        return Promise.resolve(state.signedResult)
      },
      remove: (...args: unknown[]) => {
        state.calls.push({ method: 'remove', args })
        return Promise.resolve(state.removeResult)
      },
    }
  })

  return {
    state,
    from,
    storageFrom,
    supabase: { from, storage: { from: storageFrom } },
  }
})

vi.mock('./supabase', () => ({ supabase: h.supabase }))

function resetState() {
  h.state.previewRows = []
  h.state.listError = null
  h.state.lastPosition = null
  h.state.insertResult = { data: null, error: null }
  h.state.updateResult = { data: null, error: null }
  h.state.deleteResult = { error: null }
  h.state.signedResult = {
    data: { signedUrl: 'https://cdn.example/preview.png' },
    error: null,
  }
  h.state.uploadResult = { error: null }
  h.state.removeResult = { error: null }
  h.state.calls.length = 0
  vi.clearAllMocks()
}

beforeEach(resetState)

const previewRow = (over: Record<string, unknown> = {}) => ({
  id: 'preview-1',
  project_id: 'p1',
  stage_id: null,
  storage_path: 'p1/abc.png',
  caption: 'Home',
  position: 0,
  client_visible: true,
  created_at: '2026-10-24T00:00:00Z',
  ...over,
})

describe('validatePreviewFile', () => {
  it('acepta un archivo de tipo y tamaño permitidos', () => {
    expect(validatePreviewFile({ size: 1024, type: 'image/png' })).toEqual({
      ok: true,
      mime: 'image/png',
    })
  })

  it('rechaza archivos vacíos, grandes o de tipo no permitido', () => {
    expect(validatePreviewFile({ size: 0, type: 'image/png' })).toMatchObject({ ok: false })
    expect(validatePreviewFile({ size: MAX_PREVIEW_BYTES + 1, type: 'image/png' })).toMatchObject({
      ok: false,
    })
    expect(validatePreviewFile({ size: 10, type: 'image/gif' })).toMatchObject({ ok: false })
  })

  it('expone la lista de MIME permitidos', () => {
    expect(ALLOWED_PREVIEW_MIME_TYPES).toContain('image/webp')
    expect(ALLOWED_PREVIEW_MIME_TYPES).toContain('image/avif')
  })
})

describe('buildPreviewPath', () => {
  it('arma el path con el id y la extensión del MIME', () => {
    expect(buildPreviewPath('p1', 'image/jpeg', 'fixed')).toBe('p1/fixed.jpg')
    expect(buildPreviewPath('p1', 'image/png', 'fixed')).toBe('p1/fixed.png')
    expect(buildPreviewPath('p1', 'image/webp', 'fixed')).toBe('p1/fixed.webp')
    expect(buildPreviewPath('p1', 'image/avif', 'fixed')).toBe('p1/fixed.avif')
  })
})

describe('normalizePreviewUrl', () => {
  it('devuelve null para un string vacío', () => {
    expect(normalizePreviewUrl('   ')).toBeNull()
  })

  it('agrega https cuando falta el esquema y normaliza la URL', () => {
    expect(normalizePreviewUrl('preview.example.com/home')).toBe('https://preview.example.com/home')
  })

  it('conserva una URL HTTPS válida', () => {
    expect(normalizePreviewUrl('https://figma.com/file/abc')).toBe('https://figma.com/file/abc')
  })

  it('rechaza HTTP y esquemas peligrosos', () => {
    expect(() => normalizePreviewUrl('http://preview.example.com')).toThrow('HTTPS')
    expect(() => normalizePreviewUrl('javascript:alert(1)')).toThrow('HTTPS')
  })

  it('rechaza una URL inválida', () => {
    expect(() => normalizePreviewUrl('https://')).toThrow('no es válido')
  })
})

describe('normalizePreviewLabel', () => {
  it('recorta y devuelve null si queda vacío', () => {
    expect(normalizePreviewLabel('  ')).toBeNull()
    expect(normalizePreviewLabel('  Ver staging  ')).toBe('Ver staging')
  })

  it('rechaza etiquetas demasiado largas', () => {
    expect(() => normalizePreviewLabel('x'.repeat(81))).toThrow('80')
  })
})

describe('listProjectPreviews', () => {
  it('devuelve las filas con signed URLs', async () => {
    h.state.previewRows = [previewRow(), previewRow({ id: 'preview-2' })]

    const result = await listProjectPreviews('p1')

    expect(result).toHaveLength(2)
    expect(result[0].url).toBe('https://cdn.example/preview.png')
    expect(h.storageFrom).toHaveBeenCalledWith('project-previews')
    expect(h.state.calls).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ method: 'eq', args: ['project_id', 'p1'] }),
        expect.objectContaining({
          method: 'createSignedUrl',
          args: ['p1/abc.png', 3600],
        }),
      ])
    )
  })

  it('deja url en null si no se puede firmar una imagen', async () => {
    h.state.previewRows = [previewRow()]
    h.state.signedResult = { data: null, error: { message: 'nope' } }

    const result = await listProjectPreviews('p1')

    expect(result[0].url).toBeNull()
  })

  it('propaga el error de la consulta', async () => {
    h.state.listError = { message: 'boom' }
    await expect(listProjectPreviews('p1')).rejects.toThrow('boom')
  })
})

describe('uploadProjectPreview', () => {
  const file = new File(['image'], 'home.png', { type: 'image/png' })

  it('sube el objeto, calcula la posición e inserta la fila', async () => {
    h.state.lastPosition = { position: 2 }
    h.state.insertResult = { data: previewRow({ position: 3 }), error: null }

    const result = await uploadProjectPreview('p1', file, {
      caption: '  Home  ',
      stage_id: 'stage-1',
      client_visible: false,
    })

    expect(result).toMatchObject({ id: 'preview-1', position: 3 })
    const uploadCall = h.state.calls.find((call) => call.method === 'upload')
    expect(uploadCall?.args[0]).toMatch(/^p1\/[^/]+\.png$/)
    const insertCall = h.state.calls.find((call) => call.method === 'insert')
    expect(insertCall?.args[0]).toMatchObject({
      project_id: 'p1',
      stage_id: 'stage-1',
      caption: 'Home',
      position: 3,
      client_visible: false,
    })
  })

  it('rechaza un archivo inválido sin subirlo', async () => {
    const invalid = new File(['x'], 'x.gif', { type: 'image/gif' })
    await expect(uploadProjectPreview('p1', invalid)).rejects.toThrow('Formato no permitido')
    expect(h.state.calls.some((call) => call.method === 'upload')).toBe(false)
  })

  it('hace rollback del objeto si falla el insert', async () => {
    h.state.lastPosition = null
    h.state.insertResult = { data: null, error: { message: 'insert failed' } }

    await expect(uploadProjectPreview('p1', file)).rejects.toThrow('insert failed')
    expect(h.state.calls.some((call) => call.method === 'remove')).toBe(true)
  })
})

describe('updateProjectPreview / deleteProjectPreview', () => {
  it('actualiza una captura', async () => {
    h.state.updateResult = {
      data: previewRow({ id: 'preview-1', client_visible: false }),
      error: null,
    }

    const result = await updateProjectPreview('preview-1', { client_visible: false })

    expect(result.client_visible).toBe(false)
    expect(h.state.calls).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ method: 'update', args: [{ client_visible: false }] }),
        expect.objectContaining({ method: 'eq', args: ['id', 'preview-1'] }),
      ])
    )
  })

  it('elimina primero el objeto y después la fila', async () => {
    await deleteProjectPreview({ id: 'preview-1', storage_path: 'p1/abc.png' })

    const removeIndex = h.state.calls.findIndex((call) => call.method === 'remove')
    const deleteIndex = h.state.calls.findIndex((call) => call.method === 'delete')
    expect(removeIndex).toBeGreaterThan(-1)
    expect(deleteIndex).toBeGreaterThan(removeIndex)
    expect(h.state.calls[removeIndex].args).toEqual([['p1/abc.png']])
  })

  it('no borra la fila si falla la eliminación del objeto', async () => {
    h.state.removeResult = { error: { message: 'storage failed' } }
    await expect(
      deleteProjectPreview({ id: 'preview-1', storage_path: 'p1/abc.png' })
    ).rejects.toThrow('storage failed')
    expect(h.state.calls.some((call) => call.method === 'delete')).toBe(false)
  })
})
