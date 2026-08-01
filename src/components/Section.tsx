import type { HTMLAttributes, ReactNode } from 'react'

interface SectionProps extends HTMLAttributes<HTMLElement> {
  id?: string
  children: ReactNode
}

export function Section({ id, children, className = '', ...rest }: SectionProps) {
  return (
    <section id={id} className={`py-20 sm:py-24 ${className}`} {...rest}>
      {children}
    </section>
  )
}
