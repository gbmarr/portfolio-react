import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { LOGIN_COOLDOWN_STORAGE_KEY, useEmailCooldown } from './useEmailCooldown'

beforeEach(() => {
  window.localStorage.clear()
})

afterEach(() => {
  window.localStorage.clear()
})

describe('useEmailCooldown', () => {
  it('inicia el cooldown y lo persiste por email', () => {
    const { result } = renderHook(({ email }) => useEmailCooldown(email), {
      initialProps: { email: 'cliente@test.com' },
    })

    act(() => result.current.start('cliente@test.com'))

    expect(result.current.coolingDown).toBe(true)
    expect(result.current.remaining).toBeGreaterThan(0)
    expect(
      JSON.parse(window.localStorage.getItem(LOGIN_COOLDOWN_STORAGE_KEY) ?? '{}')
    ).toMatchObject({ email: 'cliente@test.com' })
  })

  it('recupera el cooldown al volver a montar con el mismo email', async () => {
    const first = renderHook(() => useEmailCooldown('cliente@test.com'))
    act(() => first.result.current.start('cliente@test.com'))
    first.unmount()

    const second = renderHook(() => useEmailCooldown('cliente@test.com'))

    await waitFor(() => expect(second.result.current.coolingDown).toBe(true))
  })

  it('libera el cooldown al borrar el email', async () => {
    const { result, rerender } = renderHook(({ email }) => useEmailCooldown(email), {
      initialProps: { email: 'cliente@test.com' },
    })
    act(() => result.current.start('cliente@test.com'))
    expect(result.current.coolingDown).toBe(true)

    rerender({ email: '' })

    await waitFor(() => expect(result.current.remaining).toBe(0))
    expect(result.current.coolingDown).toBe(false)
  })

  it('no aplica el cooldown de un email a otro distinto', async () => {
    const { result, rerender } = renderHook(({ email }) => useEmailCooldown(email), {
      initialProps: { email: 'cliente@test.com' },
    })
    act(() => result.current.start('cliente@test.com'))

    rerender({ email: 'otro@test.com' })

    await waitFor(() => expect(result.current.coolingDown).toBe(false))
  })

  it('permite limpiar el cooldown manualmente', () => {
    const { result } = renderHook(() => useEmailCooldown('cliente@test.com'))
    act(() => result.current.start('cliente@test.com'))

    act(() => result.current.clear())

    expect(result.current.coolingDown).toBe(false)
    expect(window.localStorage.getItem(LOGIN_COOLDOWN_STORAGE_KEY)).toBeNull()
  })
})
