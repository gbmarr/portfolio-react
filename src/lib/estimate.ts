import { estimateTiers, isExtraAllowed, type EstimateTierId } from '../data/estimate'
import { QUOTE_SECTIONS } from '../shared/quote-contract'

export interface EstimateInput {
  tier: EstimateTierId
  sections: number
  extras: string[]
}

export const MIN_SECTIONS = QUOTE_SECTIONS.min
export const MAX_SECTIONS = QUOTE_SECTIONS.max

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function findTier(tier: EstimateTierId) {
  return estimateTiers.find((item) => item.id === tier) ?? estimateTiers[0]
}

/**
 * Plazo orientativo del proyecto. No es un presupuesto ni un compromiso:
 * solo ayuda a dimensionar la propuesta.
 *
 * - Parte del plazo base del tier.
 * - Si es institucional y supera 5 secciones, suma una semana.
 * - Si el proyecto suma 4 o más extras válidos, suma otra semana.
 */
export function buildEstimateTimeline(input: EstimateInput): string {
  const tier = findTier(input.tier)
  const minWeeks = tier.timeline.minWeeks
  let maxWeeks = tier.timeline.maxWeeks

  const sections =
    input.tier === 'institucional' ? clamp(input.sections, MIN_SECTIONS, MAX_SECTIONS) : 0

  if (input.tier === 'institucional' && sections > 5) {
    maxWeeks += 1
  }

  const validExtras = new Set(
    input.extras.filter((extraId) => isExtraAllowed(input.tier, extraId))
  )

  if (validExtras.size >= 4) {
    maxWeeks += 1
  }

  return `${minWeeks} a ${maxWeeks} semanas`
}
