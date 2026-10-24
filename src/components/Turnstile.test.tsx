import { act, render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const TURNSTILE_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

/**
 * Mock del widget global de Cloudflare Turnstile (window.turnstile).
 * `render` devuelve un id estable para poder verificar `remove`.
 */
function makeTurnstileMock() {
  const render = vi.fn((_el: HTMLElement, _options: TurnstileOptions): string => {
    void _el
    void _options
    return 'widget-123'
  })
  const remove = vi.fn((_widgetId: string): void => {
    void _widgetId
  })
  return { render, remove }
}

function getScript() {
  const script = document.querySelector<HTMLScriptElement>(`script[src="${TURNSTILE_SRC}"]`)
  if (!script) throw new Error(`No se encontró el script de Turnstile (${TURNSTILE_SRC})`)
  return script
}

/** Dispara el evento `load` del script (resuelve la promesa de carga). */
function triggerScriptLoad() {
  act(() => {
    getScript().dispatchEvent(new Event('load'))
  })
}

/** Dispara el evento `error` del script (rechaza la promesa de carga). */
function triggerScriptError() {
  act(() => {
    getScript().dispatchEvent(new Event('error'))
  })
}

/**
 * Importa el componente con un módulo fresco (resetea el caché de scripts).
 * Necesario para aislar el branch `cached` / `existing` de loadTurnstileScript.
 */
async function loadFreshWidget() {
  vi.resetModules()
  const { TurnstileWidget } = await import('./Turnstile')
  return TurnstileWidget
}

interface TurnstileOptions {
  sitekey: string
  callback: (token: string) => void
  action?: string
  'expired-callback'?: () => void
  'error-callback'?: () => void
}

describe('TurnstileWidget', () => {
  let turnstile: ReturnType<typeof makeTurnstileMock>

  beforeEach(() => {
    turnstile = makeTurnstileMock()
    vi.stubGlobal('turnstile', turnstile)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    document.querySelectorAll(`script[src="${TURNSTILE_SRC}"]`).forEach((s) => s.remove())
    delete (window as { turnstile?: unknown }).turnstile
  })

  it('renderiza el contenedor e inicializa el widget con el sitekey', async () => {
    const Widget = await loadFreshWidget()
    const onChange = vi.fn()

    render(<Widget siteKey="site-key-1" onChange={onChange} />)
    triggerScriptLoad()

    await waitFor(() => expect(turnstile.render).toHaveBeenCalledTimes(1))
    const [el, options] = turnstile.render.mock.calls[0] as [HTMLElement, TurnstileOptions]
    expect(el).toBeInstanceOf(HTMLDivElement)
    expect(options.sitekey).toBe('site-key-1')
    expect(options.action).toBe('contact')
    expect(typeof options.callback).toBe('function')
  })

  it('usa la acción personalizada cuando se especifica', async () => {
    const Widget = await loadFreshWidget()
    const onChange = vi.fn()

    render(<Widget siteKey="site-key-1" action="quote" onChange={onChange} />)
    triggerScriptLoad()

    await waitFor(() => expect(turnstile.render).toHaveBeenCalledTimes(1))
    const options = turnstile.render.mock.calls[0][1] as TurnstileOptions
    expect(options.action).toBe('quote')
  })

  it('invoca onChange con el token cuando el captcha se resuelve', async () => {
    const Widget = await loadFreshWidget()
    const onChange = vi.fn()

    render(<Widget siteKey="site-key-1" onChange={onChange} />)
    triggerScriptLoad()

    await waitFor(() => expect(turnstile.render).toHaveBeenCalledTimes(1))
    const options = turnstile.render.mock.calls[0][1] as TurnstileOptions
    act(() => options.callback('token-abc'))

    expect(onChange).toHaveBeenCalledExactlyOnceWith('token-abc')
  })

  it('invoca onChange con cadena vacía cuando el captcha expira', async () => {
    const Widget = await loadFreshWidget()
    const onChange = vi.fn()

    render(<Widget siteKey="site-key-1" onChange={onChange} />)
    triggerScriptLoad()

    await waitFor(() => expect(turnstile.render).toHaveBeenCalledTimes(1))
    const options = turnstile.render.mock.calls[0][1] as TurnstileOptions
    act(() => options['expired-callback']?.())

    expect(onChange).toHaveBeenCalledWith('')
  })

  it('invoca onChange con cadena vacía cuando el captcha falla', async () => {
    const Widget = await loadFreshWidget()
    const onChange = vi.fn()

    render(<Widget siteKey="site-key-1" onChange={onChange} />)
    triggerScriptLoad()

    await waitFor(() => expect(turnstile.render).toHaveBeenCalledTimes(1))
    const options = turnstile.render.mock.calls[0][1] as TurnstileOptions
    act(() => options['error-callback']?.())

    expect(onChange).toHaveBeenCalledWith('')
  })

  it('no crashea ni inicializa si window.turnstile está ausente', async () => {
    delete (window as { turnstile?: unknown }).turnstile
    vi.unstubAllGlobals()

    const Widget = await loadFreshWidget()
    const onChange = vi.fn()

    render(<Widget siteKey="site-key-1" onChange={onChange} />)
    triggerScriptLoad()
    await act(async () => {})

    expect(turnstile.render).not.toHaveBeenCalled()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('no crashea y degrada si siteKey es vacío', async () => {
    const Widget = await loadFreshWidget()
    const onChange = vi.fn()

    render(<Widget siteKey="" onChange={onChange} />)
    triggerScriptLoad()

    await waitFor(() => expect(turnstile.render).toHaveBeenCalledTimes(1))
    const options = turnstile.render.mock.calls[0][1] as TurnstileOptions
    expect(options.sitekey).toBe('')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('no crashea si no se puede cargar el script de Turnstile', async () => {
    const Widget = await loadFreshWidget()
    const onChange = vi.fn()

    render(<Widget siteKey="site-key-1" onChange={onChange} />)
    triggerScriptError()
    await act(async () => {})

    expect(turnstile.render).not.toHaveBeenCalled()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('reutiliza un script existente en el DOM sin duplicarlo', async () => {
    const existing = document.createElement('script')
    existing.src = TURNSTILE_SRC
    document.head.appendChild(existing)

    const Widget = await loadFreshWidget()
    const onChange = vi.fn()

    render(<Widget siteKey="site-key-1" onChange={onChange} />)
    triggerScriptLoad()

    await waitFor(() => expect(turnstile.render).toHaveBeenCalledTimes(1))
    expect(document.querySelectorAll(`script[src="${TURNSTILE_SRC}"]`)).toHaveLength(1)
  })

  it('reutiliza la promesa de carga cacheada en montajes posteriores', async () => {
    const Widget = await loadFreshWidget()

    const first = render(<Widget siteKey="site-key-1" onChange={vi.fn()} />)
    triggerScriptLoad()
    await waitFor(() => expect(turnstile.render).toHaveBeenCalledTimes(1))

    render(<Widget siteKey="site-key-1" onChange={vi.fn()} />)
    await waitFor(() => expect(turnstile.render).toHaveBeenCalledTimes(2))

    // No se agrega un segundo <script>: el módulo cacheó la promesa.
    expect(document.querySelectorAll(`script[src="${TURNSTILE_SRC}"]`)).toHaveLength(1)
    first.unmount()
  })

  it('remueve el widget al desmontar', async () => {
    const Widget = await loadFreshWidget()
    const { unmount } = render(<Widget siteKey="site-key-1" onChange={vi.fn()} />)
    triggerScriptLoad()

    await waitFor(() => expect(turnstile.render).toHaveBeenCalledTimes(1))
    unmount()

    expect(turnstile.remove).toHaveBeenCalledExactlyOnceWith('widget-123')
  })

  it('no inicializa el widget si se desmonta antes de cargar el script', async () => {
    const Widget = await loadFreshWidget()
    const { unmount } = render(<Widget siteKey="site-key-1" onChange={vi.fn()} />)

    unmount()
    triggerScriptLoad()
    await act(async () => {})

    expect(turnstile.render).not.toHaveBeenCalled()
    expect(turnstile.remove).not.toHaveBeenCalled()
  })
})
