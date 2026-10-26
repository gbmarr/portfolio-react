import { useEffect, useRef, useState } from 'react'
import { TURNSTILE_ACTION } from '../shared/contact-contract'

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        options: {
          sitekey: string
          callback: (token: string) => void
          action?: string
          'expired-callback'?: () => void
          'error-callback'?: () => void
        }
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
  /** Acción esperada por la Edge Function (`contact` por defecto, `quote` para presupuestos). */
  action?: string
  onChange: (token: string) => void
  /** Evita descargar el script hasta que el widget se acerque al viewport o el formulario reciba foco. */
  lazy?: boolean
}

/**
 * Widget de Cloudflare Turnstile sin dependencias externas.
 * Carga el script una sola vez y renderiza en modo explícito.
 */
export function TurnstileWidget({
  siteKey,
  action = TURNSTILE_ACTION,
  onChange,
  lazy = false,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const [shouldLoad, setShouldLoad] = useState(!lazy)

  useEffect(() => {
    if (!lazy || shouldLoad) return

    const node = containerRef.current
    if (!node) return

    const form = node.closest('form')
    const activate = () => setShouldLoad(true)

    if (typeof IntersectionObserver === 'undefined') {
      activate()
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          activate()
          observer.disconnect()
        }
      },
      { rootMargin: '200px' }
    )

    observer.observe(node)
    form?.addEventListener('focusin', activate)

    return () => {
      observer.disconnect()
      form?.removeEventListener('focusin', activate)
    }
  }, [lazy, shouldLoad])

  useEffect(() => {
    if (!shouldLoad) return

    let cancelled = false

    async function mount() {
      try {
        await loadTurnstileScript()
        if (cancelled || !containerRef.current || !window.turnstile) return
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          action,
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
    // siteKey/action no cambian en la práctica; onChange se recomienda estable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldLoad, siteKey, action])

  return <div ref={containerRef} className="mt-1" />
}
