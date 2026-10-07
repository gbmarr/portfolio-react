import type { ReactNode } from 'react'
import type { BadgeTone } from '../../data/panel'

interface BadgeProps {
  children: ReactNode
  tone?: BadgeTone
}

const toneClasses: Record<BadgeTone, string> = {
  neutral: 'border-border bg-background text-text-muted',
  progress: 'border-accent/40 bg-accent/10 text-accent',
  review: 'border-amber-400/40 bg-amber-400/10 text-amber-300',
  done: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300',
  blocked: 'border-slate-400/40 bg-slate-400/10 text-slate-300',
  danger: 'border-red-400/40 bg-red-400/10 text-red-300',
}

/** Pastilla de estado reutilizable (proyectos, etapas, pagos). */
export function Badge({ children, tone = 'neutral' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${toneClasses[tone]}`}
    >
      {children}
    </span>
  )
}
