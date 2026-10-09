import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        options: {
          sitekey: string
          callback: (token: string) => void
          'expired-callback'?: () => void
          'error-callback'?: () => void
        },
      ) => string
      remove: (widgetId: string) => void
    }
  }
}

const SCRIPTS = new Map<string, Promise<void>>()

function loadTurnstileScript(): Promise<void> {
  const src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
  const cached = SCRIPTS.get(src)
  if (cached) return cached
  const promise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('No se pudo cargar Turnstile')))
      return
    }
    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.defer = true
    script.addEventListener('load', () => resolve())
    script.addEventListener('error', () => reject(new Error('No se pudo cargar Turnstile')))
    document.head.appendChild(script)
  })
  SCRIPTS.set(src, promise)
  return promise
}

interface TurnstileWidgetProps {
  siteKey: string
  onChange: (token: string) => void
}

/**
 * Widget de Cloudflare Turnstile sin dependencias externas.
 * Carga el script una sola vez y renderiza en modo explícito.
 */
export function TurnstileWidget({ siteKey, onChange }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function mount() {
      try {
        await loadTurnstileScript()
        if (cancelled || !containerRef.current || !window.turnstile) return
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: onChange,
          'expired-callback': () => onChange(''),
          'error-callback': () => onChange(''),
        })
      } catch {
        // Sin Turnstile el envío por función queda bloqueado (token faltante);
        // el error visual lo maneja el formulario.
      }
    }

    void mount()

    return () => {
      cancelled = true
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
      }
    }
    // siteKey no cambia en la práctica; onChange se recomienda estable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey])

  return <div ref={containerRef} className="mt-1" />
}