import type { SkillLevel } from '../data/types'

interface SkillBadgeProps {
  name: string
  level?: SkillLevel
}

const levelMeta = {
  beginner: { label: 'Nivel principiante', dotClass: 'bg-text-muted' },
  intermediate: { label: 'Nivel intermedio', dotClass: 'bg-accent' },
  advanced: { label: 'Nivel avanzado', dotClass: 'bg-accent-violet' },
} as const

export function SkillBadge({ name, level }: SkillBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-light/60 px-3 py-1 text-sm text-text-muted transition-colors duration-200 hover:border-accent/50 hover:text-text">
      {level ? (
        <span aria-label={levelMeta[level].label} className={`h-2 w-2 rounded-full ${levelMeta[level].dotClass}`} />
      ) : null}
      {name}
    </span>
  )
}
