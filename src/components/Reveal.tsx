import type { CSSProperties, ReactNode } from 'react'
import { useScrollReveal } from '../hooks/useScrollReveal'

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
}

/**
 * Wraps content and animates it into view on first scroll intersection.
 * Respects `prefers-reduced-motion` (via the hook) by rendering visible immediately.
 */
export function Reveal({ children, className = '', delay = 0 }: RevealProps) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()

  const style: CSSProperties = delay > 0 ? { transitionDelay: `${delay}ms` } : {}

  return (
    <div
      ref={ref}
      style={style}
      className={`transition-all duration-500 ease-out ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  )
}
