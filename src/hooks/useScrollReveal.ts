import { useEffect, useLayoutEffect, useRef, useState } from 'react'

interface ScrollRevealResult<T extends HTMLElement> {
  ref: React.RefObject<T | null>
  isVisible: boolean
}

function prefersReducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
}

/**
 * Reveals an element once it scrolls into view.
 * Falls back to "immediately visible" when IntersectionObserver is
 * unavailable or the user prefers reduced motion.
 *
 * El primer frame se resuelve antes del paint: si el elemento ya está en el
 * viewport al montar (above the fold), se muestra sin esperar al observer.
 * Sin esto, el contenido de la primera pantalla parpadea invisible.
 */
export function useScrollReveal<T extends HTMLElement>(threshold = 0.15): ScrollRevealResult<T> {
  const ref = useRef<T>(null)
  const [isVisible, setIsVisible] = useState(() => {
    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      return true
    }
    return false
  })

  useLayoutEffect(() => {
    if (isVisible) return
    const element = ref.current
    if (!element || typeof element.getBoundingClientRect !== 'function') return

    const rect = element.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setIsVisible(true)
    }
  }, [isVisible])

  useEffect(() => {
    if (isVisible) return
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsVisible(true)
            observer.disconnect()
          }
        }
      },
      { threshold }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [isVisible, threshold])

  return { ref, isVisible }
}
