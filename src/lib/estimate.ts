import {
  estimateExtras,
  estimateTiers,
  isExtraAllowed,
  type EstimateTierId,
} from '../data/estimate'
import { QUOTE_SECTIONS } from '../shared/quote-contract'

export interface EstimateInput {
  tier: EstimateTierId
  sections: number
  extras: string[]
}

export interface EstimateBreakdownItem {
  id: string
  label: string
  amountUsd: number
}

export interface EstimateResult {
  baseUsd: number
  extrasUsd: number
  totalUsd: number
  minUsd: number
  maxUsd: number
  breakdown: EstimateBreakdownItem[]
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

/**
 * Cálculo de referencia (solo lectura, uso interno en panel admin).
 * No expone precios al público.
 */
export function computeEstimate(input: EstimateInput): EstimateResult {
  const tier = findTier(input.tier)
  const baseUsd = tier.baseUsd

  const validExtras = input.extras.filter((extraId) => isExtraAllowed(input.tier, extraId))
  let extrasUsd = 0
  const breakdown: EstimateBreakdownItem[] = []

  for (const extraId of validExtras) {
    const extra = estimateExtras.find((item) => item.id === extraId)
    if (!extra) continue

    let amountUsd = 0
    if (extra.kind === 'fixed' && typeof extra.amountUsd === 'number') {
      amountUsd = extra.amountUsd
    } else if (extra.kind === 'percent' && typeof extra.percent === 'number') {
      amountUsd = Math.round(baseUsd * (extra.percent / 100))
    }

    if (amountUsd <= 0) continue
    extrasUsd += amountUsd
    breakdown.push({
      id: extra.id,
      label: extra.label,
      amountUsd,
    })
  }

  const totalUsd = baseUsd + extrasUsd
  const minUsd = Math.round(totalUsd * 0.9)
  const maxUsd = Math.round(totalUsd * 1.1)

  return {
    baseUsd,
    extrasUsd,
    totalUsd,
    minUsd,
    maxUsd,
    breakdown,
  }
}
