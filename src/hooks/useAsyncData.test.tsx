import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { useAsyncData } from './useAsyncData'
import { panelCopy } from '../data/panel'

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

function Probe({
  loader,
  dep = 0,
  mapError,
}: {
  loader: () => Promise<string>
  dep?: number
  mapError?: (error: unknown) => string
}) {
  const { data, error, loading, reload, setData } = useAsyncData(loader, [loader, dep], {
    mapError,
  })
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="data">{data ?? 'none'}</span>
      <span data-testid="error">{error ?? 'none'}</span>
      <button
        type="button"
        onClick={() => {
          void reload().catch(() => {})
        }}
      >
        reload
      </button>
      <button type="button" onClick={() => setData((current) => `${current ?? ''}!`)}>
        setData
      </button>
    </div>
  )
}

describe('useAsyncData', () => {
  it('expone los datos cuando el loader resuelve', async () => {
    const loader = vi.fn().mockResolvedValue('ok')

    render(<Probe loader={loader} />)
    expect(screen.getByTestId('loading')).toHaveTextContent('true')

    expect(await screen.findByText('ok')).toBeInTheDocument()
    expect(screen.getByTestId('loading')).toHaveTextContent('false')
    expect(screen.getByTestId('error')).toHaveTextContent('none')
  })

  it('mapea el error al mensaje genérico por defecto', async () => {
    const loader = vi.fn().mockRejectedValue(new Error('boom'))

    render(<Probe loader={loader} />)

    expect(await screen.findByText(panelCopy.error.generic)).toBeInTheDocument()
    expect(screen.getByTestId('data')).toHaveTextContent('none')
    expect(screen.getByTestId('loading')).toHaveTextContent('false')
  })

  it('usa mapError cuando se provee', async () => {
    const loader = vi.fn().mockRejectedValue(new Error('Proyecto no encontrado'))

    render(<Probe loader={loader} mapError={() => 'No encontrado'} />)

    expect(await screen.findByText('No encontrado')).toBeInTheDocument()
  })

  it('reload vuelve a ejecutar el loader', async () => {
    const user = userEvent.setup()
    const loader = vi.fn().mockResolvedValueOnce('primero').mockResolvedValueOnce('segundo')

    render(<Probe loader={loader} />)
    await screen.findByText('primero')

    await user.click(screen.getByRole('button', { name: 'reload' }))

    expect(await screen.findByText('segundo')).toBeInTheDocument()
    expect(loader).toHaveBeenCalledTimes(2)
  })

  it('reload no pisa los datos si falla', async () => {
    const user = userEvent.setup()
    const loader = vi.fn().mockResolvedValueOnce('primero').mockRejectedValueOnce(new Error('boom'))

    render(<Probe loader={loader} />)
    await screen.findByText('primero')

    await user.click(screen.getByRole('button', { name: 'reload' }))
    await waitFor(() => expect(loader).toHaveBeenCalledTimes(2))

    expect(screen.getByText('primero')).toBeInTheDocument()
    expect(screen.getByTestId('error')).toHaveTextContent('none')
  })

  it('descarta resultados obsoletos cuando cambian las deps', async () => {
    const first = deferred<string>()
    const loader = vi.fn().mockReturnValueOnce(first.promise).mockResolvedValueOnce('nuevo')

    const { rerender } = render(<Probe loader={loader} dep={0} />)
    rerender(<Probe loader={loader} dep={1} />)

    expect(await screen.findByText('nuevo')).toBeInTheDocument()

    await act(async () => {
      first.resolve('viejo')
    })

    expect(screen.queryByText('viejo')).not.toBeInTheDocument()
    expect(screen.getByText('nuevo')).toBeInTheDocument()
  })

  it('no actualiza el estado después de desmontar', async () => {
    const pending = deferred<string>()
    const loader = vi.fn().mockReturnValue(pending.promise)

    const { unmount } = render(<Probe loader={loader} />)
    unmount()

    await act(async () => {
      pending.resolve('tarde')
    })

    expect(screen.queryByTestId('data')).not.toBeInTheDocument()
  })

  it('permite actualizar los datos localmente con setData', async () => {
    const user = userEvent.setup()
    const loader = vi.fn().mockResolvedValue('a')

    render(<Probe loader={loader} />)
    await screen.findByText('a')

    await user.click(screen.getByRole('button', { name: 'setData' }))

    expect(screen.getByText('a!')).toBeInTheDocument()
  })
})
