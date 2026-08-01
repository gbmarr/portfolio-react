import type { SkillLevel } from '../data/types'
import { useLanguage } from '../i18n/LanguageContext'

interface SkillBadgeProps {
  name: string
  level?: SkillLevel
}

export function SkillBadge({ name, level }: SkillBadgeProps) {
  const { t } = useLanguage()

  const levelMeta = {
    beginner: { label: t.skillLevels.beginner, dotClass: 'bg-text-muted' },
    intermediate: { label: t.skillLevels.intermediate, dotClass: 'bg-accent' },
    advanced: { label: t.skillLevels.advanced, dotClass: 'bg-accent-violet' },
  } as const

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-light/60 px-3 py-1 text-sm text-text-muted transition-colors duration-200 hover:border-accent/50 hover:text-text">
      {level ? (
        <span
          aria-label={levelMeta[level].label}
          className={`h-2 w-2 rounded-full ${levelMeta[level].dotClass}`}
        />
      ) : null}
      {name}
    </span>
  )
}
