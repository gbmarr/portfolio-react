import { useEffect, useRef, useState } from 'react'

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
 */
export function useScrollReveal<T extends HTMLElement>(threshold = 0.15): ScrollRevealResult<T> {
  const ref = useRef<T>(null)
  const [isVisible, setIsVisible] = useState(() => {
    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      return true
    }
    return false
  })

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
      { threshold },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [isVisible, threshold])

  return { ref, isVisible }
}
