import { useCallback, useState } from 'react'
import { guideStepIds, guideTotalSteps, type GuideSection } from '../data/clientGuide'

export const GUIDE_PROGRESS_STORAGE_KEY = 'portfolio-guide-progress-v1'

function readProgress(): Set<string> {
  if (typeof window === 'undefined') return new Set()

  try {
    const raw = window.localStorage.getItem(GUIDE_PROGRESS_STORAGE_KEY)
    if (!raw) return new Set()

    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return new Set()

    return new Set(
      parsed.filter((id): id is string => typeof id === 'string' && guideStepIds.has(id))
    )
  } catch {
    return new Set()
  }
}

function writeProgress(completed: Set<string>) {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(GUIDE_PROGRESS_STORAGE_KEY, JSON.stringify([...completed]))
  } catch {
    // Sin localStorage el progreso funciona igual durante la sesión.
  }
}

/** Progreso de la guía persistido en el navegador (sin base de datos). */
export function useGuideProgress() {
  const [completed, setCompleted] = useState<Set<string>>(() => readProgress())

  const toggleStep = useCallback((id: string) => {
    if (!guideStepIds.has(id)) return

    setCompleted((current) => {
      const next = new Set(current)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      writeProgress(next)
      return next
    })
  }, [])

  const reset = useCallback(() => {
    setCompleted(new Set())
    if (typeof window === 'undefined') return

    try {
      window.localStorage.removeItem(GUIDE_PROGRESS_STORAGE_KEY)
    } catch {
      // Nada que limpiar.
    }
  }, [])

  const sectionProgress = useCallback(
    (section: GuideSection) => {
      const done = section.steps.filter((step) => completed.has(step.id)).length
      const total = section.steps.length
      return { done, total, percent: total === 0 ? 0 : Math.round((done / total) * 100) }
    },
    [completed]
  )

  const done = completed.size
  const percent = guideTotalSteps === 0 ? 0 : Math.round((done / guideTotalSteps) * 100)

  return {
    completed,
    toggleStep,
    reset,
    done,
    total: guideTotalSteps,
    percent,
    sectionProgress,
  }
}
